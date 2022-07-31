from analytics import repository_scorer, twt_user_analysis, repository_data_collection
from components import email_validator, github_api_call
from database import MongoAPI
from sast import bandit_analysis, js_file_analyser

db = MongoAPI(client_db="bvlisomentj7mwo", client_cl="analysed_github_repositories")


def github_details(gh_username: str, gh_repository_name: str) -> dict:
    """
    :param gh_username: GitHub username of the repository's owner
    :param gh_repository_name: GitHub repository to be evaluated
    :return: Comprehensive analytics report (SAST + Twitter user analytics)
    """
    # Gather repository and its owner's information via the GitHub API
    owner_details = github_api_call(f"https://api.github.com/users/{gh_username}")
    repository_details = github_api_call(f"https://api.github.com/repos/{gh_username}/{gh_repository_name}")
    if not owner_details or not repository_details:
        return {}
    repository_parameters = repository_data_collection(owner_details, repository_details)
    repository_score = repository_scorer(repository_parameters)
    files_changed = set()
    files_content = []
    closed_pull_number = -1
    repository_id = None

    # Collect the pull request of the particular repository
    pull_requests = github_api_call(
        f"https://api.github.com/repos/{gh_username}/{gh_repository_name}/pulls?state=closed")

    # Check if the repository logs exists in our Database
    analysed_repositories = db.read()
    if analysed_repositories['status'] == 'success':
        for repo in analysed_repositories['result']:
            if repo["repository"] == gh_repository_name:
                repository_id = repo
                break

    # If it exists get the vulnerable files and remove the pull requests scanned during the previous check
    if repository_id:
        files_changed = set(repository_id["vulnerable_files"])
        pull_requests = [pulls for pulls in pull_requests if (pulls['number'] > repository_id["closed_pull_request"])]
        closed_pull_number = repository_id["closed_pull_request"]

    # Iterate through the pull requests to identify the files that are created/modified by the collaborators
    for pull in pull_requests:
        if 'number' in pull:
            closed_pull_number = max(pull['number'], closed_pull_number)
            pull_requests_files = github_api_call(f"{pull['url']}/files")
            for files in pull_requests_files:
                if files['filename'].split('.')[-1] == 'py' or files['filename'].split('.')[-1] == 'js':
                    files_changed.add(files['filename'])

    # Perform SAST on the identified files
    for file_changed in files_changed:
        file_report = None
        if file_changed.split('.')[-1] == 'py':
            file_report = bandit_analysis(gh_username, gh_repository_name, file_changed)
        elif file_changed.split('.')[-1] == 'js':
            file_report = files_content.append(js_file_analyser(gh_username, gh_repository_name, file_changed))
        if file_report:
            files_content.append(file_report)

    # Update/Write the analytics log into the Database
    if repository_id:
        db.update({"repository": repository_id['repository']}, {
            "closed_pull_request": closed_pull_number,
            "vulnerable_files": list(files_changed),
        })
    else:
        db.write(
            {
                "repository": gh_repository_name,
                "closed_pull_request": closed_pull_number,
                "vulnerable_files": list(files_changed),
            }
        )

    twitter_user_details = twt_user_analysis(owner_details['twitter_username']) if owner_details[
        'twitter_username'] else None

    return {
        "github": {
            "github_owner": {
                "email": owner_details['email'],
                "email_verified": email_validator(owner_details['email']) if 'email' in owner_details and owner_details['email'] else None,
            },
            "files_vulnerabilities": files_content,
            "repository": repository_score,
            "twitter": twitter_user_details
        }
    }
