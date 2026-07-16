# Internal Module Interfaces (API)

As TaskFlow is a fully client-side static application, it does not query external Web API REST endpoints. Instead, communication between modules is handled via internal utility APIs.

---

## 💾 Storage Interfaces (`src/utils/storage.ts`)

Provides direct interfaces to query, write, and reset browser localStorage state.

### `loadBoardState()`
Loads and parses stored project workspaces, tasks, theme preferences, and user sessions.
*   **Signature**: `() => BoardState`
*   **Return Value**: The parsed `BoardState` payload. If storage is empty, it returns cloned sample task arrays.

### `saveBoardState(state)`
Serializes and writes active data into local storage.
*   **Signature**: `(state: BoardState) => void`
*   **Arguments**:
    *   `state`: Object containing active `projects`, `tasks`, `theme`, and `user` state.

### `resetBoardState()`
Clears workspace settings from local storage.
*   **Signature**: `() => void`

---

## 📊 Import & Export Utilities (`src/utils/importExport.ts`)

Facilitates parsing and downloading user workspaces in JSON/CSV formats.

### `readImportFile(file)`
Asynchronously reads and validates imported file files.
*   **Signature**: `(file: File) => Promise<BoardState>`
*   **Return Value**: Validated projects and tasks dataset. Throws an error if validation fails.

### `exportJson(tasks, theme)`
Downloads the active workspace as a JSON file.
*   **Signature**: `(tasks: Task[], theme: 'light' | 'dark') => void`

### `exportCsv(tasks)`
Sanitizes and downloads active tasks list to a CSV spreadsheet.
*   **Signature**: `(tasks: Task[]) => void`
*   *Note: Automatically sanitizes cells using `csvEscape` to prevent CSV formula injection (CWE-1236).*
