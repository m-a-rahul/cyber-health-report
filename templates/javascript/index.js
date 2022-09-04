let results = {};

$('#platform').on('change', function () {
    if ($('#platform').val() == 'github') {
        $('#package-input-data').empty();
        $('#package-input-data').append(`<div class="d-flex mb-3">
            <div class="input-group has-validation w-75">
                <input id="username" type="text" class="form-control" placeholder="GitHub username" aria-label="GitHub username">
                <span class="input-group-text">/</span>
                <input id="repository" type="text" class="form-control" placeholder="GitHub repository"
                    aria-label="GitHub repository">
            </div>
            
            <button class="btn btn-primary mx-2" id="quick-scan">Quick Scan</button>
            <button class="btn btn-primary" id="full-scan">Full Scan</button>
        </div>`);
    } else {
        $('#package-input-data').empty();
        $('#package-input-data').append(`<div class="d-flex mb-3">
            <div class="input-group has-validation w-75">
                <input type="text" class="form-control" id="package" type="text" class="form-control"
                    placeholder="Package name" aria-label="Package name" aria-describedby="submit-button">
            </div>
            <button class="btn btn-primary mx-2" id="quick-scan">Quick Scan</button>
            <button class="btn btn-primary" id="full-scan">Full Scan</button>
        </div>`);
    }
});

const npmAuthorScoresRenderer = (author_info) => {
    if (author_info) {
        let renderContent = ''
        let author_scores = 0;
        let authors_count = 0;
        if (author_info.author)
            if (author_info.author.username && author_info.author.npm_score) {
                badge_class = "text-bg-success";
                if (author_info.author.npm_score < 50)
                    badge_class = "text-bg-warning";
                renderContent += `<li>
                <span class="text-muted">Author NPM username:</span> ${author_info.author.username}
                <span class="badge ${badge_class}">+${author_info.author.npm_score}</span>
            </li>`;
                author_scores += author_info.author.npm_score;
                authors_count += 1;
            }
        if (author_info.publisher)
            if (author_info.publisher.username && author_info.publisher.npm_score) {
                badge_class = "text-bg-success";
                if (author_info.publisher.npm_score < 50)
                    badge_class = "text-bg-warning";
                renderContent += `<li>
                <span class="text-muted">Publisher NPM username:</span> ${author_info.publisher.username}
                <span class="badge ${badge_class}">+${author_info.publisher.npm_score}</span>
            </li>`;
                author_scores += author_info.publisher.npm_score;
                authors_count += 1;
            }
        if (author_info.maintainers) {
            author_info.maintainers.forEach(maintainer => {
                if (maintainer)
                    if (maintainer.username && maintainer.npm_score) {
                        badge_class = "text-bg-success";
                        if (maintainer.npm_score < 50)
                            badge_class = "text-bg-warning";
                        renderContent += `<li>
                        <span class="text-muted">Maintainer NPM username:</span> ${maintainer.username}
                        <span class="badge ${badge_class}">+${maintainer.npm_score}</span>
                    </li>`;
                        author_scores += maintainer.npm_score
                        authors_count += 1;
                    }
            });
        }
        if (authors_count == 0) {
            results.npm_author_score = 0;
        } else {
            results.npm_author_score = Math.round(author_scores / authors_count);
        }

        $('#final-author-npm-score').empty();
        $('#final-author-npm-score').html(`${results.npm_author_score}%`);
        $('#npm-author-scores').empty();
        $('#npm-author-scores').append(renderContent);
    } else {
        $('#npm-author-div').addClass('blur-div');
        $('#npm-author-div').attr('title', 'NPM author info not found');
    }
}

