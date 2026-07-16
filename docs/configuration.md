# Configuration Guide

This document explains the configuration structure of TaskFlow, including build settings, workspace config, and storage configurations.

---

## 🛠️ Build Configurations

### Vite Config (`vite.config.ts`)
Controls dev server parameters, plug-ins, and build paths.
```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/TaskFlow/", // Necessary for GitHub Pages subfolder routing
});
```
*Note: If you plan to host the application at the root of a custom domain (e.g., `https://my-domain.com/`), change `base` to `'/'`.*

### PostCSS & Tailwind (`postcss.config.js` & `tailwind.config.js`)
Configures CSS preprocessing. Since we use Tailwind CSS v4, styling components use PostCSS imports for compilation.

---

## 📦 Workspace Configuration

### pnpm Workspace (`pnpm-workspace.yaml`)
TaskFlow is configured as a single-package pnpm workspace. This requires defining the packages array:
```yaml
packages:
  - '.'

allowBuilds:
  esbuild: true
minimumReleaseAgeExclude:
  - lucide-react@1.24.0
  - vite@8.1.4
onlyBuiltDependencies:
  - esbuild
```
> [!IMPORTANT]
> The `packages` array must include `'.'` to represent the root directory. If this configuration is deleted or left blank, `pnpm` will fail to resolve dependencies.

---

## 💾 Storage Configurations

TaskFlow uses browser-native local storage parameters. The storage keys used are:
1.  **`modern-kanban-board-v2`**: Stores the active user session (`user`), projects structure, task list, and current theme configuration.
2.  **`taskflow-registered-users`**: Stores list profiles of registered users, containing names, emails, avatar colors/initials, and SHA-256 password hashes.

To reset the board to default settings, clear these keys from your browser's Developer Tools or click the red **`Clear`** button in the toolbar.
