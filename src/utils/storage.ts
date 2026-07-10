import { BoardState, Task, Project } from "../types";
import { sampleTasks, sampleProjects } from "../data/sampleTasks";

const STORAGE_KEY = "modern-kanban-board-v2";

export function loadBoardState(): BoardState {
  const fallbackTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { projects: sampleProjects, tasks: sampleTasks, theme: fallbackTheme };
    }

    const parsed = JSON.parse(raw) as BoardState;
    return {
      projects: Array.isArray(parsed.projects) ? parsed.projects : sampleProjects,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : sampleTasks,
      theme: parsed.theme === "dark" || parsed.theme === "light" ? parsed.theme : fallbackTheme,
      user: parsed.user,
    };
  } catch {
    return { projects: sampleProjects, tasks: sampleTasks, theme: fallbackTheme };
  }
}

export function saveBoardState(state: BoardState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function resetBoardState() {
  localStorage.removeItem(STORAGE_KEY);
}

export function cloneSampleProjects(): Project[] {
  return JSON.parse(JSON.stringify(sampleProjects));
}

export function cloneSampleTasks(): Task[] {
  return JSON.parse(JSON.stringify(sampleTasks));
}
