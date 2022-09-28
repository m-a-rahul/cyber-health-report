import json

from flask import Flask, request

from dotenv import load_dotenv
from flask_cors import CORS

from components import formatResults
from github import github_scan
from registries import npm_details, pypi_details

load_dotenv()
app = Flask(__name__)
CORS(app)


@app.route('/analyze', methods=["POST"])
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
    return json.dumps({"status": "failure"})


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
