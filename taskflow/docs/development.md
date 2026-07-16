# Developer Guide

This document describes developer commands, code styles, and procedures for extending the TaskFlow application.

---

## 💻 Developer Commands

Run these commands using `pnpm` in the project root:

| Command | Action |
| :--- | :--- |
| `pnpm run dev` | Starts Vite development server with HMR at `http://localhost:5173/TaskFlow/` |
| `pnpm run build` | Compiles TypeScript declarations and outputs production bundle in `/dist` |
| `pnpm run preview` | Spins up a local web server serving the production build for testing |
| `pnpm run lint` | Runs flat config ESLint checks on all code files |

---

## 🎨 Styling Guidelines

TaskFlow uses Tailwind CSS v4. Reusable style components are located in `src/styles.css`. Instead of adding redundant inline utilities on form fields and buttons, apply these preset classes:

*   **Inputs**: Apply `field-input` to styled `<input>`, `<select>`, and `<textarea>` elements.
*   **Labels**: Wrap inputs in `<label className="field-label">`.
*   **Buttons**:
    *   Primary actions: `primary-button`
    *   Secondary actions: `secondary-button`
    *   Icon triggers (only icons): `icon-button`

---

## ➕ Adding a New Component or Modal

1.  **Component File**: Create your component under `src/components/`. For modals, make sure to add standard keyboard traps (close on `Esc` key) and click outside logic.
2.  **Declare Types**: If your component requires new data structures, document them in `src/types.ts` first.
3.  **Integrate state in App.tsx**: Import the component and set up trigger states (e.g., `isModalOpen`) to coordinate rendering.
4.  **Confirm Types & Linting**: Run `pnpm run build` and `pnpm run lint` to verify that the additions do not introduce type or linting violations.
