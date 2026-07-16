from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from backend import models, schemas, auth
from backend.database import engine, get_db

# Create DB tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskFlow API")

# Enable CORS for local testing if running on different ports directly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def seed_user_data(db: Session, user_email: str):
    # Seed default projects
    p1_id = f"{user_email}_project_1"
    p2_id = f"{user_email}_project_2"

    proj1 = models.Project(
        id=p1_id,
        name="Platform Engineering",
        description="Core infrastructure, API endpoints, and platform tooling tasks.",
        owner_email=user_email
    )
    proj2 = models.Project(
        id=p2_id,
        name="Growth Marketing",
        description="Acquisition landing pages, user onboarding optimization, and copy sprint.",
        owner_email=user_email
    )
    
    db.add(proj1)
    db.add(proj2)

    cols1 = [
        models.ProjectColumn(id="backlog", project_id=p1_id, title="Backlog", accent="#64748b", position=0),
        models.ProjectColumn(id="progress", project_id=p1_id, title="In Progress", accent="#2563eb", position=1),
        models.ProjectColumn(id="qa", project_id=p1_id, title="Quality Assurance", accent="#7c3aed", position=2),
        models.ProjectColumn(id="done", project_id=p1_id, title="Done", accent="#059669", position=3),
    ]
    cols2 = [
        models.ProjectColumn(id="ideas", project_id=p2_id, title="Ideas", accent="#f59e0b", position=0),
        models.ProjectColumn(id="design", project_id=p2_id, title="Design & Copy", accent="#db2777", position=1),
        models.ProjectColumn(id="prod", project_id=p2_id, title="Production", accent="#0891b2", position=2),
        models.ProjectColumn(id="complete", project_id=p2_id, title="Complete", accent="#10b981", position=3),
    ]

    for col in cols1 + cols2:
        db.add(col)

    tasks = [
        models.Task(
            id=f"{user_email}_task_1",
            project_id=p2_id,
            title="Map onboarding activation path",
            description="Audit the first-run journey and identify moments where new teams lose momentum.",
            status="ideas",
            assignees=[
                {"name": "Ava Stone", "avatar": "AS", "color": "#2563eb"},
                {"name": "Maya Chen", "avatar": "MC", "color": "#f97316"}
            ],
            due_date="2026-07-14",
            priority="High",
            labels=[
                {"name": "Research", "color": "#38bdf8"},
                {"name": "Growth", "color": "#84cc16"}
            ],
            comments=8,
            created_at="2026-07-01T09:00:00.000Z"
        ),
        models.Task(
            id=f"{user_email}_task_2",
            project_id=p1_id,
            title="Design sprint planning surface",
            description="Create a dense planning view for prioritizing sprint candidates across squads.",
            status="progress",
            assignees=[
                {"name": "Leo Park", "avatar": "LP", "color": "#14b8a6"}
            ],
            due_date="2026-07-18",
            priority="Medium",
            labels=[
                {"name": "Design", "color": "#a855f7"},
                {"name": "Platform", "color": "#22c55e"}
            ],
            comments=5,
            created_at="2026-07-02T10:30:00.000Z"
        ),
        models.Task(
            id=f"{user_email}_task_3",
            project_id=p1_id,
            title="Ship CSV import validation",
            description="Show clear import errors for missing columns, invalid dates, and unknown priorities.",
            status="qa",
            assignees=[
                {"name": "Nora Patel", "avatar": "NP", "color": "#e11d48"},
                {"name": "Sam Rivera", "avatar": "SR", "color": "#0f766e"}
            ],
            due_date="2026-07-10",
            priority="High",
            labels=[
                {"name": "Frontend", "color": "#f59e0b"},
                {"name": "Data", "color": "#06b6d4"}
            ],
            comments=12,
            created_at="2026-07-03T14:15:00.000Z"
        ),
        models.Task(
            id=f"{user_email}_task_4",
            project_id=p2_id,
            title="Finalize billing empty states",
            description="Polish upgrade, invoice, and failed payment states with consistent tone and spacing.",
            status="complete",
            assignees=[
                {"name": "Iris Kim", "avatar": "IK", "color": "#db2777"}
            ],
            due_date="2026-07-08",
            priority="Low",
            labels=[
                {"name": "UX", "color": "#6366f1"}
            ],
            comments=3,
            created_at="2026-06-29T11:20:00.000Z"
        ),
        models.Task(
            id=f"{user_email}_task_5",
            project_id=p1_id,
            title="Instrument release health dashboard",
            description="Track adoption, error rate, support volume, and latency after each release window.",
            status="backlog",
            assignees=[
                {"name": "Owen Wells", "avatar": "OW", "color": "#0891b2"}
            ],
            due_date="2026-07-22",
            priority="Medium",
            labels=[
                {"name": "Analytics", "color": "#10b981"},
                {"name": "Ops", "color": "#ef4444"}
            ],
            comments=6,
            created_at="2026-07-05T08:45:00.000Z"
        ),
        models.Task(
            id=f"{user_email}_task_6",
            project_id=p1_id,
            title="Refine command menu shortcuts",
            description="Add discoverable keyboard paths for creating tasks, moving cards, and switching filters.",
            status="progress",
            assignees=[
                {"name": "Maya Chen", "avatar": "MC", "color": "#f97316"},
                {"name": "Sam Rivera", "avatar": "SR", "color": "#0f766e"}
            ],
            due_date="2026-07-16",
            priority="Low",
            labels=[
                {"name": "Accessibility", "color": "#8b5cf6"},
                {"name": "Product", "color": "#f43f5e"}
            ],
            comments=4,
            created_at="2026-07-04T12:00:00.000Z"
        )
    ]
    for task in tasks:
        db.add(task)
    db.commit()

