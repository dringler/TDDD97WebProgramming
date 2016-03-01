from flask import app, request, g
from flask import Flask
import database_helper
import json
import hashlib, uuid
import string
import random

app = Flask(__name__)
app.debug = True

active_users = {}

#################################################
# HELPER FUNCTIONS
#################################################

#hash password
def hashPw(password):
    salt = uuid.uuid4().hex
    hashed_password = hashlib.sha512(password + salt).hexdigest()
    return hashed_password, salt

#get hashed password with salt
def getHashedPW(password, salt):
    hashedPassword = hashlib.sha512(password + salt).hexdigest()
    return hashedPassword

#create unique token
def get_unique_token():
    token = create_token()
    while token in active_users:
        token = create_token()
    return token

#create random token
def create_token():
    lst = [random.choice(string.ascii_letters + string.digits) for n in xrange(37)]
    token = "".join(lst)
    return token

#get user email by token
def get_email_by_token(token):
    return active_users[token]

#get user data
def get_user_data(token, email):
    if token in active_users:
        userInfo = database_helper.get_user_info_by_mail(email) #email,fistName,familyName,gender,city,country
        jsonString = {'email': userInfo[0], 'firstname': userInfo[1], 'familyname': userInfo[2], 'gender': userInfo[3], 'city': userInfo[4], 'country': userInfo[5]}
        return json.dumps({"success": "true", "message": "User data returned.", "data": jsonString })
    else:
        return json.dumps({"success": "false", "message": "User is not signed in."}) 

#get user messages
def get_user_messages(token, email):
    if token in active_users:
        userMessages = database_helper.get_user_messages_by_email(email) #toUser, fromUser, messageContent
        keys = ['toUser', 'fromUser','messageContent']
        jsonString = dict(zip(keys, zip(*userMessages)))
        return json.dumps({"success": "true", "message": "User messages returned.", "data": jsonString })
    else:
        return json.dumps({"success": "false", "message": "User is not signed in."}) 

#################################################

@app.before_request
def before_request():
    conn  = database_helper.connect_db()

@app.teardown_request
def teardown_request(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

#################################################

@app.route('/')
def hello():
    return 'Hello World!'

@app.route('/sign_in', methods=['POST'])
def sign_in(): #email, password
    email = request.form['loginUsernameInput']
    password = request.form['loginPasswordInput']
    #query user db
    userInfo = database_helper.get_user_mail_pw(email, password) #userInfo[0] = email, userInfo[1] = pw, userInfo[2] = salt

    #check is user is found in db
    if userInfo != None:
        #check if password is correct
        hashedPassword = getHashedPW(password, userInfo[2])
        if (hashedPassword == userInfo[1]):
            #get token
            token = get_unique_token()
            #add token and mail to active users list
            active_users[token] = email
            return json.dumps({"success": "true", "message": "Sign in successful.", "data": token})    
        else:
            return json.dumps({"success": "false", "message": "Invalid password."})
    else:
        return json.dumps({"success": "false", "message": "Username not found."})        

@app.route('/sign_up', methods=['POST'])
def sign_up(): #email, password, firstname, familyname, gender, city, country
    email = request.form['signupUsernameInput']
    password = request.form['signupPasswordInput']
    firstName = request.form['signupFirstnameInput']
    familyName = request.form['signupLastnameInput'] 
    gender = request.form['signupGenderInput']
    city = request.form['signupCityInput']
    country = request.form['signupCountryInput']

    #check is user already exists
    userExists = database_helper.user_exists(email)
    if (userExists == False):
        #hash password
        hashedPassword, salt = hashPw(password)
        #insert new user into db
        database_helper.insert_user(email, hashedPassword, salt, firstName, familyName, gender, city, country)
        #check if user was corretly inserted into the db
        if (database_helper.user_exists(email) == True):
            #get token
            token = get_unique_token()
            #add token and mail to active users list
            active_users[token] = email
            return json.dumps({"success": "true", "message": "Sign up successful.", "data": token})
        else:
            return json.dumps({"success": "false", "message": "Inserting the user into the database failed."})
    else:
        return json.dumps({"success": "false", "message": "User already exists."})  

@app.route('/sign_out', methods=['POST'])
def sign_out(): #token
    token = request.headers.get('token')
    #delete token/email from active users
    if token in active_users:
        del active_users[token]
        return json.dumps({"success": "true", "message": "Sign out successful."})
    else:
        return json.dumps({"success": "false", "message": "Not signed in."})  


@app.route('/change_password', methods=['POST'])
def change_password(): #token, old_password, new_password
    token = request.headers.get('token')
    email = get_email_by_token(token)
    oldPW = request.form['oldPasswordChange']
    newPW = request.form['newPasswordChange']

    userInfo = database_helper.get_user_mail_pw(email, oldPW)
    if userInfo != None: #userInfo[0] = email, userInfo[1] = pw, userInfo[2] = salt
        oldHashedPW = getHashedPW(oldPW, userInfo[2])
        #check old PW
        if (userInfo[1] == oldHashedPW):
            newHashedPW, newSalt = hashPw(newPW)
            database_helper.query_db('UPDATE users SET passwordHash=?, salt=? WHERE email=?', [newHashedPW, newSalt, email])
            return json.dumps({"success": "true", "message": "Password changed."})
        else:
            return json.dumps({"success": "false", "message": "Incorrect password."})  

    else:
        return json.dumps({"success": "false", "message": "No user found."}) 

@app.route('/get_user_data_by_token', methods=['GET'])
def get_user_data_by_token(): #token
    token = request.headers.get('token')
    email = get_email_by_token(token)
    return get_user_data(token, email)
    
@app.route('/get_user_data_by_email', methods=['GET'])
def get_user_data_by_email(): #token, email
    token = request.headers.get('token')
    email = request.headers.get('email')
    return get_user_data(token, email)  

@app.route('/get_user_messages_by_token', methods=['GET'])
def get_user_messages_by_token(): #token
    token = request.headers.get('token')
    email = get_email_by_token(token)
    return get_user_messages(token, email)

@app.route('/get_user_messages_by_email', methods=['GET'])
def get_user_messages_by_email(): #token, email
    token = request.headers.get('token')
    email = request.headers.get('email')
    return get_user_messages(token, email)

@app.route('/post_message', methods=['POST'])
def post_message(): #token, message, toEmail
    token = request.headers.get('token')
    fromUser = get_email_by_token(token)

#update form IDs
    toUser = request.form['searchUserID']
    message = request.form['postareaBrowse']
    if token in active_users:
        database_helper.post_message(toUser, fromUser, message)
        return json.dumps({"success": "true", "message": "Message posted."})
    else:
        return json.dumps({"success": "false", "message": "User is not signed in."})

#################################################

if __name__ == '__main__':
    #conn = database_helper.connect_db()
    app.run()
    #database_helper.close_db(conn)
