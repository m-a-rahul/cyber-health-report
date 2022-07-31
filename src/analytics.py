import os
import pickle
import time
import urllib.error
import urllib.request
from datetime import datetime

import numpy as np
import requests

from components import github_api_call


def repository_data_collection(owner_details: dict, repository_details: dict) -> list:
    """
    :param owner_details: GitHub repository owner details returned from the GitHub API
    :param repository_details: GitHub repository details returned from the GitHub API
    :return: List of required data to be passed for the analytics
    """
    disk_usage = owner_details["disk_usage"] if "disk_usage" in owner_details else 0
    forks = repository_details["forks_count"] if "forks_count" in repository_details else 0
    watchers = repository_details["watchers_count"] if "watchers_count" in repository_details else 0
    issues_open = repository_details["open_issues_count"] if "open_issues_count" in repository_details else 0
    topics = len(repository_details["topics"]) if "topics" in repository_details else 0
    description_char_count = len(repository_details["description"]) if "description" in repository_details else 0

    # Traversing through the list to find the required information
    commits_count = len(
        github_api_call(
            repository_details["commits_url"].split('{')[0])) if "commits_url" in repository_details else 0
    milestones = len(
        github_api_call(
            repository_details["milestones_url"].split('{')[0])) if "milestones_url" in repository_details else 0
    deployments = len(
        github_api_call(
            repository_details["deployments_url"].split('{')[0])) if "deployments_url" in repository_details else 0
    releases = len(
        github_api_call(
            repository_details["releases_url"].split('{')[0])) if "releases_url" in repository_details else 0
    pull_requests = len(
        github_api_call(
            f"{repository_details['pulls_url'].split('{')[0]}")) if 'pulls_url' in repository_details else 0
    issues_closed = len(github_api_call(
        f"{repository_details['issues_url'].split('{')[0].rstrip('/')}?state=closed")) if 'issues_url' in repository_details else 0

    # Transforming into binary data form
    has_wiki = repository_details["has_wiki"] if "has_wiki" in repository_details else 0
    has_wiki = 1 if has_wiki else 0
    website_url = repository_details["url"] if "url" in repository_details else 0
    website_url = 1 if website_url else 0
    has_issues = repository_details["has_issues"] if "has_issues" in repository_details else 0
    has_issues = 1 if has_issues else 0
    has_projects = repository_details["has_projects"] if "has_projects" in repository_details else 0
    has_projects = 1 if has_projects else 0
    has_license = 1 if "license" in repository_details else 0

    # Transform the collected datetime into timestamp
    created_at = owner_details['created_at'] if 'created_at' in owner_details else 0
    if created_at != 0:
        created_at = round(time.mktime(datetime.strptime(created_at, "%Y-%m-%dT%H:%M:%SZ").timetuple()))
    updated_at = repository_details["updated_at"] if "updated_at" in repository_details else 0
    if updated_at != 0:
        updated_at = round(time.mktime(datetime.strptime(updated_at, "%Y-%m-%dT%H:%M:%SZ").timetuple()))

    # Issues
    issues = github_api_call(
        f"{repository_details['issues_url'].split('{')[0].rstrip('/')}") if 'issues_url' in repository_details else 0
    issue_labels = 0
    if issues != 0:
        for issue in issues:
            issue_labels += len(issue["labels"]) if "labels" in issue else 0

    # ReadMe
    try:
        readme_url = f"https://raw.githubusercontent.com/{repository_details['full_name']}/{repository_details['default_branch']}/README.md"
        readme = requests.get(readme_url)
        if readme.status_code == 404:
            readme_url = f"https://raw.githubusercontent.com/{repository_details['full_name']}/{repository_details['default_branch']}/README.rst"
        readme_size = urllib.request.urlopen(readme_url).length
    except urllib.error.HTTPError:
        readme_size = 0

    return [issues_open, issues_closed, forks, pull_requests,
            commits_count, watchers, disk_usage, readme_size, releases,
            has_projects, milestones, deployments, issue_labels,
            topics, description_char_count, website_url, has_license, has_wiki,
            has_issues, created_at, updated_at]


def repository_scorer(repository_parameters):
    filename = 'ml_models/git_repo.sav'

    loaded_model = pickle.load(open(filename, 'rb'))
    result = loaded_model.predict([repository_parameters])
    result = round(max(result) / 1000)
    result = 100 if result > 100 else result
    return {
        "popularity_score": result,
    }


def twt_user_analysis(twt_username: str) -> dict:
    """
    :param twt_username: Twitter username of the GitHub repository owner
    :return: Genuineness score and validity of the user
    """
    # Collect the author's user specific data from twitter using Eelvated access developer account
    author_twitter_details = requests.get(
        f"https://api.twitter.com/1.1/users/show.json?screen_name={twt_username}",
        headers={
            'Authorization': f"Bearer {os.getenv('TWITTER_API_AUTH_TOKEN')}",
        }).json()

    # Return verified for all verified users
    if author_twitter_details["verified"]:
        return {
            "user_status": "verified",
            "username": twt_username,
        }

    # Call the XgBoost model with the required Twitter user parameters
    twitter_parameters = [[author_twitter_details['statuses_count'], author_twitter_details['followers_count'],
                           author_twitter_details['friends_count'], author_twitter_details['favourites_count'],
                           author_twitter_details['listed_count'], author_twitter_details['url'],
                           author_twitter_details['time_zone']]]
    for i in range(len(twitter_parameters)):
        twitter_parameters[i][5] = 1 if twitter_parameters[i][5] else 0
        twitter_parameters[i][6] = 1 if twitter_parameters[i][6] else 0

    twitter_parameters = np.asarray(twitter_parameters)
    twitter_parameters = twitter_parameters.astype(np.float64)

    filename = 'ml_models/twitter_user_confidence_score.sav'

    loaded_model = pickle.load(open(filename, 'rb'))

    # Fetch the genuineness score and validity of the user from the model
    result = loaded_model.predict(twitter_parameters)
    score = loaded_model.predict_proba(twitter_parameters)
    return {
        "username": twt_username,
        "user_status": "valid" if result[0] == 1 else "invalid",
        "genuineness_score": round(max(score[0]) * 100),
    }
