import json
import os

import requests


def email_validator(email_id: str) -> bool:
    """
    :param email_id: The email id of the author to be validated
    :return: The state of the email (active or inactive)
    """
    response = requests.get(
        "https://isitarealemail.com/api/email/validate",
        params={'email': email_id},
        headers={'Authorization': "Bearer " + os.getenv('REAL_EMAIL_API_TOKEN')}).json()
    return response["status"] == "valid"


def github_api_call(url: str) -> json:
    """
    :param url: The GitHub API endpoint which should be called
    :return: The JSON response returned by the API call
    """
    return requests.get(url, headers={
        'Authorization': f"token {os.getenv('GITHUB_API_AUTH_TOKEN')}",
    }).json()


def calculate_severity(confidence: str, severity: str) -> int:
    """
    :param confidence: Confidence of the vulnerability occurring
    :param severity: Severity of the vulnerability occurring
    :return: Comprehensive score of the identified vulnerability
    """
    score_allocation = {
        "HIGH": 10,
        "MEDIUM": 7.5,
        "LOW": 5,
        "UNDEFINED": 2.5,
    }
    return score_allocation[confidence] * score_allocation[severity]


def NormalizeData(value, old_minimum, old_maximum, new_minimum, new_maximum):
    """
    :param value: Value to be brought in the new range
    :param old_minimum: Minimum of the old range
    :param old_maximum: Maximum of the old range
    :param new_minimum: Minimum of the new range
    :param new_maximum: Maximum of the new range
    :return: Value corresponding to the new range
    """
    return ((value - old_minimum) / (old_maximum - old_minimum)) * (new_maximum - new_minimum) + new_minimum


