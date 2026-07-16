# Deployment Guide

This document describes how to deploy TaskFlow to GitHub Pages or static cloud hosting platforms.

---

## 🚀 GitHub Pages (Recommended)

Since TaskFlow is a static single-page application, it can be hosted for free directly on GitHub Pages. The repository includes a pre-configured **GitHub Actions Workflow** (`.github/workflows/deploy.yml`) that builds and deploys the app on every push to the `main` branch.

### 1. Enable GitHub Actions Permissions
Ensure that your repository's workflow permissions allow pushing deployments:
1.  Go to your GitHub Repository **Settings** ➔ **Actions** ➔ **General**.
2.  Scroll down to **Workflow permissions**.
3.  Select **Read and write permissions**.
4.  Click **Save**.

### 2. Configure Pages Deployment Source
Once the GitHub Action completes successfully, a new branch named **`gh-pages`** is created. To publish the site:
1.  Go to **Settings** ➔ **Pages**.
2.  Under **Build and deployment** ➔ **Source**, select **`Deploy from a branch`**.
3.  Under **Branch**, select **`gh-pages`** and folder `/ (root)`.
4.  Click **Save**.
5.  Your app will be live at `https://<your-username>.github.io/TaskFlow/`.

---

## ⚡ Static Hosting (Vercel, Netlify, Cloudflare Pages)

Because TaskFlow has no server-side components, you can link the GitHub repository directly to any static host:

1.  **Framework Preset**: Select **Vite** or **Create React App**.
2.  **Build Command**: `pnpm run build` (or `npm run build` / `yarn build`).
3.  **Output Directory**: `dist`.
4.  **Base URL configurations**: If hosting at the root of a custom domain (e.g. `https://my-domain.com/`), ensure that you change the `base` property in `vite.config.ts` to `'/'` instead of `'/TaskFlow/'`.
