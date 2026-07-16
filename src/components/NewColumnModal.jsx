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

export function NewColumnModal({ onClose, onCreate, existingColumns }) {
  const [title, setTitle] = useState("");
  const [accent, setAccent] = useState(presetColors[6]); // default to Blue
  const [error, setError] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setError("Column title is required");
      return;
    }

    const id = cleanTitle.toLowerCase().replace(/\s+/g, "-");
    const exists = existingColumns.some(
      (col) => col.id === id || col.title.toLowerCase() === cleanTitle.toLowerCase()
    );

    if (exists) {
      setError("A column with this name already exists");
      return;
    }

    onCreate({
      id,
      title: cleanTitle,
      accent,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm dark:bg-black/60">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl transition dark:border-slate-800 dark:bg-slate-950">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-950 dark:text-white">Add New List (Phase)</h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body / Form */}
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
              placeholder="e.g., QA Backlog, Ready for Review"
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

          {/* Modal Footer Actions */}
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
              Add List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
