from flask import Flask
app = Flask(__name__)

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/sign_in")
def sign_in(email, password):
    return "sign_in"

@app.route("/sign_up")
def sign_up(email, password, firstname, familyname, gender, city, country):
    return "sign_up"

@app.route("/sign_out")
def sign_out(token):
    return "sign_out"

@app.route("/change_password")
def change_password(token, old_password, new_password):
    return "change_pw"

@app.route("/get_user_data_by_token")
def get_user_data_by_token(token):
    return "get_user_data_by_token"

@app.route("/get_user_data_by_email")
def get_user_data_by_email(token, email):
    return "get_user_data_by_email"

@app.route("/get_user_messages_by_token")
def get_user_messages_by_token(token):
    return "get_user_messages_by_token"

@app.route("/get_user_messages_by_email")
def get_user_messages_by_email(token, email):
    return "get_user_messages_by_email"

@app.route("/post_message")
def post_message(token, message, email):
    return "post_message"    

if __name__ == "__main__":
    app.run()