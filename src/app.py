import json

from flask import Flask, request

from dotenv import load_dotenv
from flask_cors import CORS

from github import github_details
from registries import npm_details, pypi_details

load_dotenv()
app = Flask(__name__)
CORS(app)


@app.route('/', methods=["POST"])
def root():
    payload = json.loads(request.data)
    result = {}
    if payload['platform'] == 'npm':
        result = npm_details(payload['package'])
    elif payload['platform'] == 'pypi':
        result = pypi_details(payload['package'])
    elif payload['platform'] == 'github':
        result = github_details(payload['username'], payload['repository'])
    if result:
        return json.dumps({"status": "success",
                           "data": result})
    return json.dumps({"status": "failure"})


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
