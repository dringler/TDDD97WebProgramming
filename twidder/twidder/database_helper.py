__author__ = 'Daniel Ringler'
#imports
import sqlite3
from flask import g
from contextlib import closing

#configuration
DATABASE = '/Users/curtis/git/TDDD97WebProgramming/twidder/twidder/database.db'
DEBUG = True
SECRET_KEY = 'development key'
USERNAME = 'admin'
PASSWORD = 'default'

#database conncetion
def connect_db():
	conn = sqlite3.connect(DATABASE)
	return conn

#get database
def get_db():
	db = getattr(g, '_database', None)
	if db is None:
		db = g._database = connect_db()
	return db

#query database
def query_db(query, args=(), one=False):
	db = get_db()
	cur = db.execute(query, args)
	rv = cur.fetchall()
	cur.close()
	db.commit()
	return (rv[0] if rv else None) if one else rv

#get user mail,password and salt
def get_user_mail_pw(email, password):
	userInfo = query_db('SELECT email,passwordHash,salt FROM users WHERE email=?', [email], one=True)
	return userInfo

#get user info
def get_user_info_by_mail(email):
	userInfo = query_db('SELECT email,firstName,familyName,gender,city,country FROM users WHERE email=?', [email], one=True)
	return userInfo

#insert user into database
def insert_user(email, hashedPassword, salt, firstName, familyName, gender, city, country):
	query_db('INSERT INTO users (email,passwordHash,salt,firstName,familyName,gender,city,country) VALUES (?,?,?,?,?,?,?,?)', [email, hashedPassword, salt, firstName, familyName, gender, city, country])

#change user password
def change_pw(newHashedPW, newSalt, email):
	query_db('UPDATE users SET passwordHash=?, salt=? WHERE email=?', [newHashedPW, newSalt, email])

#check if user email already exists
def user_exists(email):
	if (query_db('select email from users where email=?', [email], one=True) != None):
		return True
	else:
		return False

#get user messages
def get_user_messages_by_email(email):
	userMessages = query_db('SELECT toUser, fromUser, messageContent FROM messages WHERE toUser=?', [email])
	return userMessages

#post message
def post_message(toUser, fromUser, messageContent):
	query_db('INSERT INTO messages (toUser,fromUser,messageContent) VALUES (?,?,?)', [toUser, fromUser, messageContent])

#get number of signed-up users
def get_count_users():
	userCount = query_db('SELECT COUNT(*) FROM users')
	return userCount

#get number of user messages and who send it
def get_count_user_messages(email):
	userMessagesCount = query_db('SELECT fromUser,COUNT(*) FROM messages WHERE toUser=? GROUP BY fromUser', [email])
	return userMessagesCount

#get the user countries including a count
def get_user_countries():
	userCountries = query_db('SELECT DISTINCT country, COUNT(*) FROM users GROUP BY country')
	return userCountries

