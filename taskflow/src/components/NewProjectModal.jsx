import { useState } from "react";
import { X } from "lucide-react";

export function NewProjectModal({ onClose, onCreate, existingProjects }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Project name is required");
      return;
    }

    const nameExists = existingProjects.some(
      (p) => p.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (nameExists) {
      setError("A project with this name already exists");
      return;
    }

    const id = `project-${crypto.randomUUID().slice(0, 8)}`;

    // Create the project with a standard set of default columns/phases
    onCreate({
      id,
      name: cleanName,
      description: description.trim(),
      columns: [
        { id: "todo", title: "To Do", accent: "#64748b" },
        { id: "progress", title: "In Progress", accent: "#2563eb" },
        { id: "done", title: "Done", accent: "#059669" },
      ],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm dark:bg-black/60">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl transition dark:border-slate-800 dark:bg-slate-950">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-950 dark:text-white">Create New Project</h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          {error && (
            <div className="rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">
              {error}
            </div>
          )}

          <label className="field-label">
            Project Name
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              placeholder="e.g., Website Redesign, Mobile iOS App"
              className="field-input"
              autoFocus
            />
          </label>

          <label className="field-label">
            Description
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose or scope of this project..."
              className="field-input min-h-24 resize-none py-2"
            />
          </label>

          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
            ℹ️ New projects are automatically initialized with three default phases: <strong>To Do</strong>, <strong>In Progress</strong>, and <strong>Done</strong>. You can customize, rename, or add columns later.
          </div>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="secondary-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="primary-button"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
