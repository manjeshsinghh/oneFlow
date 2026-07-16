import { useState } from "react";
import { X } from "lucide-react";

const presetColors = [
  "#64748b", // Slate
  "#ef4444", // Red
  "#f97316", // Orange
  "#eab308", // Yellow
  "#22c55e", // Green
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#d946ef", // Magenta
];

export function EditColumnModal({
  column,
  onClose,
  onUpdate,
  onDelete,
  existingColumns,
}) {
  const [title, setTitle] = useState(column.title);
  const [accent, setAccent] = useState(column.accent);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError("List title is required");
      return;
    }

    const titleExists = existingColumns.some(
      (col) => col.id !== column.id && col.title.toLowerCase() === cleanTitle.toLowerCase()
    );
    if (titleExists) {
      setError("Another list with this name already exists");
      return;
    }

    onUpdate(column.id, {
      title: cleanTitle,
      accent,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm dark:bg-black/60">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl transition dark:border-slate-800 dark:bg-slate-950">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-950 dark:text-white">Edit List Settings</h2>
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
              ⚠️ <strong>Warning:</strong> Deleting list <strong>"{column.title}"</strong> will remove it from this project board. Any active tasks in this list will be reassigned to the first available list in this project.
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
                onClick={() => onDelete(column.id)}
              >
                Yes, Delete List
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
              List Title
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setError("");
                }}
                className="field-input"
                autoFocus
              />
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Accent Color</span>
              <div className="flex flex-wrap gap-2">
                {presetColors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAccent(color)}
                    className={`h-7 w-7 rounded-full border-2 transition hover:scale-105 ${
                      accent === color
                        ? "border-slate-900 dark:border-white scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline bg-transparent border-none p-0 cursor-pointer"
              >
                Delete List
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