def formatResults(data: dict) -> dict:
    """
    :param data: Results obtained from performing analytics
    :return: Formatted results
    """
    author_final_score = 0
    author_metrics = 0
    project_final_score = 0
    project_metrics = 0
    author_info = dict()
    package_info = dict()
    log_info = []
    authors_email_count = 0
    authors_email_details = []
    authors_email_score = 0
    if "github" in data:
        if data["github"]["github_owner"]["email"]:
            authors_email_count += 1
            authors_email_details.append(
                {
                    "email": data["github"]["github_owner"]["email"],
                    "status": data["github"]["github_owner"]["email_verified"],
                    "tag": "Github Owner"
                }
            )
            authors_email_score += 100 if data["github"]["github_owner"]["email_verified"] else 0
        package_info["github_repository_score"] = data["github"]["repository"]["popularity_score"]
        project_final_score += package_info["github_repository_score"]
        project_metrics += 1
        if data["github"]["forked"]:
            log_info.append({
                "tag": "warning",
                "message": "The repository is forked kindly make sure you are examining the right package"
            })

        if data["github"]["twitter"]:
            author_info["twitter"] = data["github"]["twitter"]
            author_final_score += author_info["twitter"]["genuineness_score"]
            author_metrics += 1
            if author_info["twitter"]["user_status"] == "verified":
                log_info.append({
                    "tag": "success",
                    "message": "The twitter account of the github user is a verified twitter account"
                })
        else:
            log_info.append({
                "tag": "warning",
                "message": "The github username does not contain a twitter account associated to him"
            })

        safety_score = 0
        file_count = 0
        identified_files = []
        for file in data["github"]["files_vulnerabilities"]:
            file_count += 1
            score = 100
            if "result" in file:
                score -= file["result"]
            safety_score += score
            if score != 100:
                identified_files.append(file)
        if file_count > 0:
            log_info.append({
                "tag": "success",
                "message": f"{file_count} files were analysed"
            })
        else:
            log_info.append({
                "tag": "info",
                "message": "We currently support only python and javascript files and none found"
            })

        if file_count > 0:
            package_info["collaborators_analysis"] = {
                "score": round(safety_score / file_count),
                "vulnerable_files": identified_files
            }
            project_final_score += package_info["collaborators_analysis"]["score"]
            project_metrics += 1

    if "npm" in data:
        package_info["npm_package_score"] = data["npm"]["package"]
        project_final_score += package_info["npm_package_score"]
        project_metrics += 1
        author_npm_details = []
        npm_author_count = 0
        npm_author_score = 0
        if "author" in data["npm"] and data["npm"]["author"]:
            if "username" in data["npm"]["author"]["author"] and "npm_score" in data["npm"]["author"]["author"] \
                    and data["npm"]["author"]["author"]["username"] and data["npm"]["author"]["author"]["npm_score"]:
                author_npm_details.append(
                    {
                        "name": data["npm"]["author"]["author"]["username"],
                        "score": data["npm"]["author"]["author"]["npm_score"],
                        "tag": "Author"
                    }
                )
                npm_author_score += data["npm"]["author"]["author"]["npm_score"]
                npm_author_count += 1
            if "email" in data["npm"]["author"]["author"] and data["npm"]["author"]["author"]["email"]:
                authors_email_count += 1
                authors_email_details.append(
                    {
                        "email": data["npm"]["author"]["author"]["email"],
                        "status": data["npm"]["author"]["author"]["email_verified"],
                        "tag": "Author"
                    }
                )
                authors_email_score += 100 if data["npm"]["author"]["author"]["email_verified"] else 0

        if "publisher" in data["npm"]["author"] and data["npm"]["author"]["publisher"]:
            if "username" in data["npm"]["author"]["publisher"] and "npm_score" in data["npm"]["author"]["publisher"] \
                    and data["npm"]["author"]["publisher"]["username"] and data["npm"]["author"]["publisher"][
                "npm_score"]:
                author_npm_details.append(
                    {
                        "name": data["npm"]["author"]["publisher"]["username"],
                        "score": data["npm"]["author"]["publisher"]["npm_score"],
                        "tag": "Publisher"
                    }
                )
                npm_author_score += data["npm"]["author"]["publisher"]["npm_score"]
                npm_author_count += 1
            if "email" in data["npm"]["author"]["publisher"] and data["npm"]["author"]["publisher"]["email"]:
                authors_email_count += 1
                authors_email_details.append(
                    {
                        "email": data["npm"]["author"]["publisher"]["email"],
                        "status": data["npm"]["author"]["publisher"]["email_verified"],
                        "tag": "Publisher"
                    }
                )
                authors_email_score += 100 if data["npm"]["author"]["publisher"]["email_verified"] else 0
        if "maintainers" in data["npm"]["author"] and data["npm"]["author"]["maintainers"]:
            for maintainer in data["npm"]["author"]["maintainers"]:
                if "username" in maintainer and "npm_score" in maintainer \
                        and maintainer["username"] and maintainer["npm_score"]:
                    author_npm_details.append(
                        {
                            "name": maintainer["username"],
                            "score": maintainer["npm_score"],
                            "tag": "Maintainer"
                        }
                    )
                    npm_author_score += maintainer["npm_score"]
                    npm_author_count += 1
                if "email" in maintainer and maintainer["email"]:
                    authors_email_count += 1
                    authors_email_details.append(
                        {
                            "email": maintainer["email"],
                            "status": maintainer["email_verified"],
                            "tag": "Maintainer"
                        }
                    )
                    authors_email_score += 100 if maintainer["email_verified"] else 0
        author_info["npm"] = {
            "score": round(npm_author_score / npm_author_count) if npm_author_count > 0 else None,
            "details": author_npm_details
        }
        author_final_score += author_info["npm"]["score"]
        author_metrics += 1

    if "pypi" in data:
        if "author" in data["pypi"]["author"]:
            if "email" in data["pypi"]["author"]["author"] and data["pypi"]["author"]["author"]["email"]:
                authors_email_count += 1
                authors_email_details.append(
                    {
                        "email": data["pypi"]["author"]["author"]["email"],
                        "status": data["pypi"]["author"]["author"]["email_verified"],
                        "tag": "Author"
                    }
                )
                authors_email_score += 100 if data["pypi"]["author"]["author"]["email_verified"] else 0
        if "maintainer" in data["pypi"]["author"]:
            if "email" in data["pypi"]["author"]["maintainer"] and data["pypi"]["author"]["maintainer"]["email"]:
                authors_email_count += 1
                authors_email_details.append(
                    {
                        "email": data["pypi"]["author"]["maintainer"]["email"],
                        "status": data["pypi"]["author"]["maintainer"]["email_verified"],
                        "tag": "Maintainer"
                    }
                )
                authors_email_score += 100 if data["pypi"]["author"]["maintainer"]["email_verified"] else 0

    if authors_email_count > 0:
        author_info["email"] = {
            "score": round(authors_email_score / authors_email_count),
            "details": authors_email_details
        }
        author_final_score += author_info["email"]["score"]
        author_metrics += 1
    else:
        log_info.append({
            "tag": "danger",
            "message": "No author email ids identified for the particular project"
        })
    author_info["final_score"] = round(author_final_score / author_metrics) if author_metrics > 0 else 0
    package_info["final_score"] = round(project_final_score / project_metrics) if project_metrics > 0 else 0
    return {
        "author": author_info,
        "project": package_info,
        "log": log_info
    }
