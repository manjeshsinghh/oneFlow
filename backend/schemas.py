from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional

# Assignee & Label sub-objects
class Assignee(BaseModel):
    name: str
    avatar: str
    color: str

class Label(BaseModel):
    name: str
    color: str

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    name: str
    avatar: str
    color: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    class Config:
        from_attributes = True

# Column Schemas
class ColumnBase(BaseModel):
    id: str
    title: str
    accent: str

class ColumnCreate(ColumnBase):
    position: int

class ColumnUpdate(BaseModel):
    title: str
    accent: str

class ColumnResponse(ColumnBase):
    class Config:
        from_attributes = True

# Project Schemas
class ProjectBase(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    columns: List[ColumnCreate] = []

class ProjectUpdate(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectResponse(ProjectBase):
    columns: List[ColumnResponse] = []
    class Config:
        from_attributes = True

# Task Schemas
class TaskBase(BaseModel):
    id: str
    project_id: str
    title: str
    description: Optional[str] = None
    status: str
    assignees: List[Assignee] = []
    due_date: Optional[str] = None
    priority: str
    labels: List[Label] = []
    comments: int = 0
    created_at: str

class TaskCreate(TaskBase):
    pass

class TaskResponse(TaskBase):
    class Config:
        from_attributes = True

# BoardState response schema (equivalent to frontend workspace payload)
class BoardStateResponse(BaseModel):
    projects: List[ProjectResponse]
    tasks: List[TaskResponse]
    theme: str
    user: Optional[UserResponse] = None
