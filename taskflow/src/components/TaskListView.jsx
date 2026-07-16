import { useState, useRef, useEffect } from "react";
import { CalendarDays, ChevronDown, MessageSquare, Trash2 } from "lucide-react";

const priorityClasses = {
  High: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30",
  Medium: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30",
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30",
};

export function TaskListView({ tasks, projects, onStatusChange, onDelete }) {
  if (!tasks.length) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900/40">
        <p className="text-sm text-slate-400 dark:text-slate-500">No tasks found matching your filters</p>
      </div>
    );
  }

  // Find project name for display
  function getProjectName(projId) {
    return projects.find((p) => p.id === projId)?.name || "Unknown Project";
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-soft dark:border-slate-800 dark:bg-slate-900/40">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
              <th className="px-6 py-4 font-semibold">Task</th>
              <th className="px-6 py-4 font-semibold w-[160px]">Project</th>
              <th className="px-6 py-4 font-semibold w-[180px]">Status / Phase</th>
              <th className="px-6 py-4 font-semibold w-[120px]">Priority</th>
              <th className="px-6 py-4 font-semibold">Labels</th>
              <th className="px-6 py-4 font-semibold w-[120px]">Assignees</th>
              <th className="px-6 py-4 font-semibold w-[150px]">Due Date</th>
              <th className="px-6 py-4 font-semibold w-[80px] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {tasks.map((task) => {
              const taskProject = projects.find((p) => p.id === task.projectId);
              const taskColumns = taskProject?.columns || [];

              return (
                <tr
                  key={task.id}
                  className="group hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors"
                >
                  {/* Title & Description */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 pr-4">
                       <h3 className="font-semibold text-slate-950 dark:text-white line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {task.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {task.description}
                      </p>
                    </div>
                  </td>

                  {/* Project Name */}
                  <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span className="truncate max-w-[140px] block">
                      {getProjectName(task.projectId)}
                    </span>
                  </td>

                  {/* Status Column */}
                  <td className="px-6 py-4">
                    <StatusDropdown
                      currentStatus={task.status}
                      columns={taskColumns}
                      onChange={(newStatus) => onStatusChange(task.id, newStatus)}
                    />
                  </td>

                  {/* Priority */}
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${priorityClasses[task.priority] || ""}`}>
                      {task.priority}
                    </span>
                  </td>

                  {/* Labels */}
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {task.labels && task.labels.map((label) => (
                        <span
                          key={label.name}
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-950 dark:text-white"
                          style={{ backgroundColor: `${label.color}33` }}
                        >
                          {label.name}
                        </span>
                      ))}
                      {(!task.labels || !task.labels.length) && (
                        <span className="text-xs text-slate-400 dark:text-slate-600">-</span>
                      )}
                    </div>
                  </td>

                  {/* Assignees */}
                  <td className="px-6 py-4">
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {task.assignees && task.assignees.map((assignee) => (
                        <span
                          key={assignee.name}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white dark:border-slate-900"
                          style={{ backgroundColor: assignee.color }}
                          title={assignee.name}
                        >
                          {assignee.avatar}
                        </span>
                      ))}
                      {(!task.assignees || !task.assignees.length) && (
                        <span className="text-xs text-slate-400 dark:text-slate-600">-</span>
                      )}
                    </div>
                  </td>

                  {/* Due Date & Comments */}
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                        {formatDate(task.dueDate)}
                      </span>
                      {task.comments > 0 && (
                        <span className="inline-flex items-center gap-1.5 text-[10px]">
                          <MessageSquare className="h-3 w-3 text-slate-400" />
                          {task.comments} comment{task.comments > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onDelete(task.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-400 transition"
                      title="Delete task"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "";
  try {
    return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T00:00:00`));
  } catch {
    return date;
  }
}

function StatusDropdown({ currentStatus, columns, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const currentColumn = (columns && columns.find((col) => col.id === currentStatus)) || (columns && columns[0]);
  if (!currentColumn) {
    return null;
  }

  return (
    <div ref={dropdownRef} className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm transition ring-1 ring-slate-200 dark:ring-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: currentColumn.accent }} />
        <span className="text-slate-700 dark:text-slate-300">{currentColumn.title}</span>
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 z-30 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-md outline-none dark:border-slate-800 dark:bg-slate-950">
          {columns && columns.map((column) => (
            <button
              key={column.id}
              type="button"
              onClick={() => {
                onChange(column.id);
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
            >
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: column.accent }} />
              {column.title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