const npmAuthorMailChecksRenderer = (author_info) => {
    if (author_info) {
        let renderContent = ''
        let author_scores = 0;
        let authors_count = 0;
        if (author_info.author)
            if (author_info.author.email) {
                badge = '<span class="badge text-bg-danger">Inactive</span>';
                if (author_info.author.email_verified) {
                    badge = '<span class="badge text-bg-info">Active</span>';
                    author_scores += 100;
                }
                renderContent += `<li>
                <span class="text-muted">Author email:</span> ${author_info.author.email}
                ${badge}
            </li>`;

                authors_count += 1;
            }
        if (author_info.publisher)
            if (author_info.publisher.email) {
                badge = '<span class="badge text-bg-danger">Inactive</span>';
                if (author_info.publisher.email_verified) {
                    badge = '<span class="badge text-bg-info">Active</span>';
                    author_scores += 100;
                }
                renderContent += `<li>
                <span class="text-muted">Publisher email:</span> ${author_info.publisher.email}
                ${badge}
            </li>`;

                authors_count += 1;
            }
        if (author_info.maintainers) {
            author_info.maintainers.forEach(maintainer => {
                if (maintainer)
                    if (maintainer.email) {
                        badge = '<span class="badge text-bg-danger">Inactive</span>';
                        if (maintainer.email_verified) {
                            badge = '<span class="badge text-bg-info">Active</span>';
                            author_scores += 100;
                        }
                        renderContent += `<li>
                        <span class="text-muted">Maintainer email:</span> ${maintainer.email}
                        ${badge}
                    </li>`;

                        authors_count += 1;
                    }
            });
        }
        if (authors_count == 0) {
            results.author_mail_score = 0;
        } else {
            results.author_mail_score = Math.round(author_scores / authors_count);
        }
        $('#final-author-mail-score').empty()
        $('#final-author-mail-score').html(`${results.author_mail_score}%`);
        $('#author-mails').empty();
        $('#author-mails').append(renderContent);
    }
}

const pypiAuthorMailChecksRenderer = (author_info) => {
    if (author_info) {
        let author_scores = 0;
        let authors_count = 0;
        let renderContent = ''
        if (author_info.author)
            if (author_info.author.email) {
                badge = '<span class="badge text-bg-danger">Inactive</span>';
                if (author_info.author.email_verified) {
                    badge = '<span class="badge text-bg-info">Active</span>';
                    author_scores += 100;
                }
                authors_count += 1;
                renderContent += `<li>
                <span class="text-muted">Author email:</span> ${author_info.author.email}
                ${badge}
            </li>`;
            }
        if (author_info.maintainer)
            if (author_info.maintainer.email) {
                badge = '<span class="badge text-bg-danger">Inactive</span>';
                if (author_info.maintainer.email_verified) {
                    badge = '<span class="badge text-bg-info">Active</span>';
                    author_scores += 100;
                }
                authors_count += 1;
                renderContent += `<li>
                <span class="text-muted">Author email:</span> ${author_info.maintainer.email}
                ${badge}
            </li>`;

            }
        if (authors_count == 0) {
            results.author_mail_score = 0;
        } else {
            results.author_mail_score = Math.round(author_scores / authors_count);
        }

        $('#final-author-mail-score').empty()
        $('#final-author-mail-score').html(`${results.author_mail_score}%`);
        $('#author-mails').empty();
        $('#author-mails').append(renderContent);
    }
}

const twitterScoreRenderer = (twitter_info) => {
    if (twitter_info) {
        const renderContent = `<li>
            <span class="text-muted">Twitter Username:</span> ${twitter_info.username}
            <span class="badge text-bg-primary">Github repository owner</span>
        </li>`;
        $('#final-twitter-score').empty();
        if (twitter_info.user_status == 'verified') {
            $('#final-twitter-score').html('100%');
            results.twitter = 100;
            $('#result-logs').append('<li class="list-group-item list-group-item-success">The twitter account of the github user is a verified twitter account</li>');
        } else {
            $('#final-twitter-score').html(`${twitter_info.genuineness_score}%`);
            results.twitter = twitter_info.genuineness_score;
        }
        $('#twitter-author-score').empty();
        $('#twitter-author-score').append(renderContent);
    } else {
        $('#twitter-div').addClass('blur-div');
        $('#twitter-div').attr('title', 'The github username does not contain a twitter account associated to him');
        $('#result-logs').append('<li class="list-group-item list-group-item-info">The github username does not contain a twitter account associated to him</li>');
    }
}

const githubRepositoryOwnerMailChecks = (owner_info) => {
    if (owner_info.email) {
        let mail_score = 0;
        badge = '<span class="badge text-bg-danger">Inactive</span>';
        if (owner_info.email_verified) {
            badge = '<span class="badge text-bg-info">Active</span>';
            mail_score = 100;
        }
        renderContent = `<li>
            <span class="text-muted">Repository Owner email:</span> ${owner_info.email}
            ${badge}
        </li>`
        $('#author-mails').append(renderContent);
        if (results.author_mail_score) {
            mail_score = (mail_score + results.author_mail_score) / 2;
        }
        results.author_mail_score = Math.round(mail_score);
        $('#final-author-mail-score').empty();
        $('#final-author-mail-score').html(`${results.author_mail_score}%`);
    }

}

