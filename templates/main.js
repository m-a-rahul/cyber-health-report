const hide = (id) => {
    $(id).addClass('d-none');
}

const show = (id) => {
    $(id).removeClass('d-none');
}

const getValidatedInput = (id, regex = '^[a-zA-Z0-9._-]+$') => {
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

const alert = (message, type) => {
    const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('')

    alertPlaceholder.append(wrapper)
}

const inputDisabler = (flag) => {
    const numbers = ['#quick-scan', '#full-scan', '#platform', '#username', '#package', '#repository'];
    numbers.forEach((ele) => {
        $(ele).prop('disabled', flag);
    });
}

$('#platform').on('change', function () {
    if ($('#platform').val() == 'github') {
        show('#vcs-input');
        hide('#registry-input');
    } else {
        show('#registry-input');
        hide('#vcs-input');
    }
});

$(document).on('click', '#quick-scan', function (e) {
    e.preventDefault();
    show('#loadingScreen');
    hide('#searchScreen');
    submitPackage("quick-scan");
});

$(document).on('click', '#full-scan', function (e) {
    e.preventDefault();
    show('#loadingScreen');
    hide('#searchScreen');
    submitPackage("full-scan");
});

$(document).on('click', '#back', function () {
    window.location.reload();
});

const renderResults = (results) => {
    if ("email" in results.author) {
        let renderEmailResults = ''
        results.author.email.details.forEach((author) => {
            badge = '<span class="badge text-bg-danger">Inactive</span>';
            if (author.status) {
                badge = '<span class="badge text-bg-info">Active</span>';
                mail_score = 100;
            }
            renderEmailResults = `<li>
                <span class="text-muted">${author.tag} email:</span> ${author.email}
                ${badge}
            </li>`
        });

        $('#author-mails').append(renderEmailResults);
        $('#final-author-mail-score').empty();
        $('#final-author-mail-score').html(`${results.author.email.score}%`);
    } else {
        $('#author-mail-validation').addClass('blur-div');
    }


    if ("twitter" in results.author) {
        const renderTwitterResults = `<li>
            <span class="text-muted">Twitter Username:</span> ${results.author.twitter.username}
            <span class="badge text-bg-primary">Github repository owner</span>
        </li>`;
        $('#final-twitter-score').empty();
        $('#final-twitter-score').html(`${results.author.twitter.genuineness_score}%`);
        $('#twitter-author-score').empty();
        $('#twitter-author-score').append(renderTwitterResults);
    } else {
        $('#twitter-div').addClass('blur-div');
    }

    if ("npm" in results.author) {
        let renderNpmAuthorContent = '';
        results.author.npm.details.forEach((author) => {
            badge_class = "text-bg-success";
            if (author.score < 50)
                badge_class = "text-bg-warning";
            renderNpmAuthorContent += `<li>
                <span class="text-muted">${author.tag} NPM username:</span> ${author.name}
                <span class="badge ${badge_class}">+${author.score}</span>
            </li>`;
        });
        $('#final-author-npm-score').empty();
        $('#final-author-npm-score').html(`${results.author.npm.score}%`);
        $('#npm-author-scores').empty();
        $('#npm-author-scores').append(renderNpmAuthorContent);

    } else {
        $('#npm-author-div').addClass('blur-div');
    }

    if ("npm_package_score" in results.project) {
        $('#final-package-npm-score').empty();
        $('#final-package-npm-score').html(`${results.project.npm_package_score}%`);
    } else {
        $('#npm-package-div').addClass('blur-div');
    }

    if ("github_repository_score" in results.project) {
        $('#final-github-repository-score').empty();
        $('#final-github-repository-score').html(`${results.project.github_repository_score}%`);
    } else {
        $('#repository-score-div').addClass('blur-div');
    }

    if ("collaborators_analysis" in results.project) {
        $('#final-github-contributors-score').empty()
        $('#final-github-contributors-score').html(`${results.project.collaborators_analysis.score}%`);

        if (results.project.collaborators_analysis.vulnerable_files.length > 0) {
            let renderTableContent = ''
            let serialNo = 1;
            results.project.collaborators_analysis.vulnerable_files.forEach((file) => {
                renderTableContent += `<tr>
                    <th scope="row">${serialNo}</th>
                    <td>${file.file_path}</td>
                    <td>${file.result}</td>
                </tr>`;
                serialNo++;
            });

            let renderGithubCollaborationResults = `
                <table class="table w-75">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Files</th>
                        <th scope="col">Vulnerability Score</th>
                    </tr>
                </thead>
                <tbody id="file-vulnerabilities-results">
                ${renderTableContent}
                </tbody>
            </table>`;
            $('#file-vulnerabilities-table').empty();
            $('#file-vulnerabilities-table').append(renderGithubCollaborationResults);
        }

    } else {
        $('#contributors-score-div').addClass('blur-div');
    }

    if("log" in results) {
        let renderLogs = ''
        results.log.forEach((log)=>{
            renderLogs += `<li class="fw-bold text-${log.tag}"> (${log.tag}) ${log.message}</li>`;
        });
        $('#logs').empty();
        $('#logs').append(renderLogs);
    }

    const author_score = results.author.final_score;
    const project_score = results.project.final_score;
    let author_score_fg = '#fc5442';
    let author_score_bg = '#fc544210';
    let project_score_fg = '#fc5442';
    let project_score_bg = '#fc544210';
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

    hide('#loadingScreen');
    show('#resultsScreen');
}

const submitPackage = (flag) => {
    let data = {
        platform: $('#platform').val(),
        flag,
    }
    if (data.platform == 'github') {
        data.username = getValidatedInput('#username');
        data.repository = getValidatedInput('#repository');
    } else {
        data.package = getValidatedInput('#package');
    }
    if (!Object.values(data).includes(false)) {
        inputDisabler(true);
        $.ajax({
            type: 'POST',
            url: "http://127.0.0.1:5000/analyze",
            data: JSON.stringify(data),
            contentType: "application/json; charset=utf-8",
            success: function (response) {
                parsedResponse = JSON.parse(response);
                if (parsedResponse.status == "success") {
                    $('#source').empty();
                    $('#source').append($('#platform option:selected').text());
                    if(data.platform=='github'){
                        $('#project').val(data.username+'/'+data.repository);
                    } else {
                        $('#project').val(data.package);
                    }
                    renderResults(parsedResponse.data);
                }
                else {
                    alert(parsedResponse.message, "danger");
                    $('#payloadForm').trigger("reset");
                    show('#registry-input');
                    hide('#vcs-input');
                    inputDisabler(false);
                    hide('#loadingScreen');
                    show('#searchScreen');
                }
            },
            error: function () {
                alert("Encountered some unhandled exception", "danger");
                $('#payloadForm').trigger("reset");
                show('#registry-input');
                hide('#vcs-input');
                inputDisabler(false);
                hide('#loadingScreen');
                show('#searchScreen');
            }
        });
    }
}

$(function () {
    inputDisabler(false);
});