from urllib.parse import urlparse

import requests

from github import github_quick_scan, github_full_scan
from components import email_validator
from utils import lcs_of_array, calculate_average


def pypi_details(package_name: str, scan_type: str) -> dict:
    """
    :param package_name: The name of the PyPi package that should be inspected
    :param scan_type: Whether it should be a quick scan or full scan
    :return: The json report containing author and GitHub repository analytics
    """

    # Collect the author details and package info through the PyPi API
    package_details = requests.get(f'https://pypi.org/pypi/{package_name}/json').json()
    if not package_details:
        return {}
    authors_info = {
        "author": {
            "email": package_details["info"]["author_email"] if "author_email" in package_details["info"] and
                                                                package_details["info"]["author_email"] else None,
            "email_verified": email_validator(package_details["info"]["author_email"]) if
            package_details["info"]["author_email"] and
            package_details["info"]["author_email"] else None
        } if "author" in package_details["info"] else None,
        "maintainer": {
            "email": package_details["info"]["maintainer_email"] if "maintainer_email" in package_details["info"] and
                                                                    package_details["info"][
                                                                        "maintainer_email"] else None,
            "email_verified": email_validator(package_details["info"]["maintainer_email"]) if
            package_details["info"]["maintainer_email"] and
            package_details["info"]["maintainer_email"] else None
        } if "maintainer" in package_details["info"] else None,
    }

    # Collect the GitHub username and repository by treating the 'project urls' parameter as a string to find out the LCS
    gh_username_repository = lcs_of_array(
        [urlparse(url).path for url in package_details["info"]["project_urls"].values() if
         urlparse(url).netloc.lstrip('www.') == 'github.com']).lstrip('/').rstrip('/').split('/')

    if scan_type == 'full-scan':
        github_info = github_full_scan(gh_username_repository[0], gh_username_repository[1])
    elif scan_type == 'quick-scan':
        github_info = github_quick_scan(gh_username_repository[0], gh_username_repository[1])

    return {
               "pypi": {
                   "author": authors_info
               }
           } | github_info


def npm_details(package_name: str, scan_type: str) -> dict:
    """
    :param package_name: The name of the NPM package that should be inspected
    :param scan_type: Whether it should be a quick scan or full scan
    :return: The json report containing author and GitHub repository analytics along with their associates NPM registry scores
    """

    # Collect the author details and package info through the NPM API
    package_details = requests.get(f"https://api.npms.io/v2/package/{package_name}").json()
    if not package_details:
        return {}
    authors_info = {
        "author": package_details["collected"]["metadata"]["author"] | {
            "email_verified": email_validator(package_details["collected"]["metadata"]["author"]["email"]) if
            "email" in package_details["collected"]["metadata"]["author"] else None,
            "npm_score": calculate_average([score['score']['final'] * 100 for score in requests.get(
                f"https://api.npms.io/v2/search?q=author:{package_details['collected']['metadata']['author']['username']}").json()[
                "results"]]) if "username" in package_details["collected"]["metadata"]["author"] else None,
        } if "author" in package_details["collected"]["metadata"] else None,
        "publisher": package_details["collected"]["metadata"]["publisher"] | {
            "email_verified": email_validator(package_details["collected"]["metadata"]["publisher"]["email"]) if
            "email" in package_details["collected"]["metadata"]["publisher"] else None,
            "npm_score": calculate_average([score['score']['final'] * 100 for score in requests.get(
                f"https://api.npms.io/v2/search?q=author:{package_details['collected']['metadata']['publisher']['username']}").json()[
                "results"]]) if "username" in package_details["collected"]["metadata"]["publisher"] else None,
        } if "publisher" in package_details["collected"]["metadata"] else None,
        "maintainers": [maintainer | {
            "email_verified": email_validator(maintainer["email"]) if
            "email" in maintainer else None,
            "npm_score": calculate_average([score['score']['final'] * 100 for score in requests.get(
                f"https://api.npms.io/v2/search?q=author:{maintainer['username']}").json()[
                "results"]]) if "username" in maintainer else None,
        }
                        for maintainer in package_details["collected"]["metadata"]["maintainers"]
                        ] if "maintainers" in package_details["collected"]["metadata"] else None,
    }

    # Collect the GitHub username and repository from the NPM API
    gh_username_repository = urlparse(package_details["collected"]["metadata"]["repository"]["url"]).path.lstrip(
        '/').rstrip('/').rstrip('.git').split('/') if "repository" in package_details["collected"]["metadata"] else None

    github_info = {}
    if gh_username_repository:
        if scan_type == 'full-scan':
            github_info = github_full_scan(gh_username_repository[0], gh_username_repository[1])
        elif scan_type == 'quick-scan':
            github_info = github_quick_scan(gh_username_repository[0], gh_username_repository[1])

    return {
               "npm": {
                   "author": authors_info,
                   "package": round(float(package_details["score"]["final"]) * 100),
               }
           } | github_info