const githubCollaborationsResults = (file_vulnerabilities) => {
    if (file_vulnerabilities) {
        let fileCount = 0;
        let serialNo = 1;
        let renderContent = '';
        let safetyScore = 0;
        file_vulnerabilities.forEach(file => {
            fileCount += 1;
            let currentSafety = 100
            if ('result' in file) {
                currentSafety -= file.result
            }
            safetyScore += currentSafety
            if (file.result > 0) {
                renderContent += `<tr>
                    <th scope="row">${serialNo}</th>
                    <td>${file.file_path}</td>
                    <td>${file.result}</td>
                </tr>`;
                serialNo += 1;

            }
        });

        if (fileCount != 0) {
            results.contributors_mail_score = Math.round(safetyScore / fileCount);
            $('#final-github-contributors-score').empty()
            $('#final-github-contributors-score').html(`${results.contributors_mail_score}%`);
            $('#file-vulnerabilities-results').empty();
            $('#file-vulnerabilities-results').html(renderContent);
            $('#contributors-score-div').attr('title', `${fileCount} files were analyzed`);
            $('#result-logs').append(`<li class="list-group-item list-group-item-info">${fileCount} files were analyzed</li>`);
        } else {
            $('#file-vulnerabilities-table').empty();
            $('#contributors-score-div').addClass('blur-div');
            $('#contributors-score-div').attr('title', 'We currently support only python and javascript files and none found');
            $('#result-logs').append('<li class="list-group-item list-group-item-info">We currently support only python and javascript files and none found</li>');
        }

        if (serialNo == 1) {
            $('#file-vulnerabilities-table').empty();
        }


    } else {
        $('#contributors-score-div').addClass('blur-div');
        $('#contributors-score-div').attr('title', 'We currently support only python and javascript files and none found');
        $('#result-logs').append('<li class="list-group-item list-group-item-info">We currently support only python and javascript files and none found</li>');
    }
}

const renderFinalScores = () => {
    let author_score = 0;
    let author_metrics = 0;
    let project_score = 0;
    let project_metrics = 0
    let author_score_fg = '#fc5442';
    let author_score_bg = '#fc544210';
    let project_score_fg = '#fc5442';
    let project_score_bg = '#fc544210';
    if ('contributors_mail_score' in results) {
        project_score += results.contributors_mail_score;
        project_metrics += 1;
    }
    if ('npm_project_score' in results) {
        project_score += results.npm_project_score;
        project_metrics += 1;
    }
    if ('repository_popularity_score' in results) {
        project_score += results.repository_popularity_score;
        project_metrics += 1;
    }
    if ('author_mail_score' in results) {
        author_score += results.author_mail_score;
        author_metrics += 1;
    }
    if ('twitter' in results) {
        author_score += results.twitter;
        author_metrics += 1;
    }
    if ('npm_author_score' in results) {
        author_score += results.npm_author_score;
        author_metrics += 1;
    }
    if (author_metrics == 0) {
        author_score = 0;
        $('#author-mail-validation').addClass('blur-div');
        $('#author-mail-validation').attr('title', 'No author email ids identified for the particular project');
        $('#result-logs').append('<li class="list-group-item list-group-item-warning">No author email ids identified for the particular project</li>');
    } else
        author_score = Math.round(author_score / author_metrics);
    console.log(project_score, project_metrics);
    project_score = Math.round(project_score / project_metrics);

    if (author_score > 75) {
        author_score_fg = '#19aa7f';
        author_score_bg = '#19aa7f10';
    } else if (author_score > 50) {
        author_score_fg = '#fbb532';
        author_score_bg = '#fbb53210';
    }
    authorRenderContent = `<div class="d-flex justify-content-center">
        <div class="author_score" role="progressbar" aria-valuenow="${author_score}" aria-valuemin="0"
            aria-valuemax="100" style="--value:${author_score};--fg:${author_score_fg};--bg:${author_score_bg}">
        </div>
    </div>
    <h4 class="fw-bold mt-4 mb-2">${author_score}%</h4>
    <div>Authors Score</div>
    <div class="text-muted">Authors, publishers
        & maintainers</div>`;
    $('#author-final-score').empty();
    $('#author-final-score').append(authorRenderContent);

    if (project_score > 75) {
        project_score_fg = '#19aa7f';
        project_score_bg = '#19aa7f10';
    } else if (project_score > 50) {
        project_score_fg = '#fbb532';
        project_score_bg = '#fbb53210';
    }

    projectRenderContent = `<div class="d-flex justify-content-center">
        <div class="repository_score" role="progressbar" aria-valuenow="${project_score}" aria-valuemin="0"
            aria-valuemax="100" style="--value:${project_score};--fg:${project_score_fg};--bg:${project_score_bg}">
        </div>
    </div>
    <h4 class="fw-bold mt-4 mb-2">${project_score}%</h4>
    <div>Projects Score</div>
    <div class="text-muted">Popularity, acceptance
    & contributions</div>`;
    $('#project-final-score').empty();
    $('#project-final-score').append(projectRenderContent);

    $('#author-div').removeClass('d-none');
    $('#project-div').removeClass('d-none');
    $('#result-logs').removeClass('d-none');
    $('#loading').addClass('d-none');
}

