# TaskFlow

A modern, high-fidelity, client-side task and project management application built with **React 19, TypeScript, Vite, Tailwind CSS**, and **dnd-kit**.

TaskFlow is designed to help teams and individuals track, organize, and analyze tasks across multiple projects. It operates completely in the browser, storing all user credentials, project workflows, custom phases, and task details securely inside the browser's `localStorage`.

---

## 🚀 Key Features

*   🔑 **Secure Local Authentication**: Register accounts and log in locally with password verification using browser-native **SHA-256 Web Crypto hashing**.
*   📂 **Multi-Project Workspaces**: Create, rename, customize, and delete multiple independent projects, each with its own layout.
*   🔀 **Flexible View Switcher**:
    *   **Board View**: Drag and drop tasks across columns. Includes a **Global Board** mode showing project lanes, or project-specific boards showing workflow phases.
    *   **List View**: Flat grid format designed for quick scanning, editing task statuses, and deleting tasks.
    *   **Calendar View**: 6x7 monthly grid mapping tasks by due dates, including month navigation and hover details.
    *   **Insights View**: Interactive KPIs (Completion Rate, Overdue Tasks, High Priority Tasks) and pure CSS charts tracking workloads and statuses.
*   ⚡ **Dynamic Workflow Columns**: Create, recolor, rename, and delete custom columns (phases) inside any project.
*   📊 **Import & Export**: Download your workspace data as structured **JSON** or **CSV** (mitigated against CSV Formula Injection) and import them back at any time.
*   🌓 **Responsive Design**: Elegant user interface supporting transitions, micro-animations, and a beautiful light/dark mode.
*   🛡️ **Hardened Security**: Equipped with a strict Content Security Policy (CSP), sanitized outputs, and cryptographically protected credentials.

---

## 🛠️ Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/) (v20 or higher recommended)
*   [pnpm](https://pnpm.io/) (v9 or higher recommended)

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/manjeshsinghh/TaskFlow.git
   cd TaskFlow
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Start the development server**:
   ```bash
   pnpm run dev
   ```
   Open `http://localhost:5173/TaskFlow/` in your browser.

4. **Build for production**:
   ```bash
   pnpm run build
   ```

---

## 📂 Project Structure

```
TaskFlow/
├── .github/workflows/   # CI/CD automated deployment workflow
├── docs/                # Comprehensive developer documentation
├── src/
│   ├── components/      # React components (modals, views, toggles)
│   ├── data/            # Mock/seed data (sampleTasks.ts)
│   ├── utils/           # Utilities (storage.ts, importExport.ts)
│   ├── types.ts         # Global TypeScript type declarations
│   ├── main.tsx         # App mount point
│   ├── App.tsx          # Main workspace coordinator and router
│   └── styles.css       # Custom styles and theme definitions
├── index.html           # HTML entry point (with CSP configuration)
├── pnpm-workspace.yaml  # Workspace config
└── vite.config.ts       # Vite config
```

For detailed guides, please refer to the files in the [`docs/`](./docs) directory.
