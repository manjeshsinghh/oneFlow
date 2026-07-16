# Troubleshooting Guide

This document lists common development and deployment issues and describes how to resolve them.

---

## 🛠️ Installation & Build Issues

###  `ERROR  packages field missing or empty` (pnpm install)
*   **Cause**: This happens when a `pnpm-workspace.yaml` file exists in the directory but does not define a `packages` list block.
*   **Fix**: Ensure `pnpm-workspace.yaml` contains the `packages` list block pointing to the root:
    ```yaml
    packages:
      - '.'
    ```

### TypeScript parsing or compiler errors on build
*   **Cause**: Downgrades or mismatches in typescript versions can cause discrepancies.
*   **Fix**: Verify that the project uses TypeScript version `5.7.3` as declared in `package.json`. Run `pnpm install` to clear cached typescript versions.

---

## 🚀 Deployment & Runtime Issues

### 404 Error on GitHub Pages
*   **Cause**: The production build was compiled with the incorrect base URL config (e.g., base path is `'/'` but the website is served at `https://<user>.github.io/TaskFlow/`).
*   **Fix**: Verify that the `base` property in your `vite.config.ts` matches your repository subfolder:
    ```typescript
    base: "/TaskFlow/"
    ```

### Broken/corrupted local workspace data
*   **Cause**: If the stored JSON payload inside `localStorage` keys becomes corrupted (e.g. from dynamic type modifications during active coding), the app might throw rendering errors.
*   **Fix**:
    1.  Clear local storage manually: open Developer Tools (F12) ➔ Console, type `localStorage.clear()`, and reload.
    2.  Alternatively, click the red **`Clear`** button in the toolbar on the Global Board (which automatically wipes corrupted local storage keys and resets to default values).
