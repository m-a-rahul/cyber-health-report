# Cyber Health Report

Pre-requisites Python, Git, wget, virtuenv (python package)

###### Project Setup
------

Mac/Linux

```
git clone https://github.com/m-a-rahul/cyber-health-report.git

cd cyber-health-report/src

wget https://flipkart-grid.s3.ap-south-1.amazonaws.com/.env

virtualenv venv

source venv/bin/activate

pip install -r requirements.txt

mkdir ml_models

cd ml_models

wget https://flipkart-grid.s3.ap-south-1.amazonaws.com/git_repo.sav

wget https://flipkart-grid.s3.ap-south-1.amazonaws.com/twitter_user_confidence_score.sav

cd ..

python app.py
```

Now locate the index.html file which will be

```
<YOUR_LOCAL_REPO_LOCATION>/cyber-health-report/templates/index.html

```

Copy and paste the above link in the browser

If you've any problems regarding wget kindly copy the urls and paste it in the browser which will download the file. Once downloaded you can place the files in the respected folders specified.

| Local File Path | Dowload Url |
| :--- | :--- |
| <YOUR_LOCAL_REPO_LOCATION>/cyber-health-report/src | https://flipkart-grid.s3.ap-south-1.amazonaws.com/.env | 
| <YOUR_LOCAL_REPO_LOCATION>/cyber-health-report/src/ml_models | https://flipkart-grid.s3.ap-south-1.amazonaws.com/git_repo.sav | 
| <YOUR_LOCAL_REPO_LOCATION>/cyber-health-report/src/ml_models  | https://flipkart-grid.s3.ap-south-1.amazonaws.com/twitter_user_confidence_score.sav |
