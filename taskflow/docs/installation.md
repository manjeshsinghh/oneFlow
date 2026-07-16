# Installation Guide

This document describes the step-by-step installation of the TaskFlow project on your local workstation.

---

## 📦 Prerequisites

Ensure you have Node.js and pnpm set up:

1.  **Node.js**: Installation packages can be downloaded from the [Node.js Official Website](https://nodejs.org/). Version 20.x or higher is recommended. Check your version with:
    ```bash
    node -v
    ```
2.  **pnpm**: Install pnpm globally using npm:
    ```bash
    npm install -g pnpm
    ```
    Verify it is active by running:
    ```bash
    pnpm -v
    ```

---

## ⚙️ Installation Steps

Follow these commands to install the repository:

### 1. Clone the Codebase
Clone the project from GitHub:
```bash
git clone https://github.com/manjeshsinghh/TaskFlow.git
cd TaskFlow
```

### 2. Install Project Dependencies
Run the pnpm installer at the root directory:
```bash
pnpm install
```
This command checks the root workspace configurations, resolves all libraries listed in `package.json`, downloads them into a shared node_modules cache, and links them locally.

### 3. Verify the Installation
Run a production build check to ensure everything is linked correctly:
```bash
pnpm run build
```
This should compile TypeScript files (`tsc`) and generate built files in the `/dist` directory in under 2 seconds.
