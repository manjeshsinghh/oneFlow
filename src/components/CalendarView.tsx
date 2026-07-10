import { useState } from "react";
import { ChevronLeft, ChevronRight, MessageSquare } from "lucide-react";
import { Task, Project } from "../types";

type CalendarViewProps = {
  tasks: Task[];
  projects: Project[];
};

export function CalendarView({ tasks, projects }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  const startDayOfWeek = startOfMonth.getDay(); // 0 = Sunday, 6 = Saturday
  const daysInMonth = endOfMonth.getDate();

  const prevMonthEnd = new Date(year, month, 0).getDate();

  // Generate calendar days grid (including padding from previous/next months)
  const calendarCells: { dateStr: string; dayNum: number; isCurrentMonth: boolean }[] = [];

  // Previous month padding days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthEnd - i;
    const m = month === 0 ? 11 : month - 1;
    const y = month === 0 ? year - 1 : year;
    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarCells.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarCells.push({ dateStr, dayNum: d, isCurrentMonth: true });
  }

  // Next month padding days to fill grid (usually 42 cells total for 6 rows)
  const remainingCells = 42 - calendarCells.length;
  for (let d = 1; d <= remainingCells; d++) {
    const m = month === 11 ? 0 : month + 1;
    const y = month === 11 ? year + 1 : year;
    const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    calendarCells.push({ dateStr, dayNum: d, isCurrentMonth: false });
  }

  function handlePrevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function handleNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Helper to find task status accent color
  function getTaskStatusAccent(task: Task): string {
    const project = projects.find((p) => p.id === task.projectId);
    const column = project?.columns.find((c) => c.id === task.status);
    return column?.accent || "#64748b";
  }

  // Helper to find task project name
  function getTaskProjectName(task: Task): string {
    const project = projects.find((p) => p.id === task.projectId);
    return project?.name || "Unknown Project";
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-soft dark:border-slate-800 dark:bg-slate-900/40">
      {/* Calendar Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <h2 className="text-lg font-bold text-slate-950 dark:text-white">
          {monthNames[month]} {year}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            onClick={handlePrevMonth}
            title="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="secondary-button h-9 px-3 text-xs font-semibold"
            onClick={handleToday}
          >
            Today
          </button>
          <button
            type="button"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            onClick={handleNextMonth}
            title="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Days of the Week Header */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      {/* 6x7 Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg overflow-hidden">
        {calendarCells.map(({ dateStr, dayNum, isCurrentMonth }, idx) => {
          // Filter tasks due on this cell's date
          const cellTasks = tasks.filter((t) => t.dueDate === dateStr);
          const isToday = new Date().toDateString() === new Date(year, month, isCurrentMonth ? dayNum : new Date(dateStr).getDate() + 1).toDateString(); // quick today check

          return (
            <div
              key={`${dateStr}-${idx}`}
              className={`min-h-[100px] bg-white p-2 dark:bg-slate-950 flex flex-col gap-1 transition ${
                isCurrentMonth ? "" : "bg-slate-50/50 dark:bg-slate-950/40 opacity-40"
              }`}
            >
              {/* Day Number Label */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    isToday
                      ? "bg-blue-600 text-white"
                      : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  {dayNum}
                </span>
                {cellTasks.length > 0 && (
                  <span className="text-[10px] font-semibold text-slate-400">
                    {cellTasks.length} task{cellTasks.length > 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto max-h-[80px] scrollbar-thin flex flex-col gap-1">
                {cellTasks.map((task) => {
                  const accentColor = getTaskStatusAccent(task);
                  const projectName = getTaskProjectName(task);

                  return (
                    <div
                      key={task.id}
                      className="group/item relative flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[10px] font-medium border border-slate-100 dark:border-slate-900 bg-slate-50/50 hover:bg-slate-100 dark:bg-slate-900/20 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      <span
                        className="h-1.5 w-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: accentColor }}
                      />
                      <span className="truncate flex-1">{task.title}</span>

                      {/* Premium Hover Card details overlay */}
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 scale-95 opacity-0 rounded-lg border border-slate-200 bg-white p-3 shadow-lg transition-all group-hover/item:scale-100 group-hover/item:opacity-100 dark:border-slate-800 dark:bg-slate-950 text-xs text-slate-700 dark:text-slate-300">
                        <div className="flex items-center gap-1.5 font-bold text-slate-950 dark:text-white">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: accentColor }}
                          />
                          <span className="truncate">{task.title}</span>
                        </div>
                        <p className="mt-1 text-[10px] text-slate-400 truncate">
                          Project: {projectName}
                        </p>
                        <p className="mt-1.5 line-clamp-2 text-[10px] text-slate-500 dark:text-slate-400">
                          {task.description}
                        </p>
                        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-1.5 text-[10px]">
                          <span className="font-semibold px-1 rounded bg-slate-100 dark:bg-slate-800">
                            {task.priority}
                          </span>
                          {task.comments > 0 && (
                            <span className="inline-flex items-center gap-1 text-slate-400">
                              <MessageSquare className="h-2.5 w-2.5" />
                              {task.comments}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
