import json
import re
import subprocess

import requests

from components import github_api_call, calculate_severity


def bandit_analysis(gh_username: str, gh_repository_name: str, file_changed: str) -> dict:
    """
    :param gh_username: GitHub username of the owner
    :param gh_repository_name: GitHub repository name to be inspected
    :param file_changed: Python files that are created/modified by collaborators
    :return: File report containing the path and vulnerability score
    """

    # Call the GitHub API to get the raw file to perform SAST
    try:
        response = requests.get(
            github_api_call(
                f"https://api.github.com/repos/{gh_username}/{gh_repository_name}/contents/{file_changed}")[
                "download_url"])
    except KeyError:
        return {}

    # Write the file content in our local input file
    open("input.py", "wb").write(response.content)
    # Execute the bandit command on the input file while skipping certain codes and write the output locally in output.json
    subprocess.run(['bandit', '-r', 'input.py', '-f', 'json', '-o', 'output.json', '-s',
                    'B307,B308,B309,B311,B313,B314,B315,B316,B317,B318,B319,B320,B405,B406,B407,B408,B409,B410,B411'])
    output = open('output.json')
    results = json.load(output)

    vulnerability_scores = [calculate_severity(result["issue_confidence"], result["issue_severity"]) for result in
                            results['results']]
    try:
        return {
            "file_path": file_changed,
            "result": round(sum(vulnerability_scores) / len(vulnerability_scores)),
        }

    except ZeroDivisionError:
        return {
            "file_path": file_changed,
            "result": 0,
        }


def js_file_analyser(gh_username: str, gh_repository_name: str, file_changed: str) -> dict:
    """
    :param gh_username: GitHub username of the owner
    :param gh_repository_name: GitHub repository name to be inspected
    :param file_changed: Javascript files that are created/modified by collaborators
    :return: File report containing the path and vulnerability score
    """

    # Call the GitHub API to get the raw file to perform SAST
    try:
        response = requests.get(
            github_api_call(
                f"https://api.github.com/repos/{gh_username}/{gh_repository_name}/contents/{file_changed}")[
                "download_url"])
    except KeyError:
        return {}
    file_content = response.text
    vulnerability_score = 0

    # Define regex patterns depicting vulnerabilities
    shell_command_vulnerability = re.findall('require("child_process")', file_content)
    remote_protocol_exec_vulnerability = re.match(
        "(ssh|ftp|smtp)://[A-Za-z0-9]+:[A-Za-z0-9]+@[a-zA-Z0-9]+.[a-z]+:[0-9]+:/[a-zA-Z0-9_~]+", file_content)
    local_file_access_vulnerability = re.findall("JsonSerializer.Deserialize", file_content)

    # Assign score if vulnerability has been identified
    if shell_command_vulnerability:
        vulnerability_score += 10
    if remote_protocol_exec_vulnerability:
        vulnerability_score += 7
    if local_file_access_vulnerability:
        vulnerability_score += 5
    vulnerability_score /= 3

    return {
        "file_path": file_changed,
        "result": round(vulnerability_score),
    }