const getValidatedInput = (id, regex) => {
    var re = new RegExp(regex);
    var term = $(id).val()
    if (re.test(term)) {
        $(id).removeClass('is-invalid');
        return term;
    } else {
        $(id).addClass('is-invalid');
        return false;
    }
}

const submitPackage = (flag) => {
    let data = {
        platform: $('#platform').val(),
        flag,
    }
    if (data.platform == 'github') {
        data.username = getValidatedInput('#username', '^[a-zA-Z0-9-_.]*$');
        data.repository = getValidatedInput('#repository', '^[a-zA-Z0-9._-]+$');
    } else {
        data.package = getValidatedInput('#package', "^[a-z][a-z-_.0-9]*$");
    }
    if (!Object.values(data).includes(false)) {
        $('#loading').removeClass('d-none');
        $('#platform').prop('disabled', true);
        $('#username').prop('disabled', true);
        $('#repository').prop('disabled', true);
        $('#package').prop('disabled', true);
        $('#quick-scan').prop('disabled', true);
        $('#full-scan').prop('disabled', true);
        $.ajax({
            type: 'POST',
            url: "http://127.0.0.1:5000/",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                parsedResponse = JSON.parse(response);
                if (parsedResponse.status == "success") {
                    if (data.platform == 'npm') {
                        npmAuthorMailChecksRenderer(parsedResponse.data.npm.author);
                        npmAuthorScoresRenderer(parsedResponse.data.npm.author);
                        results.npm_project_score = parsedResponse.data.npm.package;
                        $('#final-package-npm-score').empty();
                        $('#final-package-npm-score').html(`${parsedResponse.data.npm.package}%`);
                    } else if (data.platform == 'pypi')
                        pypiAuthorMailChecksRenderer(parsedResponse.data.pypi.author);
                    if (!('npm' in parsedResponse.data)) {
                        $('#npm-package-div').addClass('blur-div');
                        $('#npm-package-div').attr('title', 'The package is not from the npm repository');
                        $('#npm-author-div').addClass('blur-div');
                        $('#npm-author-div').attr('title', 'The package is not from the npm repository');
                    }
                    if ('github' in parsedResponse.data) {
                        githubCollaborationsResults(parsedResponse.data.github.files_vulnerabilities);
                        githubRepositoryOwnerMailChecks(parsedResponse.data.github.github_owner);
                        twitterScoreRenderer(parsedResponse.data.github.twitter);
                        results.repository_popularity_score = parsedResponse.data.github.repository.popularity_score;
                        if (parsedResponse.data.github.forked) {
                            $('#result-logs').append('<li class="list-group-item list-group-item-warning">The repository is forked kindly make sure you are examining the right package</li>');
                        }
                        $('#final-github-repository-score').empty();
                        $('#final-github-repository-score').html(`${parsedResponse.data.github.repository.popularity_score}%`);
                    } else {
                        $('#repository-score-div').addClass('blur-div');
                        $('#twitter-div').addClass('blur-div');
                        $('#contributors-score-div').addClass('blur-div');
                        $('#repository-score-div').attr('title', 'The package does not contain any GitHub details');
                        $('#twitter-div').attr('title', 'The package does not contain any GitHub details');
                        $('#contributors-score-div').attr('title', 'The package does not contain any GitHub details');
                        $('#result-logs').append('<li class="list-group-item list-group-item-info">The package does not contain any GitHub details</li>');
                    }
                    renderFinalScores();
                }
                else {
                    alert("Kindly check your input and try again");
                    window.location.reload();
                }
            },
            error: function () {
                alert("Seems like we've encountered some unhandled exception, or unsupported service. Kindly try again with a different input");
                window.location.reload();
            }
        });
    }
}

$(document).on('click', '#quick-scan', function (e) {
    e.preventDefault();
    submitPackage("quick-scan");
});

$(document).on('click', '#full-scan', function (e) {
    e.preventDefault();
    submitPackage("full-scan");
});

$(function () {
    if (window.innerWidth < 992) {
        alert("Sorry, our interface currently doesn't support the screen device try using a laptop/desktop");
        window.location.reload();
    } else {
        $('#quick-scan').prop('disabled', false);
        $('#full-scan').prop('disabled', false);
        $('#platform').prop('disabled', false);
    }
});
