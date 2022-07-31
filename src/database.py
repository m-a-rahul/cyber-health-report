import os
from pymongo import MongoClient


class MongoAPI:
    def __init__(self, client_db: str, client_cl: str):
        """
        :param client_db: Mongo Database Name
        :param client_cl: Mongo Collection Name
        """
        self.client = MongoClient(os.getenv('MONGO_CLIENT_URL'))
        database = client_db
        collection = client_cl
        cursor = self.client[database]
        self.collection = cursor[collection]

    def read(self) -> dict:
        documents = self.collection.find()
        output = [
            {item: data[item] for item in data if item != '_id'}
            for data in documents
        ]
        response = {
            "status": "success",
            "result": output
        }
        return response

    def write(self, data: dict) -> dict:
        """
        :param data: Data to be inserted into the collection
        :return: Status of operation
        """
        self.collection.insert_one(data)
        return {'status': 'success'}

    def update(self, query: dict, content: dict) -> dict:
        """
        :param query: Parameter to identify the document
        :param content: Data to be updated in the collection
        :return: Status of operation
        """
        new_value = {"$set": content}
        self.collection.update_one(query, new_value)
        return {'status': 'success'}
