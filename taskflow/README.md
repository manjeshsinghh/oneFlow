# TaskFlow

A modern, high-fidelity task and project management application built with a **FastAPI (Python) + SQLite** backend and a **React (JavaScript) + Vite + Tailwind CSS** frontend.

TaskFlow is designed to help teams and individuals track, organize, and analyze tasks across multiple projects. Data is persistently stored in a local SQLite database, and authenticated sessions are handled using secure JSON Web Tokens (JWT).

---

## 🚀 Key Features

*   🔑 **Token-Based Authentication**: Secure user registration and login with local password hash verification and server-side JWT authentication.
*   📂 **Multi-Project Workspaces**: Create, rename, customize, and delete multiple independent projects, each with its own layout.
*   🔀 **Flexible View Switcher**:
    *   **Board View**: Drag and drop tasks across columns. Includes a **Global Board** mode showing project lanes, or project-specific boards showing workflow phases.
    *   **List View**: Flat grid format designed for quick scanning, editing task statuses, and deleting tasks.
    *   **Calendar View**: 6x7 monthly grid mapping tasks by due dates, including month navigation and hover details.
    *   **Insights View**: Interactive KPIs (Completion Rate, Overdue Tasks, High Priority Tasks) and pure CSS charts tracking workloads and statuses.
*   ⚡ **Dynamic Workflow Columns**: Create, recolor, rename, and delete custom columns (phases) inside any project.
*   📊 **Import & Export**: Download your workspace data as structured **JSON** or **CSV** (mitigated against CSV Formula Injection) and import them back at any time.
*   🌓 **Responsive Design**: Elegant user interface supporting transitions, micro-animations, and a beautiful light/dark mode.

---

## 🛠️ Getting Started

### Prerequisites

*   [Python](https://www.python.org/) (v3.10 or higher)
*   [Node.js](https://nodejs.org/) (v20 or higher)
*   [pnpm](https://pnpm.io/) (v9 or higher)

### Setup & Run

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/manjeshsinghh/TaskFlow.git
    cd TaskFlow
    ```

2.  **Start the Python Backend**:
    Create a virtual environment (optional but recommended), install dependencies, and run the FastAPI server:
    ```bash
    # Create and activate virtual environment
    python -m venv venv
    # Windows:
    .\venv\Scripts\activate
    # macOS/Linux:
    source venv/bin/activate

    # Install dependencies
    pip install -r backend/requirements.txt

    # Start FastAPI server
    uvicorn backend.main:app --reload
    ```
    The API docs will be available at `http://127.0.0.1:8000/docs`.

3.  **Start the Frontend**:
    Install node packages and start the Vite development server:
    ```bash
    pnpm install
    pnpm run dev
    ```
    Open `http://localhost:5173/TaskFlow-2/` in your browser. API requests are automatically proxied to the backend.

---

## 📂 Project Structure

```
TaskFlow/
├── .github/workflows/   # CI/CD pipelines (CI and deploy workflows)
├── backend/             # FastAPI Python backend application
│   ├── database.py      # SQLite connection & engine
│   ├── models.py        # SQLAlchemy models
│   ├── schemas.py       # Pydantic validation schemas
│   ├── auth.py          # Hashing & JWT auth logic
│   ├── main.py          # FastAPI application & seeding logic
│   └── requirements.txt # Python package dependencies
├── docs/                # Comprehensive developer documentation
├── src/
│   ├── components/      # React components (modals, views, toggles)
│   ├── data/            # Mock/seed data (sampleTasks.js)
│   ├── utils/           # Utilities (api.js, storage.js, importExport.js)
│   ├── main.jsx         # App mount point
│   ├── App.jsx          # Main workspace coordinator and router
│   └── styles.css       # Custom styles and theme definitions
├── index.html           # HTML entry point
├── package.json         # Frontend project configurations
└── vite.config.js       # Vite build configurations with backend proxy
```
