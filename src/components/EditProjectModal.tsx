import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { Project } from "../types";

type EditProjectModalProps = {
  project: Project;
  onClose: () => void;
  onUpdate: (id: string, updates: { name: string; description: string }) => void;
  onDelete: (id: string) => void;
  existingProjects: Project[];
};

export function EditProjectModal({
  project,
  onClose,
  onUpdate,
  onDelete,
  existingProjects,
}: EditProjectModalProps) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Project name is required");
      return;
    }

    const nameExists = existingProjects.some(
      (p) => p.id !== project.id && p.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (nameExists) {
      setError("Another project with this name already exists");
      return;
    }

    onUpdate(project.id, {
      name: cleanName,
      description: description.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm dark:bg-black/60">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl transition dark:border-slate-800 dark:bg-slate-950">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-950 dark:text-white">Edit Project Settings</h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        {confirmDelete ? (
          <div className="mt-4 flex flex-col gap-4">
            <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700 dark:bg-rose-950/20 dark:text-rose-400">
              ⚠️ <strong>Warning:</strong> Deleting project <strong>"{project.name}"</strong> will permanently delete all tasks, lists, and metrics associated with this project. This action cannot be undone.
            </div>
            <div className="flex items-center justify-end gap-2 mt-2">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 transition"
                onClick={() => onDelete(project.id)}
              >
                Yes, Delete Project
              </button>
            </div>
          </div>
        ) : (
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
                className="field-input"
                autoFocus
              />
            </label>

            <label className="field-label">
              Description
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="field-input min-h-24 resize-none py-2"
              />
            </label>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Delete Project
              </button>
              <div className="flex items-center gap-2">
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
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
