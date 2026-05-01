from pydantic import BaseModel, EmailStr

class User(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str

class Project(BaseModel):
    title: str
    description: str
    members: list[str]

class Task(BaseModel):
    title: str
    description: str
    assigned_to: str
    status: str
    due_date: str