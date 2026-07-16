# Technical Architecture

This document describes the technical architecture of TaskFlow, outlining how components interact and manage state.

---

## 🗂️ Component Organization

TaskFlow is organized into logical folders:

*   **`src/components/`**: React views and modals:
    *   `AuthScreen.tsx`: Gated authentication layout.
    *   `BoardColumn.tsx` & `TaskCard.tsx`: Drag-and-drop board components.
    *   `CalendarView.tsx`: Monthly due date calendar mapper.
    *   `InsightsView.tsx`: Progress and workload metrics charts.
    *   `TaskListView.tsx`: Grid-based scan list.
    *   `NewProjectModal.tsx` & `EditProjectModal.tsx`: Project settings controllers.
    *   `NewColumnModal.tsx` & `EditColumnModal.tsx`: Phase/List settings controllers.
    *   `NewTaskModal.tsx`: Task creation form.
*   **`src/utils/`**: Utilities:
    *   `storage.ts`: Handles Local Storage reads, writes, resets, and fallback seed data cloning.
    *   `importExport.ts`: Structured parser for JSON/CSV formats (with CSV Injection mitigation).
*   **`src/data/`**: Seed data:
    *   `sampleTasks.ts`: Mocks two pre-configured projects (*Platform Engineering* and *Growth Marketing*) with tasks for demo runs.

---

## 🔄 State Architecture

All workspace updates pass through a single reactive coordinator (`App.tsx`). State flows downwards via React props, and actions flow upwards via callback triggers:

```
[User Action] ➔ triggers callback ➔ updates state in App.tsx ➔ re-saves to localStorage ➔ updates child props ➔ UI re-renders
```

### Type Definitions (`src/types.ts`)
The workspace state is typed using these models:
*   **`User`**: Session credentials containing `email`, `name`, `avatar`, and HSL `color`.
*   **`Column`**: Represent workflow lanes with `id`, `title`, and hex `accent` color.
*   **`Project`**: Project containers containing `id`, `name`, `description`, and a custom list of `columns`.
*   **`Task`**: Single items linked to projects via `projectId` and statuses via `status` (which references a column `id`).
*   **`BoardState`**: The serialized localStorage payload schema wrapping projects, tasks, theme, and user data.
