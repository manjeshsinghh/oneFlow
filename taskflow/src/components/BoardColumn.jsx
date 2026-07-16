import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { Edit2 } from "lucide-react";
import { TaskCard } from "./TaskCard";

export function BoardColumn({ column, tasks, onDelete, onEdit }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id, data: { type: "column", column } });

  return (
    <section className="flex min-h-[360px] min-w-[280px] flex-1 flex-col rounded-lg border border-slate-200 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-900/40">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: column.accent }} />
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{column.title}</h2>
          {onEdit && (
            <button
              type="button"
              onClick={() => onEdit(column)}
              className="inline-flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
              title="Rename / Edit List"
            >
              <Edit2 className="h-3 w-3" />
            </button>
          )}
        </div>
        <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200 dark:bg-slate-950 dark:text-slate-400 dark:ring-slate-800 shrink-0">
          {tasks.length}
        </span>
      </header>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex flex-1 flex-col gap-3 p-3 transition ${
            isOver ? "bg-slate-200/80 dark:bg-slate-800/70" : "bg-transparent"
          }`}
        >
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onDelete={onDelete} />
          ))}
          {!tasks.length && (
            <div className="flex min-h-[140px] items-center justify-center rounded-lg border border-dashed border-slate-300 px-4 text-center text-sm text-slate-400 dark:border-slate-700">
              Drop tasks here
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  );
}
