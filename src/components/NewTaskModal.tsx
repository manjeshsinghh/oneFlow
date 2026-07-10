import { FormEvent, useState } from "react";
import { X } from "lucide-react";
import { Priority, Task, Project } from "../types";

type NewTaskModalProps = {
  onClose: () => void;
  onCreate: (task: Task) => void;
  projects: Project[];
  activeProjectId: string | "all";
};

export function NewTaskModal({ onClose, onCreate, projects, activeProjectId }: NewTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  // Set initial project
  const initialProjectId = activeProjectId === "all" ? projects[0]?.id || "" : activeProjectId;
  const [projectId, setProjectId] = useState(initialProjectId);

  // Set active columns based on selected project
  const selectedProject = projects.find((p) => p.id === projectId) || projects[0];
  const projectColumns = selectedProject?.columns || [];

  const [status, setStatus] = useState(projectColumns[0]?.id || "todo");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [dueDate, setDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [labels, setLabels] = useState("Product");

  function handleProjectChange(newProjId: string) {
    setProjectId(newProjId);
    const proj = projects.find((p) => p.id === newProjId);
    if (proj && proj.columns.length) {
      setStatus(proj.columns[0].id);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim() || !description.trim() || !projectId) {
      return;
    }

    onCreate({
      id: crypto.randomUUID(),
      projectId,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate,
      labels: labels
        .split(",")
        .map((label) => label.trim())
        .filter(Boolean)
        .map((label, index) => ({
          name: label,
          color: ["#38bdf8", "#a855f7", "#22c55e", "#f97316"][index % 4],
        })),
      assignees: [{ name: "You", avatar: "YO", color: "#334155" }],
      comments: 0,
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-950"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-950 dark:text-white">New task</h2>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          <label className="field-label">
            Title
            <input className="field-input" value={title} onChange={(event) => setTitle(event.target.value)} autoFocus />
          </label>
          <label className="field-label">
            Description
            <textarea className="field-input min-h-24 resize-none py-2" value={description} onChange={(event) => setDescription(event.target.value)} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field-label">
              Project
              <select className="field-input" value={projectId} onChange={(event) => handleProjectChange(event.target.value)}>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </label>
            <label className="field-label">
              Status / Phase
              <select className="field-input" value={status} onChange={(event) => setStatus(event.target.value)}>
                {projectColumns.map((col) => (
                  <option key={col.id} value={col.id}>{col.title}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="field-label">
              Priority
              <select className="field-input" value={priority} onChange={(event) => setPriority(event.target.value as Priority)}>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>
            <label className="field-label">
              Due date
              <input className="field-input" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
            </label>
          </div>

          <label className="field-label">
            Labels (comma separated)
            <input className="field-input" value={labels} onChange={(event) => setLabels(event.target.value)} />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" className="secondary-button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="primary-button">
            Create task
          </button>
        </div>
      </form>
    </div>
  );
}
