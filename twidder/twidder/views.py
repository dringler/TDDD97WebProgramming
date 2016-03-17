from flask import app, request, g
from flask import Flask
from twidder import app, sockets
import database_helper
import json
import hashlib, uuid
import string
import random
import hmac
import base64

active_users = {}
active_sockets = {}

privateKey = "myprivatekey";

#################################################
# HELPER FUNCTIONS
#################################################

#hash function for checking the validity of the user
def hashHMAC(stringToHash):
    message = bytes(stringToHash).encode('utf-8')
    secret = bytes(privateKey).encode('utf-8')
    signature = base64.b64encode(hmac.new(secret, message, digestmod=hashlib.sha256).digest())
    return signature

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

#init database connection
@app.before_request
def before_request():
    conn  = database_helper.connect_db()

#close database connection
@app.teardown_request
def teardown_request(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

#################################################
## Web Sockets
#################################################

#connect web socket
@app.route('/connect_socket')
def connect_socket():
    if request.environ.get("wsgi.websocket"):
        ws = request.environ["wsgi.websocket"]
        while True:
            try:
                current_email = ws.receive()
                if current_email in active_sockets:
                    #close old session
                    active_sockets[current_email].send("sign_out")
                active_sockets[current_email] = ws
            except WebSocketError as e:
                print(str(e))

#################################################

@app.route('/')
def get_indexPage():
    return app.send_static_file("client.html")

#sign-in request
@app.route('/sign_in', methods=['POST'])
def sign_in(): #email, password
    email = request.form['username']
    password = request.form['password']
    hashedServerRequest = request.form['hashedServerRequest']

    #check client request
    combinedUserData = email+password
    hashedRequestData = hashHMAC(combinedUserData)
    if (hashedServerRequest == hashedRequestData):
        #query user db
        userInfo = database_helper.get_user_mail_pw(email, password) #userInfo[0] = email, userInfo[1] = hashedPw, userInfo[2] = salt

        #check is user is found in db
        if userInfo != None:
            #check if password is correct
            hashedPassword = getHashedPW(password, userInfo[2])
            if (hashedPassword == userInfo[1]):
                #get token
                token = get_unique_token()
                #add token and mail to active users list
                active_users[token] = email
                #active_users[email] = token
                return json.dumps({"success": "true", "message": "Sign in successful.", "data": token})    
            else:
                return json.dumps({"success": "false", "message": "Invalid password."})
        else:
            return json.dumps({"success": "false", "message": "Username not found."})        
    else:
        return json.dumps({"success": "false", "message": "Hashed server request is wrong."})        

#sign-up request
@app.route('/sign_up', methods=['POST'])
def sign_up(): #email, password, firstname, familyname, gender, city, country
    email = request.form['username']
    password = request.form['password']
    firstName = request.form['firstName']
    familyName = request.form['familyName'] 
    gender = request.form['gender']
    city = request.form['city']
    country = request.form['country']

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
            #active_users[token] = email
            #active_users[email] = token
            return json.dumps({"success": "true", "message": "Sign up successful.", "data": token})
        else:
            return json.dumps({"success": "false", "message": "Inserting the user into the database failed."})
    else:
        return json.dumps({"success": "false", "message": "User already exists."})  

#sign-out request
@app.route('/sign_out', methods=['POST'])
def sign_out(): #username, uhash
    username = request.form['username']
    uHash = request.form['uHash']
    # get token from email
    for t, u in active_users.iteritems():
        if u == username:
            token = t
    # create server hash
    combinedString = token + username + privateKey
    serverGeneratedHash = hashHMAC(combinedString)
    # compare hashes
    if (uHash == serverGeneratedHash):
        #delete token/email from active users
        if token in active_users:
            del active_users[token]
            return json.dumps({"success": "true", "message": "Sign out successful."})
        else:
            return json.dumps({"success": "false", "message": "Not signed in."})
    else:
        return json.dumps({"success": "false", "message": "Submitted hash for token does not match."})

#change password request
@app.route('/change_password', methods=['POST'])
def change_password(): #token, old_password, new_password
    uHash = request.form['uHash']
    email = request.form['username']
    oldPW = request.form['oldPassword']
    newPW = request.form['newPassword']

    # get token from email
    for t, u in active_users.iteritems():
        if u == email:
            token = t
    # create server hash
    combinedString = token + email + oldPW + newPW + privateKey
    serverGeneratedHash = hashHMAC(combinedString)
    # compare hashes
    if (uHash == serverGeneratedHash):
        userInfo = database_helper.get_user_mail_pw(email, oldPW)
        if userInfo != None: #userInfo[0] = email, userInfo[1] = pw, userInfo[2] = salt
            oldHashedPW = getHashedPW(oldPW, userInfo[2])
            #check old PW
            if (userInfo[1] == oldHashedPW):
                newHashedPW, newSalt = hashPw(newPW)
                database_helper.change_pw(newHashedPW, newSalt, email)
                return json.dumps({"success": "true", "message": "Password changed."})
            else:
                return json.dumps({"success": "false", "message": "Incorrect password."})  

        else:
            return json.dumps({"success": "false", "message": "No user found."}) 
    else:
        return json.dumps({"success": "false", "message": "Hashed server request is wrong."})        

#get user data by token
@app.route('/get_user_data_by_token/<email>/<path:uHash>', methods=['GET'])
def get_user_data_by_token(email, uHash):
    # get token from email
    for t, u in active_users.iteritems():
        if u == email:
            token = t
    # create server hash
    combinedString = token + email + privateKey
    serverGeneratedHash = hashHMAC(combinedString)
    # compare hashes
    if (uHash == serverGeneratedHash):
        return get_user_data(token, email)

#get user data by email    
@app.route('/get_user_data_by_email/<email>/<fromEmail>/<path:uHash>', methods=['GET'])
def get_user_data_by_email(email, fromEmail, uHash):
    # get token from email
    for t, u in active_users.iteritems():
        if u == email:
            token = t
    # create server hash
    combinedString = token + email + fromEmail+ privateKey
    serverGeneratedHash = hashHMAC(combinedString)
    # compare hashes
    if (uHash == serverGeneratedHash):
        return get_user_data(token, fromEmail)  

#get user messages by token
@app.route('/get_user_messages_by_token/<email>/<path:uHash>', methods=['GET'])
def get_user_messages_by_token(email, uHash):
    # get token from email
    for t, u in active_users.iteritems():
        if u == email:
            token = t
    # create server hash
    combinedString = token + email + privateKey
    serverGeneratedHash = hashHMAC(combinedString)
    # compare hashes
    if (uHash == serverGeneratedHash):
        return get_user_messages(token, email)

#get user messages by email
@app.route('/get_user_messages_by_email/<email>/<fromEmail>/<path:uHash>', methods=['GET'])
def get_user_messages_by_email(email,fromEmail,uHash):
    # get token from email
    for t, u in active_users.iteritems():
        if u == email:
            token = t
    # create server hash
    combinedString = token + email + fromEmail + privateKey
    serverGeneratedHash = hashHMAC(combinedString)
    # compare hashes
    if (uHash == serverGeneratedHash):
        return get_user_messages(token, fromEmail)

#post message request
@app.route('/post_message', methods=['POST'])
def post_message(): #token, message, toEmail
    uHash = request.form['uHash']
    fromUser = request.form['fromUser']
    toUser = request.form['toUser']
    message = request.form['message']

    # get token from email
    for t, u in active_users.iteritems():
        if u == fromUser:
            token = t
    # create server hash
    combinedString = token + fromUser + toUser + message + privateKey
    serverGeneratedHash = hashHMAC(combinedString)
    # compare hashes
    if (uHash == serverGeneratedHash):
        database_helper.post_message(toUser, fromUser, message)
        return json.dumps({"success": "true", "message": "Message posted."})
    else:
        return json.dumps({"success": "false", "message": "Hashed server request is wrong."})

#get number of current online users
@app.route('/get_live_data/<email>/<path:uHash>', methods=['GET'])
def get_live_data(email,uHash):
    # get token from email
    for t, u in active_users.iteritems():
        if u == email:
            token = t
    # create server hash
    combinedString = token + email + privateKey
    serverGeneratedHash = hashHMAC(combinedString)
    # compare hashes
    if (uHash == serverGeneratedHash):
        #get all required parameters for the live data presentation
        curr_online_users = len(active_users)
        total_users_array = database_helper.get_count_users()
        #array of messages of a specific user (contains sender and count of messages)
        total_user_messages_array = database_helper.get_count_user_messages(email)
        #array for all countries and the number of users from this specific country
        user_countries_array = database_helper.get_user_countries()

        jsonString = {'curr_online_users': curr_online_users, 'total_users': total_users_array[0][0], 'total_user_messages': total_user_messages_array, 'user_countries': user_countries_array}
        return json.dumps({"success": "true", "message": "Data returned.", "data": jsonString})
    else:
        return json.dumps({"success": "false", "message": "Hashed server request is wrong."})

#################################################

#main method
if __name__ == '__main__':
    app.run()
