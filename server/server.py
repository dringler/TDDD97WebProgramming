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

#hash password
def hashPw(password):
    salt = uuid.uuid4().hex
    hashed_password = hashlib.sha512(password + salt).hexdigest()
    return hashed_password, salt

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

@app.route('/sign_in')
def sign_in():
    email = request.form['loginUsernameInput']
    password = request.form['loginPasswordInput']
    #query user db
    userInfo = database_helper.getUser(email, password) #userInfo[0] = email, userInfo[1] = pw, userInfo[2] = salt

    #check is user is found in db
    if userInfo != None:
        #check if password is correct
        hashedPassword, salt = hashPw(password)
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

@app.route('/sign_up')
def sign_up():
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
            return json.dumps({"success": "true", "message": "Sign up successful.", "data": token})
        else:
            return json.dumps({"success": "false", "message": "Inserting the user into the database failed."})
    else:
        return json.dumps({"success": "false", "message": "User already exists."})  

@app.route('/sign_out')
def sign_out():
    token = request.headers.get('token')
    #delete token/email from active users
    if token in active_users:
        del active_users[token]
        return json.dumps({"success": "true", "message": "Sign out successful."})
    else:
        return json.dumps({"success": "false", "message": "Not signed in."})  


@app.route('/change_password')
def change_password(token, old_password, new_password):
    token = request.headers.get('token')
    email = get_email_by_token(token)
    oldPW = request.form['oldPasswordChange']
    newPW = request.form['newPasswordChange']

    userInfo = database_helper.get_user(email, oldPW)
    if userInfo != None: #userInfo[0] = email, userInfo[1] = pw, userInfo[2] = salt
        oldHashedPW, oldSalt = hashPW(oldPW)
        #check old PW
        if (userInfo[1] == oldHashedPW):
            newHashedPW, newSalt = hashPW(newPW)
            query_db('UPDATE users SET passwordHash=?, salt=? WHERE email=?', [newHashedPW, newSalt, email])
            return json.dumps({"success": "true", "message": "Password changed."})
        else:
            return json.dumps({"success": "false", "message": "Incorrect password."})  

    else:
        return json.dumps({"success": "false", "message": "No user found."}) 

@app.route('/get_user_data_by_token')
def get_user_data_by_token(token):
    return 'get_user_data_by_token'

@app.route('/get_user_data_by_email')
def get_user_data_by_email(token, email):
    return 'get_user_data_by_email'

@app.route('/get_user_messages_by_token')
def get_user_messages_by_token(token):
    return 'get_user_messages_by_token'

@app.route('/get_user_messages_by_email')
def get_user_messages_by_email(token, email):
    return 'get_user_messages_by_email'

@app.route('/post_message')
def post_message(token, message, email):
    return 'post_message'      

#################################################

if __name__ == '__main__':
    conn = database_helper.connect_db()
    app.run()
    database_helper.close_db(conn)
