# Changelog (CHANGELOG.md)

All notable changes to the TaskFlow project will be documented in this file.

---

## [1.2.0] - 2026-07-10
### Added
*   **Sign-In & Registration System**: Implemented a secure authentication view (`AuthScreen.tsx`) gating the application dashboard.
*   **User Sessions & Profiles**: Added a clickable profile avatar dropdown in the header to view user details and sign out.
*   **Dynamic Task Assignment**: Linked task creators' profile details (Name, Initials, and Avatar Color) to new tasks.
*   **GitHub Actions CI/CD**: Added a build-and-deploy actions workflow targeting GitHub Pages.

### Security Hardening
*   **SHA-256 Hashing**: Integrated browser-native Crypto subtle digest calls to hash stored passwords in browser databases.
*   **CSV Injection Defense**: Neutralized formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`) in exported CSV sheets.
*   **Content Security Policy (CSP)**: Added a strict HTTP-equivalent CSP tag in the main page head to block arbitrary script inclusions.

---

## [1.1.0] - 2026-07-10
### Added
*   **Multi-Project Workspaces**: Introduced states to handle multiple projects with project select dropdowns.
*   **Global Board Mode**: Created a board view where columns are projects, letting users drag tasks between projects.
*   **Custom Column Management**: Introduced a modal to create, rename, recolor, and delete workflow phases dynamically.
*   **List, Calendar, & Insights Views**:
    - **List View**: Added a flat, tabular grid with status drop-down selectors and row deletions.
    - **Calendar View**: Added a monthly grid mapping task due dates, with month navigation.
    - **Insights View**: Added a KPI dashboard with Completion Rate meters and css progress charts.

### Fixed
*   **pnpm workspace error**: Fixed `packages field missing or empty` error by configuring `pnpm-workspace.yaml`.

---

## [1.0.0] - 2026-07-09
### Added
*   **Initial release**: Standard single-project React Kanban board with 4 hardcoded columns.
*   **Drag and Drop**: Setup `@dnd-kit/core` with touch and pointer sensors.
*   **JSON/CSV Import/Export**: Added static download/upload modules.
