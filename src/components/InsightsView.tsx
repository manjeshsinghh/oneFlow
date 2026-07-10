import { Task, Project } from "../types";
import { AlertCircle, CheckCircle2, ListTodo, Percent } from "lucide-react";

type InsightsViewProps = {
  tasks: Task[];
  projects: Project[];
  activeProjectId: string | "all";
};

export function InsightsView({ tasks, projects, activeProjectId }: InsightsViewProps) {
  // 1. Completion detection helpers
  function isTaskCompleted(task: Task): boolean {
    const project = projects.find((p) => p.id === task.projectId);
    if (!project || !project.columns.length) {
      return false;
    }
    const lastColId = project.columns[project.columns.length - 1].id;
    return task.status === lastColId;
  }

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(isTaskCompleted).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 2. High priority remaining
  const highPriorityRemaining = tasks.filter((t) => t.priority === "High" && !isTaskCompleted(t)).length;

  // 3. Overdue tasks remaining
  const todayStr = new Date().toISOString().split("T")[0]; // "2026-07-10" or current date
  const overdueTasks = tasks.filter(
    (t) => t.dueDate < todayStr && !isTaskCompleted(t)
  ).length;

  // 4. Status breakdown logic
  // If activeProjectId is specific, show columns of that project.
  // If "all", show overall statuses (todo/ideas, progress/dev, review/qa, done/complete).
  const statusCounts: { title: string; count: number; accent: string }[] = [];
  if (activeProjectId !== "all") {
    const activeProject = projects.find((p) => p.id === activeProjectId);
    if (activeProject) {
      activeProject.columns.forEach((col) => {
        const count = tasks.filter((t) => t.status === col.id).length;
        statusCounts.push({ title: col.title, count, accent: col.accent });
      });
    }
  } else {
    // Group status across all projects
    // To make it simple, we group by status title (since columns have titles like 'To Do', 'Ideas', 'Done', etc.)
    const statusMap: Record<string, { count: number; accent: string }> = {};
    tasks.forEach((task) => {
      const proj = projects.find((p) => p.id === task.projectId);
      const col = proj?.columns.find((c) => c.id === task.status);
      if (col) {
        if (!statusMap[col.title]) {
          statusMap[col.title] = { count: 0, accent: col.accent };
        }
        statusMap[col.title].count++;
      }
    });
    Object.entries(statusMap).forEach(([title, val]) => {
      statusCounts.push({ title, count: val.count, accent: val.accent });
    });
  }

  // 5. Priority breakdown
  const priorityCounts = {
    High: tasks.filter((t) => t.priority === "High").length,
    Medium: tasks.filter((t) => t.priority === "Medium").length,
    Low: tasks.filter((t) => t.priority === "Low").length,
  };

  // 6. Label density
  const labelMap: Record<string, { count: number; color: string }> = {};
  tasks.forEach((t) => {
    t.labels.forEach((l) => {
      if (!labelMap[l.name]) {
        labelMap[l.name] = { count: 0, color: l.color };
      }
      labelMap[l.name].count++;
    });
  });
  const labelStats = Object.entries(labelMap)
    .map(([name, val]) => ({ name, count: val.count, color: val.color }))
    .sort((a, b) => b.count - a.count);

  // 7. Assignee workload (incomplete tasks assigned)
  const assigneeMap: Record<string, { count: number; avatar: string; color: string }> = {};
  tasks.forEach((t) => {
    if (!isTaskCompleted(t)) {
      t.assignees.forEach((a) => {
        if (!assigneeMap[a.name]) {
          assigneeMap[a.name] = { count: 0, avatar: a.avatar, color: a.color };
        }
        assigneeMap[a.name].count++;
      });
    }
  });
  const assigneeStats = Object.entries(assigneeMap)
    .map(([name, val]) => ({ name, count: val.count, avatar: val.avatar, color: val.color }))
    .sort((a, b) => b.count - a.count);

  // SVG Radial circle calculations
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Tasks */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Tasks</span>
            <span className="text-2xl font-bold text-slate-950 dark:text-white">{totalTasks}</span>
          </div>
          <div className="rounded-lg bg-slate-50 p-2.5 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
            <ListTodo className="h-5 w-5" />
          </div>
        </div>

        {/* Completion Rate */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Completion Rate</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-950 dark:text-white">{completionRate}%</span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                {completedTasks} of {totalTasks} done
              </span>
            </div>
          </div>
          <div className="relative flex items-center justify-center">
            <svg className="h-14 w-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r={radius}
                className="stroke-slate-100 dark:stroke-slate-800 fill-none"
                strokeWidth="6"
              />
              <circle
                cx="28"
                cy="28"
                r={radius}
                className="stroke-emerald-500 fill-none transition-all duration-500 ease-out"
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            <Percent className="absolute h-3 w-3 text-slate-400" />
          </div>
        </div>

        {/* High Priority Remaining */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">High Priority Active</span>
            <span className="text-2xl font-bold text-slate-950 dark:text-white">{highPriorityRemaining}</span>
          </div>
          <div className="rounded-lg bg-rose-50 p-2.5 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Overdue Tasks */}
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/40">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overdue Tasks</span>
            <span className="text-2xl font-bold text-slate-950 dark:text-white">{overdueTasks}</span>
          </div>
          <div className="rounded-lg bg-amber-50 p-2.5 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Grid of Breakdown Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Status Distribution */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/40">
          <h3 className="text-sm font-bold text-slate-950 dark:text-white mb-4">Status Distribution</h3>
          <div className="flex flex-col gap-3">
            {statusCounts.map((col) => {
              const pct = totalTasks > 0 ? (col.count / totalTasks) * 100 : 0;
              return (
                <div key={col.title} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{col.title}</span>
                    <span className="font-bold text-slate-950 dark:text-white">
                      {col.count} ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${pct}%`, backgroundColor: col.accent }}
                    />
                  </div>
                </div>
              );
            })}
            {!statusCounts.length && (
              <p className="text-center text-xs text-slate-400 py-6">No data available</p>
            )}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/40">
          <h3 className="text-sm font-bold text-slate-950 dark:text-white mb-4">Priority Breakdown</h3>
          <div className="flex flex-col gap-3">
            {(["High", "Medium", "Low"] as const).map((pri) => {
              const count = priorityCounts[pri];
              const pct = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
              const barColors = {
                High: "bg-rose-500",
                Medium: "bg-amber-500",
                Low: "bg-emerald-500",
              };
              return (
                <div key={pri} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{pri}</span>
                    <span className="font-bold text-slate-950 dark:text-white">
                      {count} ({Math.round(pct)}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ease-out ${barColors[pri]}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workload Meter */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/40">
          <h3 className="text-sm font-bold text-slate-950 dark:text-white mb-4">Assignee Workload (Active Tasks)</h3>
          <div className="flex flex-col gap-3">
            {assigneeStats.map((ast) => {
              // Find max active count to scale meters
              const maxActive = Math.max(...assigneeStats.map((s) => s.count), 1);
              const scalePct = (ast.count / maxActive) * 100;
              return (
                <div key={ast.name} className="flex items-center gap-3">
                  <span
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                    style={{ backgroundColor: ast.color }}
                  >
                    {ast.avatar}
                  </span>
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{ast.name}</span>
                      <span className="font-bold text-slate-950 dark:text-white">{ast.count} active</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${scalePct}%`, backgroundColor: ast.color }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {!assigneeStats.length && (
              <p className="text-center text-xs text-slate-400 py-6">No active tasks assigned</p>
            )}
          </div>
        </div>

        {/* Label Density */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-soft dark:border-slate-800 dark:bg-slate-900/40">
          <h3 className="text-sm font-bold text-slate-950 dark:text-white mb-4">Label Density</h3>
          <div className="flex flex-col gap-3">
            {labelStats.slice(0, 5).map((lst) => {
              const pct = totalTasks > 0 ? (lst.count / totalTasks) * 100 : 0;
              return (
                <div key={lst.name} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{lst.name}</span>
                    <span className="font-bold text-slate-950 dark:text-white">
                      {lst.count} task{lst.count > 1 ? "s" : ""}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${pct}%`, backgroundColor: lst.color }}
                    />
                  </div>
                </div>
              );
            })}
            {!labelStats.length && (
              <p className="text-center text-xs text-slate-400 py-6">No labels used</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
