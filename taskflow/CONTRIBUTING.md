# Contributing to TaskFlow

First off, thank you for contributing to TaskFlow! Your help keeps this project robust, fast, and feature-rich.

---

## 🛠️ Local Development Setup

To contribute to TaskFlow, configure your local workspace by following these steps:

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/TaskFlow.git
   cd TaskFlow
   ```
3. **Install dependencies** using `pnpm`:
   ```bash
   pnpm install
   ```
4. **Run the development server**:
   ```bash
   pnpm run dev
   ```
5. **Visit the app**: Open `http://localhost:5173/TaskFlow/` in your browser.

---

## 📐 Code Style & Guidelines

### TypeScript & React
*   Use functional components with React Hooks.
*   Type all props and function return values explicitly. Avoid using the `any` keyword.
*   Pass variables as explicit parameters. Avoid implicit global variables.

### CSS & Styling
*   Avoid adding inline Tailwind utility classes for basic fields (e.g., inputs, buttons).
*   Add reusable styles inside `src/styles.css` using custom classes, e.g. `.field-input`, `.primary-button`, `.icon-button`, `.secondary-button`.

### Security Standards
*   **No Plaintext Passwords**: Cryptographically protect local credential registers using browser-native SHA-256 Web Crypto hashing.
*   **Neutralize CSV Formula Injection**: All cells exported in CSV format must be sanitized against formula indicators (`=`, `+`, `-`, `@`, `\t`, `\r`) by prepending a single quote `'`.
*   **Strict CSP**: Maintain the Content Security Policy meta tag in `index.html` to block execution of unverified inline scripts or external origins.

---

## 🧪 Testing and Verifying Changes

We do not have unit test frameworks configured in the repository; instead, we rely on TypeScript compilation and lint verification:

1. **Verify TypeScript compiles** without warnings:
   ```bash
   pnpm run build
   ```
2. **Verify ESLint passes** with zero warnings and zero errors:
   ```bash
   pnpm run lint
   ```

All PRs must compile cleanly and pass the lint check before being merged.

---

## ✉️ Commit Messages

We encourage clear, action-oriented commit messages. For example:
- `feat: add edit modal for customizing column headers`
- `fix: resolve dnd drop offset inside nested workspaces`
- `security: integrate SHA-256 hash checking for local auth`
