import {
  DndContext,
  closestCorners,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  DragOverlay,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove } from "@dnd-kit/sortable";
import { BarChart3, Calendar, LayoutGrid, List, Plus, Settings } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
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
import { Toast } from "./components/Toast";
import { Toolbar } from "./components/Toolbar";
import { exportCsv, exportJson, readImportFile } from "./utils/importExport";
import { loadBoardState, saveBoardState } from "./utils/storage";
import { api } from "./utils/api";

export default function App() {
  const initialState = useMemo(() => loadBoardState(), []);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [theme, setTheme] = useState(initialState.theme);
  const [user, setUser] = useState(null);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);
  
  const [activeProjectId, setActiveProjectId] = useState("all");
  const [view, setView] = useState("board");
  
  const [activeTask, setActiveTask] = useState(null);
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("All");
  const [label, setLabel] = useState("All");
  
  const [isModalOpen, setModalOpen] = useState(false);
  const [isNewColumnModalOpen, setNewColumnModalOpen] = useState(false);
  const [isNewProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [isEditProjectModalOpen, setEditProjectModalOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState(null);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Authenticate user on mount
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api.getMe()
        .then((profile) => {
          setUser(profile);
          return api.getBoardState();
        })
        .then((state) => {
          if (state) {
            setProjects(state.projects);
            setTasks(state.tasks);
          }
        })
        .catch(() => {
          api.logout();
          setUser(null);
        });
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    saveBoardState({ theme, user });
  }, [theme, user]);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
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
    () => Array.from(new Set(tasks.flatMap((task) => task.labels ? task.labels.map((item) => item.name) : []))).sort(),
    [tasks],
  );

  // Filter tasks based on Search, Priority, and Label filters + Active Project selection
  const filteredTasks = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesProject = activeProjectId === "all" || task.projectId === activeProjectId;
      
      const matchesQuery =
        !normalized ||
        [task.title, task.description, task.priority, ...(task.labels ? task.labels.map((item) => item.name) : []), ...(task.assignees ? task.assignees.map((person) => person.name) : [])]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      const matchesPriority = priority === "All" || task.priority === priority;
      const matchesLabel = label === "All" || (task.labels && task.labels.some((item) => item.name === label));

      return matchesProject && matchesQuery && matchesPriority && matchesLabel;
    });
  }, [activeProjectId, label, priority, query, tasks]);

  const taskCount = filteredTasks.length;
  
  // Completed count helper: checks if task is in the last column of its project
  const completedCount = useMemo(() => {
    return filteredTasks.filter((task) => {
      const proj = projects.find((p) => p.id === task.projectId);
      if (!proj || !proj.columns || !proj.columns.length) return false;
      const lastColId = proj.columns[proj.columns.length - 1].id;
      return task.status === lastColId;
    }).length;
  }, [filteredTasks, projects]);

  function notify(message, kind = "success") {
    setToast({ message, kind });
  }

  function getTask(id) {
    return tasks.find((task) => task.id === id);
  }

  // Find target project/column from drag target
  function getTargetColumnOrProject(overId) {
    if (projects.some((p) => p.id === overId)) {
      return overId;
    }
    
    if (activeProjectId !== "all") {
      const currentProj = projects.find((p) => p.id === activeProjectId);
      if (currentProj?.columns?.some((c) => c.id === overId)) {
        return overId;
      }
    }
    
    const task = tasks.find((t) => t.id === overId);
    if (task) {
      return activeProjectId === "all" ? task.projectId : task.status;
    }
    return null;
  }

  function handleDragStart(event) {
    setActiveTask(getTask(String(event.active.id)) ?? null);
  }

  function handleDragEnd(event) {
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
      const targetProj = projects.find((p) => p.id === target);
      const targetStatus = targetProj?.columns?.[0]?.id || "todo";
      const updatedTask = { ...activeItem, projectId: target, status: targetStatus };

      setTasks((currentTasks) => currentTasks.map((t) => (t.id === activeId ? updatedTask : t)));
      api.updateTask(updatedTask).catch(() => notify("Failed to sync drag update", "error"));
      notify(`Moved task to ${targetProj?.name}`);
    } else {
      const activeIndex = tasks.findIndex((t) => t.id === activeId);
      const overIndex = tasks.findIndex((t) => t.id === overId);

      const nextTasks = [...tasks];
      nextTasks[activeIndex] = { ...nextTasks[activeIndex], status: target };

      let finalTasks;
      if (overIndex === -1) {
        const [movingTask] = nextTasks.splice(activeIndex, 1);
        const lastIndexInColumn = findLastIndex(nextTasks, (t) => t.status === target && t.projectId === activeProjectId);
        nextTasks.splice(lastIndexInColumn + 1, 0, movingTask);
        finalTasks = nextTasks;
      } else {
        finalTasks = arrayMove(nextTasks, activeIndex, overIndex);
      }

      setTasks(finalTasks);
      const updatedTask = finalTasks.find((t) => t.id === activeId);
      if (updatedTask) {
        api.updateTask(updatedTask).catch(() => notify("Failed to sync drag update", "error"));
      }

      if (activeItem.status !== target) {
        const currentProj = projects.find((p) => p.id === activeProjectId);
        notify(`Moved to ${currentProj?.columns?.find((c) => c.id === target)?.title}`);
      }
    }
  }

  function handleStatusChange(taskId, newStatus) {
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      const updatedTask = { ...task, status: newStatus };
      setTasks((currentTasks) =>
        currentTasks.map((t) => (t.id === taskId ? updatedTask : t)),
      );
      api.updateTask(updatedTask).catch(() => notify("Failed to update status", "error"));
      
      const proj = projects.find((p) => p.columns && p.columns.some((c) => c.id === newStatus));
      const title = proj?.columns?.find((c) => c.id === newStatus)?.title || newStatus;
      notify(`Moved to ${title}`);
    }
  }

  function handleDelete(taskId) {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));
    api.deleteTask(taskId).catch(() => notify("Failed to delete task", "error"));
    notify("Task deleted", "info");
  }

  function handleCreate(task) {
    api.createTask(task)
      .then((createdTask) => {
        setTasks((currentTasks) => [createdTask, ...currentTasks]);
        notify("Task created");
      })
      .catch((err) => notify(err.message || "Failed to create task", "error"));
    setModalOpen(false);
  }

  function handleAddColumn(column) {
    api.addColumn(activeProjectId, column)
      .then((newCol) => {
        setProjects((currentProjects) => {
          return currentProjects.map((proj) => {
            if (proj.id === activeProjectId) {
              return {
                ...proj,
                columns: [...(proj.columns || []), newCol],
              };
            }
            return proj;
          });
        });
        notify(`Created list "${column.title}"`);
      })
      .catch((err) => notify(err.message || "Failed to create list", "error"));
    setNewColumnModalOpen(false);
  }

  function handleCreateProject(project) {
    api.createProject(project)
      .then((newProj) => {
        setProjects((currentProjects) => [...currentProjects, newProj]);
        setActiveProjectId(newProj.id);
        notify(`Created project "${newProj.name}"`);
      })
      .catch((err) => notify(err.message || "Failed to create project", "error"));
    setNewProjectModalOpen(false);
  }

  function handleUpdateProject(id, updates) {
    api.updateProject(id, updates.name, updates.description)
      .then(() => {
        setProjects((currentProjects) => {
          return currentProjects.map((p) => (p.id === id ? { ...p, ...updates } : p));
        });
        notify(`Project settings updated`);
      })
      .catch((err) => notify(err.message || "Failed to update project", "error"));
    setEditProjectModalOpen(false);
  }

  function handleDeleteProject(id) {
    api.deleteProject(id)
      .then(() => {
        setProjects((currentProjects) => currentProjects.filter((p) => p.id !== id));
        setTasks((currentTasks) => currentTasks.filter((t) => t.projectId !== id));
        setActiveProjectId("all");
        notify(`Project deleted`, "info");
      })
      .catch((err) => notify(err.message || "Failed to delete project", "error"));
    setEditProjectModalOpen(false);
  }

  function handleUpdateColumn(columnId, updates) {
    api.updateColumn(activeProjectId, columnId, updates.title, updates.accent)
      .then((updatedCol) => {
        setProjects((currentProjects) => {
          return currentProjects.map((proj) => {
            if (proj.id === activeProjectId) {
              return {
                ...proj,
                columns: proj.columns.map((c) => (c.id === columnId ? updatedCol : c)),
              };
            }
            return proj;
          });
        });
        notify(`List updated`);
      })
      .catch((err) => notify(err.message || "Failed to update list", "error"));
    setEditingColumn(null);
  }

  function handleDeleteColumn(columnId) {
    api.deleteColumn(activeProjectId, columnId)
      .then((res) => {
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
        const fallbackColumnId = res.fallback_column_id || "todo";
        setTasks((currentTasks) => {
          return currentTasks.map((t) => {
            if (t.projectId === activeProjectId && t.status === columnId) {
              return { ...t, status: fallbackColumnId };
            }
            return t;
          });
        });
        notify(`List deleted`, "info");
      })
      .catch((err) => notify(err.message || "Failed to delete list", "error"));
    setEditingColumn(null);
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const imported = await readImportFile(file);
      await api.importBoard(imported);
      const state = await api.getBoardState();
      setProjects(state.projects);
      setTasks(state.tasks);
      notify("Data imported");
    } catch (error) {
      notify(error.message || "Could not import file", "error");
    } finally {
      event.target.value = "";
    }
  }

  function handleClear() {
    api.clearBoard()
      .then(() => {
        setTasks([]);
        if (activeProjectId === "all") {
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
          notify("Cleared all tasks in active project", "info");
        }
        setQuery("");
        setPriority("All");
        setLabel("All");
      })
      .catch(() => notify("Failed to clear board", "error"));
  }

  // Columns to show on Board View
  const boardColumnsToShow = useMemo(() => {
    if (activeProjectId === "all") {
      return projects.map((p) => ({
        id: p.id,
        title: p.name,
        accent: "#3b82f6",
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
          onLogin={async (loggedInUser) => {
            setUser(loggedInUser);
            try {
              const state = await api.getBoardState();
              setProjects(state.projects);
              setTasks(state.tasks);
              notify(`Logged in as ${loggedInUser.name}`);
            } catch {
              notify("Could not load board data", "error");
            }
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
                        api.logout();
                        setUser(null);
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
          project={projects.find((p) => p.id === activeProjectId)}
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

function findLastIndex(items, predicate) {
  for (let index = items.length - 1; index >= 0; index -= 1) {
    if (predicate(items[index])) {
      return index;
    }
  }
  return -1;
}
