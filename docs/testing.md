# Testing & Verification Guide

This document describes the testing protocols, manual validation checklists, and quality checks used in the TaskFlow repository.

---

## 🧪 Build and Lint Checks

Before pushing code changes, verify code quality by running the build and lint scripts locally:

1.  **TypeScript & Build Verification**:
    ```bash
    pnpm run build
    ```
    This script runs the TypeScript compiler (`tsc`) to verify type safety and compiles the production bundles with Vite. It must complete without error.
2.  **Linting Verification**:
    ```bash
    pnpm run lint
    ```
    This checks files against the flat ESLint configuration (`eslint.config.js`). It must run successfully with zero warnings and zero errors.

---

## 📝 Manual QA Checklist

As a client-side SPA, interactive features should be validated manually on a local server (`pnpm run dev`):

### 🔑 Authentication Flow
*   Verify that loading the page without a local session redirects to the Auth Screen.
*   Verify that clicking sign up registers a user and saves the credentials to localStorage (`taskflow-registered-users`).
*   Confirm that signing out clears active session storage and redirects to the login view.

### 📂 Workspace & Columns
*   Select a project and click `New Project` to verify that it creates a project and redirects to it.
*   Click `Add List (Phase)` on a project board to verify that the column immediately renders.
*   Hover over a column header, click the edit pencil icon, change the list color/name, and verify that the column saves.
*   Delete a column and verify that tasks are moved to the first available project column.

### 🔀 Views & Drag-and-Drop
*   Verify that dragging tasks between columns works on the Board view, updating their status.
*   Verify that dragging tasks between columns on the **Global Board ("All Projects")** updates the task's project ID.
*   Toggle views (Board, List, Calendar, Insights) to ensure they render the correct subset of active tasks.
