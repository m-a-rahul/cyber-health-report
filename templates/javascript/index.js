let results = {};

$('#platform').on('change', function () {
    if ($('#platform').val() == 'github') {
        $('#package-input-data').empty();
        $('#package-input-data').append(`<div class="input-group has-validation mb-3">
            <input id="username" type="text" class="form-control" placeholder="GitHub username" aria-label="GitHub username">
            <span class="input-group-text">/</span>
            <input id="repository" type="text" class="form-control" placeholder="GitHub repository"
                aria-label="GitHub repository">
            <button class="btn btn-primary" type="submit" id="submit-button">Inspect</button>
        </div>`);
    } else {
        $('#package-input-data').empty();
        $('#package-input-data').append(`<div class="input-group has-validation mb-3">
            <div class="input-group  has-validation mb-3">
                <input type="text" class="form-control" id="package" type="text" class="form-control" placeholder="Package name"
                aria-label="Package name" aria-describedby="submit-button">
                <button class="btn btn-primary" type="submit" id="submit-button">Inspect</button>
            </div>
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
        } else {
            $('#final-twitter-score').html(`${twitter_info.genuineness_score}%`)
            results.twitter = twitter_info.genuineness_score
        }
        $('#twitter-author-score').empty();
        $('#twitter-author-score').append(renderContent);
    } else {
        $('#twitter-div').addClass('blur-div');
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

        if (serialNo == 1) {
            $('#file-vulnerabilities-table').empty();
            $('#file-vulnerabilities-table').html(`<div class="alert alert-info" role="alert">
            ${fileCount} files analyzed 0 vulnerabilities found
          </div>`);
        } else {
            $('#file-vulnerabilities-results').empty();
            $('#file-vulnerabilities-results').html(renderContent);
        }
        if (fileCount != 0) {
            results.contributors_mail_score = Math.round(safetyScore / fileCount);
        } else {
            results.contributors_mail_score = 100;
        }

        $('#final-github-contributors-score').empty()
        $('#final-github-contributors-score').html(`${results.contributors_mail_score}%`);
    } else {
        $('#contributors-score-div').addClass('blur-div');
    }
}

const renderFinalScores = () => {
    let author_score = 0;
    let author_metrics = 0;
    let project_score = 0;
    let project_metrics = 0
    if ('contributors_mail_score' in results) {
        project_score += results.contributors_mail_score;
        project_metrics += 1;
    }
    if ('npm_author_score' in results) {
        project_score += results.npm_author_score;
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
    author_score = Math.round(author_score / author_metrics);
    project_score = Math.round(project_score / project_metrics);

    authorRenderContent = `<div class="d-flex justify-content-center">
        <div class="author_score" role="progressbar" aria-valuenow="${author_score}" aria-valuemin="0"
            aria-valuemax="100" style="--value:${author_score};--fg:#f06292;--bg:#f0629210">
        </div>
    </div>
    <h4 class="fw-bold mt-4 mb-2">${author_score}%</h4>
    <div>Authors Score</div>
    <div class="text-muted">Authors, publishers
        & maintainers</div>`;
    $('#author-final-score').empty();
    $('#author-final-score').append(authorRenderContent);

    projectRenderContent = `<div class="d-flex justify-content-center">
        <div class="repository_score" role="progressbar" aria-valuenow="${project_score}" aria-valuemin="0"
            aria-valuemax="100" style="--value:${project_score};--fg:#5A6BC0;--bg:#5A6BC010">
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

$("#package-details").on('submit', function (e) {
    e.preventDefault();
    let data = {
        platform: $('#platform').val(),
    }
    if (data.platform == 'github') {
        data.username = getValidatedInput('#username', '^[a-z][a-z-_.]*$');
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
        $('#submit-button').prop('disabled', true);
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
                        $('#final-package-npm-score').empty();
                        $('#final-package-npm-score').html(`${parsedResponse.data.npm.package}%`);
                    } else if (data.platform == 'pypi')
                        pypiAuthorMailChecksRenderer(parsedResponse.data.pypi.author);
                    if (!('npm' in parsedResponse.data)) {
                        $('#npm-package-div').addClass('blur-div');
                        $('#npm-author-div').addClass('blur-div');
                    }
                    if ('github' in parsedResponse.data) {
                        githubCollaborationsResults(parsedResponse.data.github.files_vulnerabilities);
                        githubRepositoryOwnerMailChecks(parsedResponse.data.github.github_owner);
                        twitterScoreRenderer(parsedResponse.data.github.twitter);
                        results.repository_popularity_score = parsedResponse.data.github.repository.popularity_score;
                        $('#final-github-repository-score').empty();
                        $('#final-github-repository-score').html(`${parsedResponse.data.github.repository.popularity_score}%`);
                    } else {
                        $('#repository-score-div').addClass('blur-div');
                        $('#twitter-div').addClass('blur-div');
                        $('#contributors-score-div').addClass('blur-div');
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
});


$(function () {
    if (window.innerWidth < 992) {
        alert("Sorry, our interface currently doesn't support the screen device try using a laptop/desktop");
        window.location.reload();
    } else {
        $('#submit-button').prop('disabled', false);
    }
});