# --- Auth Endpoints ---

@app.post("/api/auth/register", response_model=schemas.UserResponse)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed = auth.get_password_hash(user_in.password)
    user = models.User(
        email=user_in.email,
        name=user_in.name,
        avatar=user_in.avatar,
        color=user_in.color,
        hashed_password=hashed
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    seed_user_data(db, user.email)
    return user

@app.post("/api/auth/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = auth.create_access_token(data={"sub": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "name": user.name,
            "avatar": user.avatar,
            "color": user.color
        }
    }

@app.get("/api/auth/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

# --- Board Sync State Endpoints ---

@app.get("/api/board", response_model=schemas.BoardStateResponse)
def get_board_state(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    projects = db.query(models.Project).filter(models.Project.owner_email == current_user.email).all()
    project_ids = [p.id for p in projects]
    tasks = db.query(models.Task).filter(models.Task.project_id.in_(project_ids)).all() if project_ids else []
    return {
        "projects": projects,
        "tasks": tasks,
        "theme": "light", # theme saved on client is fine or we default to light
        "user": current_user
    }

# --- Project Endpoints ---

@app.post("/api/projects", response_model=schemas.ProjectResponse)
def create_project(project_in: schemas.ProjectCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    project = models.Project(
        id=project_in.id,
        name=project_in.name,
        description=project_in.description,
        owner_email=current_user.email
    )
    db.add(project)
    
    # Add columns with ordering
    for i, col in enumerate(project_in.columns):
        db_col = models.ProjectColumn(
            id=col.id,
            project_id=project.id,
            title=col.title,
            accent=col.accent,
            position=i
        )
        db.add(db_col)
    
    db.commit()
    db.refresh(project)
    return project

@app.put("/api/projects/{project_id}", response_model=schemas.ProjectResponse)
def update_project(project_id: str, project_in: schemas.ProjectUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_email == current_user.email).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project.name = project_in.name
    project.description = project_in.description
    db.commit()
    db.refresh(project)
    return project

@app.delete("/api/projects/{project_id}")
def delete_project(project_id: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_email == current_user.email).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Delete associated tasks
    db.query(models.Task).filter(models.Task.project_id == project_id).delete()
    
    db.delete(project)
    db.commit()
    return {"status": "success"}

# --- Column Endpoints ---

@app.post("/api/projects/{project_id}/columns", response_model=schemas.ColumnResponse)
def add_column(project_id: str, col_in: schemas.ColumnBase, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_email == current_user.email).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    existing_count = db.query(models.ProjectColumn).filter(models.ProjectColumn.project_id == project_id).count()
    
    db_col = models.ProjectColumn(
        id=col_in.id,
        project_id=project_id,
        title=col_in.title,
        accent=col_in.accent,
        position=existing_count
    )
    db.add(db_col)
    db.commit()
    db.refresh(db_col)
    return db_col

@app.put("/api/projects/{project_id}/columns/{column_id}", response_model=schemas.ColumnResponse)
def update_column(project_id: str, column_id: str, col_in: schemas.ColumnUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_email == current_user.email).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    column = db.query(models.ProjectColumn).filter(models.ProjectColumn.id == column_id, models.ProjectColumn.project_id == project_id).first()
    if not column:
        raise HTTPException(status_code=404, detail="Column not found")
    
    column.title = col_in.title
    column.accent = col_in.accent
    db.commit()
    db.refresh(column)
    return column

@app.delete("/api/projects/{project_id}/columns/{column_id}")
def delete_column(project_id: str, column_id: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    project = db.query(models.Project).filter(models.Project.id == project_id, models.Project.owner_email == current_user.email).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    column = db.query(models.ProjectColumn).filter(models.ProjectColumn.id == column_id, models.ProjectColumn.project_id == project_id).first()
    if not column:
        raise HTTPException(status_code=404, detail="Column not found")
    
    # Delete the column
    db.delete(column)
    db.commit()

    # Move any tasks in this column to the first column of the project
    remaining_cols = db.query(models.ProjectColumn).filter(models.ProjectColumn.project_id == project_id).order_by(models.ProjectColumn.position).all()
    fallback_col_id = remaining_cols[0].id if remaining_cols else "todo"
    
    db.query(models.Task).filter(models.Task.project_id == project_id, models.Task.status == column_id).update({models.Task.status: fallback_col_id})
    db.commit()
    
    return {"status": "success", "fallback_column_id": fallback_col_id}

# --- Task Endpoints ---

@app.post("/api/tasks", response_model=schemas.TaskResponse)
def create_task(task_in: schemas.TaskCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Verify project belongs to user
    project = db.query(models.Project).filter(models.Project.id == task_in.project_id, models.Project.owner_email == current_user.email).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found or access denied")
        
    task = models.Task(
        id=task_in.id,
        project_id=task_in.project_id,
        title=task_in.title,
        description=task_in.description,
        status=task_in.status,
        assignees=[a.dict() for a in task_in.assignees],
        due_date=task_in.due_date,
        priority=task_in.priority,
        labels=[l.dict() for l in task_in.labels],
        comments=task_in.comments,
        created_at=task_in.created_at
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@app.put("/api/tasks/{task_id}", response_model=schemas.TaskResponse)
def update_task(task_id: str, task_in: schemas.TaskCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Verify task belongs to user's project
    task = db.query(models.Task).join(models.Project).filter(models.Task.id == task_id, models.Project.owner_email == current_user.email).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found or access denied")
    
    task.project_id = task_in.project_id
    task.title = task_in.title
    task.description = task_in.description
    task.status = task_in.status
    task.assignees = [a.dict() for a in task_in.assignees]
    task.due_date = task_in.due_date
    task.priority = task_in.priority
    task.labels = [l.dict() for l in task_in.labels]
    task.comments = task_in.comments
    
    db.commit()
    db.refresh(task)
    return task

@app.delete("/api/tasks/{task_id}")
def delete_task(task_id: str, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    task = db.query(models.Task).join(models.Project).filter(models.Task.id == task_id, models.Project.owner_email == current_user.email).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found or access denied")
    
    db.delete(task)
    db.commit()
    return {"status": "success"}

# --- Import / Reset Entire Workspace Endpoints ---

@app.post("/api/import")
def import_board(state_in: schemas.BoardStateResponse, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Delete all projects and tasks for this user
    db.query(models.Task).join(models.Project).filter(models.Project.owner_email == current_user.email).delete(synchronize_session=False)
    db.query(models.Project).filter(models.Project.owner_email == current_user.email).delete(synchronize_session=False)
    db.commit()

    # Import projects and columns
    for proj_data in state_in.projects:
        project = models.Project(
            id=proj_data.id,
            name=proj_data.name,
            description=proj_data.description,
            owner_email=current_user.email
        )
        db.add(project)
        for i, col in enumerate(proj_data.columns):
            db_col = models.ProjectColumn(
                id=col.id,
                project_id=proj_data.id,
                title=col.title,
                accent=col.accent,
                position=i
            )
            db.add(db_col)
            
    # Import tasks
    for task_data in state_in.tasks:
        task = models.Task(
            id=task_data.id,
            project_id=task_data.project_id,
            title=task_data.title,
            description=task_data.description,
            status=task_data.status,
            assignees=[a.dict() for a in task_data.assignees],
            due_date=task_data.due_date,
            priority=task_data.priority,
            labels=[l.dict() for l in task_data.labels],
            comments=task_data.comments,
            created_at=task_data.created_at
        )
        db.add(task)
        
    db.commit()
    return {"status": "success"}

@app.post("/api/clear")
def clear_board(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Delete all tasks and projects for user
    db.query(models.Task).join(models.Project).filter(models.Project.owner_email == current_user.email).delete(synchronize_session=False)
    db.query(models.Project).filter(models.Project.owner_email == current_user.email).delete(synchronize_session=False)
    db.commit()
    return {"status": "success"}
