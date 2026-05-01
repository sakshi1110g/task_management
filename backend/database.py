from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL")

client = MongoClient(MONGO_URL)

db = client["task_manager"]

users_collection = db["users"]

projects_collection = db["projects"]

tasks_collection = db["tasks"]