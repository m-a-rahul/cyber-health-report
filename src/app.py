import json
import os

from flask import Flask, request

from dotenv import load_dotenv
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from components import formatResults
from github import github_scan
from registries import npm_details, pypi_details

load_dotenv()
app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('APP_SECRET_KEY')
CORS(app)
limiter = Limiter(app, key_func=get_remote_address)


@app.route('/analyze', methods=["POST"])
@limiter.limit("45/minute")
def analyze():
    payload = json.loads(request.data)
    result = {}
    if payload['platform'] == 'npm':
        result = npm_details(payload['package'], payload['flag'])
    elif payload['platform'] == 'pypi':
        result = pypi_details(payload['package'], payload['flag'])
    elif payload['platform'] == 'github':
        result = github_scan(payload['username'], payload['repository'], payload['flag'])
    if result:
        return json.dumps({"status": "success",
                           "data": formatResults(result)})
    return json.dumps({"status": "failure",
                       "message": "Kindly check your input and try again"})


@app.errorhandler(429)
def ratelimit_handler(e):
    return json.dumps({"status": "failure",
                       "message": "Rate-limit exceeded try again after 1min"})


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
