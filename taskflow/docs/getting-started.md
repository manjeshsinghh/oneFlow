# Getting Started

Welcome to TaskFlow! This guide will help you understand the core design and get you up and running with your own copy in just a few minutes.

---

## ⚡ Quick Start

### 1. Requirements
Before you begin, ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v20 or higher)
*   [pnpm](https://pnpm.io/) (v9 or higher)

### 2. Download and Run
Clone the repository and install the dependencies:
```bash
git clone https://github.com/manjeshsinghh/TaskFlow.git
cd TaskFlow
pnpm install
```

Start the Vite development server:
```bash
pnpm run dev
```

Open your browser and navigate to the address shown in the terminal (usually `http://localhost:5173/TaskFlow/`).

---

## 🧭 Basic Concepts

TaskFlow divides your work into **Projects**, **Phases**, and **Tasks**:

1.  **Projects**: Independent workspaces (e.g. "Platform Engineering", "Marketing Campaign"). You can create as many projects as you want.
2.  **Phases (Columns)**: Individual workflow stages inside a project (e.g. *To Do*, *In Progress*, *Done*). You can rename, recolor, add, or delete phases within individual projects.
3.  **Tasks**: Individual to-do items containing titles, descriptions, assignees, priorities, labels, and due dates.

### Switch Views
In the header, click the view buttons to instantly toggle layouts:
*   **Board**: Drag and drop tasks between phases or projects.
*   **List**: A flat grid format for fast status editing and deletion.
*   **Calendar**: View tasks mapped on their calendar due dates.
*   **Insights**: Read visual analytics, workloads, and completions.
