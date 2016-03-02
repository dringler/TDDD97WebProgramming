# from twidder import app
# app.run(debug=True)

from gevent.wsgi import WSGIServer
from twidder import app

http_server = WSGIServer(('', 5000), app)
http_server.serve_forever()