import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { CalendarDays, GripVertical, MessageSquare, Trash2 } from "lucide-react";
import { Task } from "../types";

type TaskCardProps = {
  task: Task;
  overlay?: boolean;
  onDelete?: (id: string) => void;
};

const priorityClasses = {
  High: "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-500/30",
  Medium: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30",
  Low: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/30",
};

export function TaskCard({ task, overlay = false, onDelete }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", task },
    disabled: overlay,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`group rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition duration-200 dark:border-slate-800 dark:bg-slate-900 ${
        overlay ? "rotate-1 shadow-soft" : "hover:border-slate-300 hover:shadow-md dark:hover:border-slate-700"
      } ${isDragging ? "opacity-40" : "opacity-100"}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-slate-950 dark:text-white">{task.title}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500 dark:text-slate-400">{task.description}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {onDelete && !overlay && (
            <button
              type="button"
              className="mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 opacity-0 group-hover:opacity-100 transition hover:bg-slate-100 hover:text-rose-600 dark:hover:bg-slate-800 dark:hover:text-rose-400"
              onClick={() => onDelete(task.id)}
              aria-label={`Delete ${task.title}`}
              title="Delete task"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            className="mt-0.5 inline-flex h-7 w-7 cursor-grab items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label={`Drag ${task.title}`}
            title="Drag task"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {task.labels.map((label) => (
          <span
            key={`${task.id}-${label.name}`}
            className="rounded-md px-2 py-1 text-xs font-medium text-slate-950 dark:text-white"
            style={{ backgroundColor: `${label.color}33` }}
          >
            {label.name}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex -space-x-2">
          {task.assignees.map((assignee) => (
            <span
              key={`${task.id}-${assignee.name}`}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white dark:border-slate-900"
              style={{ backgroundColor: assignee.color }}
              title={assignee.name}
            >
              {assignee.avatar}
            </span>
          ))}
        </div>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ring-1 ${priorityClasses[task.priority]}`}>
          {task.priority}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(task.dueDate)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          {task.comments}
        </span>
      </div>
    </article>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(`${date}T00:00:00`));
}
