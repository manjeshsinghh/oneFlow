# Agent Instructions & Guidelines (AGENTS.md)

Welcome, AI Agent! This document outlines key architecture patterns, security boundaries, and coding constraints in the TaskFlow repository. Read this before making modifications to ensure system integrity.

---

## 🛠️ Tech Stack & Constraints

1. **Frontend Framework**: React 19 + TypeScript. Do not introduce legacy React class components.
2. **Build Tool**: Vite 8. Always run builds via `pnpm run build` and check types using `tsc`.
3. **Styling**: Tailwind CSS v4 configured via `@tailwindcss/postcss`. Custom UI classes (like `.field-input`, `.primary-button`) are defined in `src/styles.css`. Use them to maintain design harmony instead of adding inline Tailwind utilities.
4. **Drag & Drop**: Powered by `@dnd-kit/core` and `@dnd-kit/sortable`. Pointer, touch, and keyboard sensors are instantiated in `App.tsx`.
5. **No Backend API**: All storage is client-side. Do not try to make mock server fetch requests.

---

## 🔑 Crucial Guidelines

### 1. Security Boundaries
*   **Password Hashing**: Do NOT remove or bypass the `hashPassword` function inside `AuthScreen.tsx`. Passwords must be hashed using Web Crypto API SHA-256 before storing or comparing.
*   **CSV Injection**: Do NOT modify the `csvEscape` sanitization in `importExport.ts`. The check for `=`, `+`, `-`, `@`, `\t`, and `\r` prevents CSV Injection (CWE-1236) and must remain intact.
*   **Content Security Policy**: Ensure the CSP `<meta>` tag in `index.html` is not deleted or weakened. If you introduce new asset sources (like external APIs or scripts), update the CSP accordingly.

### 2. Multi-Project & Board Logic
*   **Active Project State**: `activeProjectId` in `App.tsx` controls whether the user is on the **Global Board** (`"all"`) or a **Project Board** (`project.id`).
*   **Global Board Mode**: 
    - Columns represent the **Projects** themselves.
    - Dragging a card between columns calls a project reassignment, updating `projectId` and resetting `status` to that project's first phase.
*   **Project Board Mode**:
    - Columns represent **Phases** (custom columns defined in `project.columns`).
    - Dragging a card updates its `status`.
*   **Add/Edit/Delete List**: Adding/editing lists must update `projects` state in `App.tsx` and save to local storage. Deleting a list must move tasks to the first available project column.

### 3. Local Storage Sync
*   **Sync Effect**: All changes to `projects`, `tasks`, `theme`, and `user` state are automatically persisted in `localStorage` under `modern-kanban-board-v2` via a hook inside `App.tsx`.
*   **Defaults Fallback**: If local storage is empty, fallback to importing `sampleProjects` and `sampleTasks`.

### 4. Workspace Configuration
*   **pnpm workspace**: The repository uses `pnpm-workspace.yaml`. It must contain the `packages: - '.'` block. Removing it will break the `pnpm install` step in CI/CD.

---

## 🧪 Verification Commands

Before ending your turn, always verify your changes using:
```bash
# Verify TypeScript compiles
pnpm run build

# Verify ESLint has zero errors and warnings
pnpm run lint
```
 Ensure no compilation warnings or lints remain.
