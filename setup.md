# Cyber Health Report

## Develop locally

Pre-requisites Python, Git, wget, docker

###### Project Setup
------

Mac/Linux

```
git clone https://github.com/m-a-rahul/cyber-health-report.git

cd cyber-health-report/src

mkdir ml_models

cd ml_models

wget https://publicly-downloadable-files.s3.amazonaws.com/git_repo.sav

wget https://publicly-downloadable-files.s3.amazonaws.com/twitter_user_confidence_score.sav

cd ..

```
For security reasons the .env file is not available publically. I am sharing with you steps to create a .env file [here](https://bit.ly/3FcxfKf). After creating the file paste it in ```cyber-health-report/src``` directory.

Build and run the docker image

```
docker build -t cyber-health-report-container .

docker run -p 80:80 cyber-health-report-container

```

Now copy/paste the path of the ```cyber-health-report/templates/index.html``` in the browser to view the interface.

```
<YOUR_LOCAL_REPO_LOCATION>/cyber-health-report/templates/index.html

```

Copy and paste the above link in the browser

Feel free to write to m-a-rahul@outlook.com if you face any setup issues we'll write back within 24 hours.
