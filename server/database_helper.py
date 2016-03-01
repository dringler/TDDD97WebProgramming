__author__ = 'Daniel Ringler'
#imports
import sqlite3
from flask import g
from contextlib import closing

#configuration
DATABASE = '/Users/curtis/git/TDDD97WebProgramming/server/database.db'
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

def get_user_mail_pw(email, password):
	userInfo = query_db('SELECT email,passwordHash,salt FROM users WHERE email=?', [email], one=True)
	return userInfo

def get_user_info_by_mail(email):
	userInfo = query_db('SELECT email,firstName,familyName,gender,city,country FROM users WHERE email=?', [email], one=True)
	return userInfo

def insert_user(email, hashedPassword, salt, firstName, familyName, gender, city, country):
	query_db('INSERT INTO users (email,passwordHash,salt,firstName,familyName,gender,city,country) VALUES (?,?,?,?,?,?,?,?)', [email, hashedPassword, salt, firstName, familyName, gender, city, country])

def change_pw(newHashedPW, newSalt, email):
	query_db('UPDATE users SET passwordHash=?, salt=? WHERE email=?', [newHashedPW, newSalt, email])

def user_exists(email):
	if (query_db('select email from users where email=?', [email], one=True) != None):
		return True
	else:
		return False

def get_user_messages_by_email(email):
	userMessages = query_db('SELECT toUser, fromUser, messageContent FROM messages WHERE toUser=?', [email])
	return userMessages

def post_message(toUser, fromUser, messageContent):
	query_db('INSERT INTO messages (toUser,fromUser,messageContent) VALUES (?,?,?)', [toUser, fromUser, messageContent])




