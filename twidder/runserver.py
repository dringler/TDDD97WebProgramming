# from twidder import app
# app.run(debug=True)

from gevent.wsgi import WSGIServer
from geventwebsocket.handler import WebSocketHandler
from geventwebsocket import WebSocketServer, WebSocketError
from twidder import app

http_server = WSGIServer(('', 5000), app, handler_class=WebSocketHandler)
http_server.serve_forever()