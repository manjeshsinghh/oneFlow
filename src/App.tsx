import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { BarChart3, Calendar, LayoutGrid, List, Plus, Settings } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { BoardColumn } from "./components/BoardColumn";
import { NewTaskModal } from "./components/NewTaskModal";
import { NewColumnModal } from "./components/NewColumnModal";
import { NewProjectModal } from "./components/NewProjectModal";
import { EditProjectModal } from "./components/EditProjectModal";
import { EditColumnModal } from "./components/EditColumnModal";
import { AuthScreen } from "./components/AuthScreen";
import { TaskCard } from "./components/TaskCard";
import { TaskListView } from "./components/TaskListView";
import { CalendarView } from "./components/CalendarView";
import { InsightsView } from "./components/InsightsView";
import { ThemeToggle } from "./components/ThemeToggle";
import { Toast, ToastKind } from "./components/Toast";
import { Toolbar } from "./components/Toolbar";
import { ColumnId, Priority, Task, Project, Column, User } from "./types";
import { exportCsv, exportJson, readImportFile } from "./utils/importExport";
import { loadBoardState, resetBoardState, saveBoardState } from "./utils/storage";

type ToastState = {
  message: string;
  kind: ToastKind;
};

export default function App() {
  const initialState = useMemo(() => loadBoardState(), []);
  const [projects, setProjects] = useState<Project[]>(initialState.projects);
  const [tasks, setTasks] = useState<Task[]>(initialState.tasks);
  const [theme, setTheme] = useState<"light" | "dark">(initialState.theme);
  const [user, setUser] = useState<User | undefined>(initialState.user);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
  const [activeProjectId, setActiveProjectId] = useState<string | "all">("all");
  const [view, setView] = useState<"board" | "list" | "calendar" | "insights">("board");
  
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState<Priority | "All">("All");
  const [label, setLabel] = useState("All");
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [isNewColumnModalOpen, setNewColumnModalOpen] = useState(false);
  const [isNewProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [isEditProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    saveBoardState({ projects, tasks, theme, user });
  }, [projects, tasks, theme, user]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);
  // Unique labels list across all tasks
  const labels = useMemo(
    () => Array.from(new Set(tasks.flatMap((task) => task.labels.map((item) => item.name)))).sort(),
    [tasks],
  );

  // Filter tasks based on Search, Priority, and Label filters + Active Project selection
  const filteredTasks = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesProject = activeProjectId === "all" || task.projectId === activeProjectId;
      
      const matchesQuery =
        !normalized ||
        [task.title, task.description, task.priority, ...task.labels.map((item) => item.name), ...task.assignees.map((person) => person.name)]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      const matchesPriority = priority === "All" || task.priority === priority;
      const matchesLabel = label === "All" || task.labels.some((item) => item.name === label);

      return matchesProject && matchesQuery && matchesPriority && matchesLabel;
    });
  }, [activeProjectId, label, priority, query, tasks]);

  const taskCount = filteredTasks.length;
  
  // Completed count helper: checks if task is in the last column of its project
  const completedCount = useMemo(() => {
    return filteredTasks.filter((task) => {
      const proj = projects.find((p) => p.id === task.projectId);
      if (!proj || !proj.columns.length) return false;
      const lastColId = proj.columns[proj.columns.length - 1].id;
      return task.status === lastColId;
    }).length;
  }, [filteredTasks, projects]);

  function notify(message: string, kind: ToastKind = "success") {
    setToast({ message, kind });
  }

  function getTask(id: string) {
    return tasks.find((task) => task.id === id);
  }

  // Find target project/column from drag target
  function getTargetColumnOrProject(overId: string): string | null {
    if (projects.some((p) => p.id === overId)) {
      return overId;
    }
    
    if (activeProjectId !== "all") {
      const currentProj = projects.find((p) => p.id === activeProjectId);
      if (currentProj?.columns.some((c) => c.id === overId)) {
        return overId;
      }
    }
    
    const task = tasks.find((t) => t.id === overId);
    if (task) {
      return activeProjectId === "all" ? task.projectId : task.status;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveTask(getTask(String(event.active.id)) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    const activeItem = getTask(activeId);
    const target = getTargetColumnOrProject(overId);

    if (!activeItem || !target) {
      return;
    }

    if (activeProjectId === "all") {
      // Moving task between projects
      setTasks((currentTasks) => {
        return currentTasks.map((t) => {
          if (t.id === activeId) {
            const targetProj = projects.find((p) => p.id === target);
            const targetStatus = targetProj?.columns[0]?.id || "todo";
            return { ...t, projectId: target, status: targetStatus };
          }
          return t;
        });
      });
      notify(`Moved task to ${projects.find((p) => p.id === target)?.name}`);
    } else {
      // Moving task between phases of the same project
      setTasks((currentTasks) => {
        const activeIndex = currentTasks.findIndex((t) => t.id === activeId);
        const overIndex = currentTasks.findIndex((t) => t.id === overId);

        const nextTasks = [...currentTasks];
        nextTasks[activeIndex] = { ...nextTasks[activeIndex], status: target };

        if (overIndex === -1) {
          const [movingTask] = nextTasks.splice(activeIndex, 1);
          const lastIndexInColumn = findLastIndex(nextTasks, (t) => t.status === target && t.projectId === activeProjectId);
          nextTasks.splice(lastIndexInColumn + 1, 0, movingTask);
          return nextTasks;
        }

        return arrayMove(nextTasks, activeIndex, overIndex);
      });

      if (activeItem.status !== target) {
        const currentProj = projects.find((p) => p.id === activeProjectId);
        notify(`Moved to ${currentProj?.columns.find((c) => c.id === target)?.title}`);
      }
    }
  }

  function handleStatusChange(taskId: string, newStatus: ColumnId) {
    setTasks((currentTasks) =>
      currentTasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)),
    );
    // Find column title for toast
    const proj = projects.find((p) => p.columns.some((c) => c.id === newStatus));
    const title = proj?.columns.find((c) => c.id === newStatus)?.title || newStatus;
    notify(`Moved to ${title}`);
  }

  function handleDelete(taskId: string) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
    notify("Task deleted", "info");
  }

  function handleCreate(task: Task) {
    setTasks((currentTasks) => [task, ...currentTasks]);
    setModalOpen(false);
    notify("Task created");
  }

  function handleAddColumn(column: Column) {
    setProjects((currentProjects) => {
      return currentProjects.map((proj) => {
        if (proj.id === activeProjectId) {
          return {
            ...proj,
            columns: [...proj.columns, column],
          };
        }
        return proj;
      });
    });
    setNewColumnModalOpen(false);
    notify(`Created list "${column.title}"`);
  }

  function handleCreateProject(project: Project) {
    setProjects((currentProjects) => [...currentProjects, project]);
    setNewProjectModalOpen(false);
    setActiveProjectId(project.id);
    notify(`Created project "${project.name}"`);
  }

  function handleUpdateProject(id: string, updates: { name: string; description: string }) {
    setProjects((currentProjects) => {
      return currentProjects.map((p) => (p.id === id ? { ...p, ...updates } : p));
    });
    setEditProjectModalOpen(false);
    notify(`Project settings updated`);
  }

  function handleDeleteProject(id: string) {
    setProjects((currentProjects) => currentProjects.filter((p) => p.id !== id));
    setTasks((currentTasks) => currentTasks.filter((t) => t.projectId !== id));
    setEditProjectModalOpen(false);
    setActiveProjectId("all");
    notify(`Project deleted`, "info");
  }

  function handleUpdateColumn(columnId: string, updates: { title: string; accent: string }) {
    setProjects((currentProjects) => {
      return currentProjects.map((proj) => {
        if (proj.id === activeProjectId) {
          return {
            ...proj,
            columns: proj.columns.map((c) => (c.id === columnId ? { ...c, ...updates } : c)),
          };
        }
        return proj;
      });
    });
    setEditingColumn(null);
    notify(`List updated`);
  }

  function handleDeleteColumn(columnId: string) {
    setProjects((currentProjects) => {
      return currentProjects.map((proj) => {
        if (proj.id === activeProjectId) {
          return {
            ...proj,
            columns: proj.columns.filter((c) => c.id !== columnId),
          };
        }
        return proj;
      });
    });

    // Move any tasks that belonged to this column to the FIRST column in the project
    const activeProject = projects.find((p) => p.id === activeProjectId);
    const remainingColumns = activeProject?.columns.filter((c) => c.id !== columnId) || [];
    const fallbackColumnId = remainingColumns[0]?.id || "todo";

    setTasks((currentTasks) => {
      return currentTasks.map((t) => {
        if (t.projectId === activeProjectId && t.status === columnId) {
          return { ...t, status: fallbackColumnId };
        }
        return t;
      });
    });

    setEditingColumn(null);
    notify(`List deleted`, "info");
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const imported = await readImportFile(file);
      // Merge imported projects if any exist
      if (imported.projects && imported.projects.length) {
        setProjects(imported.projects);
      }
      setTasks(imported.tasks);
      setTheme(imported.theme);
      notify("Data imported");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Could not import file", "error");
    } finally {
      event.target.value = "";
    }
  }

  function handleClear() {
    resetBoardState();
    if (activeProjectId === "all") {
      setTasks([]);
      setProjects([
        {
          id: "project-1",
          name: "Default Project",
          description: "My first project",
          columns: [
            { id: "todo", title: "To Do", accent: "#64748b" },
            { id: "progress", title: "In Progress", accent: "#2563eb" },
            { id: "done", title: "Done", accent: "#059669" },
          ],
        },
      ]);
      setActiveProjectId("project-1");
      notify("All projects and tasks deleted", "info");
    } else {
      setTasks((currentTasks) => currentTasks.filter((t) => t.projectId !== activeProjectId));
      notify("Cleared all tasks in active project", "info");
    }
    setQuery("");
    setPriority("All");
    setLabel("All");
  }

  // Columns to show on Board View:
  // If "all", each column is a Project.
  // If specific project, each column is a custom Column/Phase.
  const boardColumnsToShow = useMemo(() => {
    if (activeProjectId === "all") {
      return projects.map((p) => ({
        id: p.id,
        title: p.name,
        accent: "#3b82f6", // Default Blue accent for projects
      }));
    } else {
      const activeProj = projects.find((p) => p.id === activeProjectId);
      return activeProj?.columns || [];
    }
  }, [activeProjectId, projects]);

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <AuthScreen
          onLogin={(loggedInUser) => {
            setUser(loggedInUser);
            notify(`Logged in as ${loggedInUser.name}`);
          }}
        />
        {toast && <Toast message={toast.message} kind={toast.kind} />}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-normal text-slate-950 dark:text-white">TaskFlow</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {taskCount} tasks, {completedCount} done
              </p>
            </div>
            
            {/* Project Selection Dropdown */}
            <div className="ml-4 flex items-center gap-2">
              <select
                value={activeProjectId}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-slate-600 dark:focus:ring-slate-800"
              >
                <option value="all">📂 All Projects (Global Board)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>📁 {p.name}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setNewProjectModalOpen(true)}
                className="inline-flex h-10 px-3 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition shrink-0"
                title="Create New Project"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                New Project
              </button>
              {activeProjectId !== "all" && (
                <button
                  type="button"
                  onClick={() => setEditProjectModalOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition shrink-0"
                  title="Rename / Edit Project"
                >
                  <Settings className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher Button Group */}
            <div className="flex items-center rounded-lg bg-slate-100 p-1 dark:bg-slate-900">
              <button
                type="button"
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  view === "board"
                    ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
                onClick={() => setView("board")}
                title="Board View"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Board
              </button>
              <button
                type="button"
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  view === "list"
                    ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
                onClick={() => setView("list")}
                title="List View"
              >
                <List className="h-3.5 w-3.5" />
                List
              </button>
              <button
                type="button"
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  view === "calendar"
                    ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
                onClick={() => setView("calendar")}
                title="Calendar View"
              >
                <Calendar className="h-3.5 w-3.5" />
                Calendar
              </button>
              <button
                type="button"
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  view === "insights"
                    ? "bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
                onClick={() => setView("insights")}
                title="Insights View"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Insights
              </button>
            </div>
            
            <ThemeToggle theme={theme} onToggle={() => setTheme((current) => (current === "dark" ? "light" : "dark"))} />
            
            {user && (
              <div className="relative" ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(!isProfileOpen)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 dark:border-slate-800 text-xs font-bold text-white shadow-sm transition hover:scale-105 shrink-0"
                  style={{ backgroundColor: user.color }}
                  title={`${user.name} (${user.email})`}
                >
                  {user.avatar}
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 z-40 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-slate-950">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUser(undefined);
                        setProfileOpen(false);
                        notify("Logged out", "info");
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            <button type="button" className="primary-button h-10 shrink-0" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              New Task
            </button>
          </div>
        </div>
        <Toolbar
          query={query}
          priority={priority}
          label={label}
          labels={labels}
          fileInputRef={fileInputRef}
          onQueryChange={setQuery}
          onPriorityChange={setPriority}
          onLabelChange={setLabel}
          onImport={handleImport}
          onExportJson={() => {
            exportJson(tasks, theme);
            notify("JSON exported");
          }}
          onExportCsv={() => {
            exportCsv(tasks);
            notify("CSV exported");
          }}
          onClear={handleClear}
        />
      </header>

      <main className="px-4 py-5">
        {view === "board" ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveTask(null)}
          >
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
              {boardColumnsToShow.map((column) => {
                // If global "all" is active, filter tasks by projectId.
                // If project is selected, filter tasks by status.
                const columnTasks = activeProjectId === "all"
                  ? filteredTasks.filter((task) => task.projectId === column.id)
                  : filteredTasks.filter((task) => task.status === column.id);

                return (
                  <div key={column.id} className="min-w-[280px] w-[320px] flex-shrink-0 flex">
                    <BoardColumn
                      column={column}
                      tasks={columnTasks}
                      onDelete={handleDelete}
                      onEdit={activeProjectId !== "all" ? setEditingColumn : undefined}
                    />
                  </div>
                );
              })}
              
              {/* "Add List" Card - only shown in project-specific view */}
              {activeProjectId !== "all" && (
                <button
                  type="button"
                  onClick={() => setNewColumnModalOpen(true)}
                  className="flex h-[360px] min-w-[280px] w-[320px] flex-shrink-0 flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-700 bg-slate-50/20 hover:bg-slate-50/50 dark:bg-transparent dark:hover:bg-slate-900/10 transition group"
                >
                  <Plus className="h-6 w-6 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 mb-2 transition" />
                  <span className="text-sm font-semibold text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition">
                    Add List (Phase)
                  </span>
                </button>
              )}
            </div>

            <DragOverlay adjustScale={false}>
              {activeTask ? <TaskCard task={activeTask} overlay onDelete={handleDelete} /> : null}
            </DragOverlay>
          </DndContext>
        ) : view === "list" ? (
          <TaskListView
            tasks={filteredTasks}
            projects={projects}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        ) : view === "calendar" ? (
          <CalendarView
            tasks={filteredTasks}
            projects={projects}
          />
        ) : (
          <InsightsView
            tasks={filteredTasks}
            projects={projects}
            activeProjectId={activeProjectId}
          />
        )}
      </main>

      <button
        type="button"
        className="fixed bottom-5 right-5 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        onClick={() => setModalOpen(true)}
        aria-label="New task"
        title="New task"
      >
        <Plus className="h-5 w-5" />
      </button>

      {isModalOpen && (
        <NewTaskModal
          onClose={() => setModalOpen(false)}
          onCreate={handleCreate}
          projects={projects}
          activeProjectId={activeProjectId}
          currentUser={user}
        />
      )}
      
      {isNewColumnModalOpen && (
        <NewColumnModal
          onClose={() => setNewColumnModalOpen(false)}
          onCreate={handleAddColumn}
          existingColumns={boardColumnsToShow}
        />
      )}

      {isNewProjectModalOpen && (
        <NewProjectModal
          onClose={() => setNewProjectModalOpen(false)}
          onCreate={handleCreateProject}
          existingProjects={projects}
        />
      )}

      {isEditProjectModalOpen && activeProjectId !== "all" && (
        <EditProjectModal
          project={projects.find((p) => p.id === activeProjectId)!}
          onClose={() => setEditProjectModalOpen(false)}
          onUpdate={handleUpdateProject}
          onDelete={handleDeleteProject}
          existingProjects={projects}
        />
      )}

      {editingColumn && (
        <EditColumnModal
          column={editingColumn}
          onClose={() => setEditingColumn(null)}
          onUpdate={handleUpdateColumn}
          onDelete={handleDeleteColumn}
          existingColumns={boardColumnsToShow}
        />
      )}
      
      {toast && <Toast message={toast.message} kind={toast.kind} />}
    </div>
  );
}

function findLastIndex<T>(items: T[], predicate: (item: T) => boolean) {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index])) {
      return index;
    }
  }

  return -1;
}
