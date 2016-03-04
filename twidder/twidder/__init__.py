from flask import Flask
from flask_sockets import Sockets

app = Flask(__name__, static_url_path='')
sockets = Sockets(app)

import twidder.views