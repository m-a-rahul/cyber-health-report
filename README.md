# cyber-health-report

Pre-requisites python, wget, virtuenv

###### Project Setup
------

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
