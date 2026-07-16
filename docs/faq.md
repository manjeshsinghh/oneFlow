# Frequently Asked Questions (FAQ)

Here are answers to common questions about the TaskFlow application.

---

## ❓ General Questions

### Does TaskFlow store my data online?
No. TaskFlow is a fully client-side application. All project settings, credentials, tasks, and columns are stored locally in your browser's `localStorage`. No data is ever sent to external servers or API backends.

### How secure is my password?
All registered passwords are cryptographically hashed using **SHA-256 Web Crypto hashing** before being saved to browser localStorage. This ensures that even if local storage is exported, cleartext passwords are never exposed.

### What is the default admin account?
For quick testing and review, you can log in using our pre-configured demo account:
*   **Email**: `admin@taskflow.com`
*   **Password**: `password`

### Can I sync TaskFlow across multiple devices?
Since storage is self-contained in the browser's localStorage, data does not sync automatically across different devices or browsers. To migrate your data:
1.  Click **Export JSON** on device A.
2.  Transfer the downloaded file.
3.  Click **Import File** on device B.

---

## ❓ Workspace & Columns Questions

### How do I add workflow columns to a project?
Switch to a specific project board (e.g. not "All Projects"). Scroll to the end of the columns, click the dashed **`Add List (Phase)`** card, type a title, choose a color, and save.

### What happens when I delete a workflow column/list?
When you delete a column, any active tasks inside it are automatically reassigned to the project's first available column, ensuring you do not lose any task data.
