from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from fastapi import HTTPException
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from auth import (
    hash_password,
    verify_password,
    create_access_token,
    verify_token
)

from database import (
    users_collection,
    projects_collection,
    tasks_collection
)

from datetime import datetime

from models import User, Project, Task

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()

@app.get("/")
def home():

    return {
        "message": "MongoDB connected successfully"
    }

@app.post("/signup")
def signup(user: User):

    user_data = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "role": user.role
    }

    result = users_collection.insert_one(user_data)

    print("Inserted ID:", result.inserted_id)

    return {
        "message": "User created successfully"
    }

@app.get("/users")
def get_users():

    users = list(
        users_collection.find({}, {"_id": 0})
    )

    return users

@app.post("/login")
def login(user: User):

    existing_user = users_collection.find_one({
        "email": user.email
    })

    if not existing_user:

        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if not verify_password(
        user.password,
        existing_user["password"]
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid password"
        )

    access_token = create_access_token(
        data={
            "email": existing_user["email"],
            "role": existing_user["role"]
        }
    )

    return {
        "message": "Login successful",
        "token": access_token
    }

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):

    token = credentials.credentials

    payload = verify_token(token)

    if payload is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )

    return payload

def admin_only(user):

    if user["role"] != "admin":

        raise HTTPException(
            status_code=403,
            detail="Only admin allowed"
        )

@app.get("/dashboard")
def dashboard(user=Depends(get_current_user)):

    return {
        "message": "Welcome to dashboard",
        "user": user
    }

@app.post("/projects")
def create_project(
    project: Project,
    user=Depends(get_current_user)
):

    admin_only(user)

    project_data = {
        "title": project.title,
        "description": project.description,
        "members": project.members,
        "created_by": user["email"]
    }

    projects_collection.insert_one(project_data)

    return {
        "message": "Project created successfully"
    }

@app.get("/projects")
def get_projects(user=Depends(get_current_user)):

    projects = list(
        projects_collection.find({}, {"_id": 0})
    )

    return projects

@app.post("/tasks")
def create_task(
    task: Task,
    user=Depends(get_current_user)
):

    admin_only(user)

    task_data = {
        "title": task.title,
        "description": task.description,
        "assigned_to": task.assigned_to,
        "status": task.status,
        "due_date": task.due_date,
        "created_by": user["email"]
    }

    tasks_collection.insert_one(task_data)

    return {
        "message": "Task created successfully"
    }

@app.get("/tasks")
def get_tasks(user=Depends(get_current_user)):

    tasks = list(
        tasks_collection.find({}, {"_id": 0})
    )

    return tasks

@app.put("/tasks/{task_title}")
def update_task_status(
    task_title: str,
    status: str,
    user=Depends(get_current_user)
):

    tasks_collection.update_one(
        {"title": task_title},
        {
            "$set": {
                "status": status
            }
        }
    )

    return {
        "message": "Task status updated"
    }

@app.get("/dashboard/stats")
def dashboard_stats(user=Depends(get_current_user)):

    total_tasks = tasks_collection.count_documents({})

    completed_tasks = tasks_collection.count_documents({
        "status": "completed"
    })

    pending_tasks = tasks_collection.count_documents({
        "status": "pending"
    })

    all_tasks = list(
        tasks_collection.find({}, {"_id": 0})
    )

    overdue_tasks = 0

    today = datetime.today().date()

    for task in all_tasks:

        try:

            due_date = datetime.strptime(
                task["due_date"],
                "%Y-%m-%d"
            ).date()

            if (
                due_date < today and
                task["status"] != "completed"
            ):

                overdue_tasks += 1

        except:
            pass

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "overdue_tasks": overdue_tasks
    }