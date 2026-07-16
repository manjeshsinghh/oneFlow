from sqlalchemy import Column, String, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    email = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    avatar = Column(String, nullable=False)
    color = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)

    projects = relationship("Project", back_populates="owner", cascade="all, delete-orphan")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    owner_email = Column(String, ForeignKey("users.email"), nullable=False)

    owner = relationship("User", back_populates="projects")
    columns = relationship("ProjectColumn", back_populates="project", cascade="all, delete-orphan", order_by="ProjectColumn.position")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")

class ProjectColumn(Base):
    __tablename__ = "project_columns"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    accent = Column(String, nullable=False)
    position = Column(Integer, nullable=False)

    project = relationship("Project", back_populates="columns")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    status = Column(String, nullable=False)  # references ProjectColumn.id
    assignees = Column(JSON, nullable=False, default=list)  # list of objects: {name, avatar, color}
    due_date = Column(String, nullable=True)
    priority = Column(String, nullable=False)  # High, Medium, Low
    labels = Column(JSON, nullable=False, default=list)  # list of objects: {name, color}
    comments = Column(Integer, nullable=False, default=0)
    created_at = Column(String, nullable=False)

    project = relationship("Project", back_populates="tasks")
