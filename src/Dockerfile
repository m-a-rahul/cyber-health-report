# syntax=docker/dockerfile:1

FROM python:3.9-slim-buster

WORKDIR /cyber-health-report

COPY requirements.txt requirements.txt
RUN pip3 install -r requirements.txt

COPY . /cyber-health-report

CMD [ "python3", "-m" , "flask", "run", "--host=0.0.0.0", "--port=80"]