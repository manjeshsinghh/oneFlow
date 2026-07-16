import { sampleTasks, sampleProjects } from "../data/sampleTasks";

const STORAGE_KEY = "modern-kanban-board-v2";

export function loadBoardState() {
  const fallbackTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { theme: fallbackTheme };
    }

    const parsed = JSON.parse(raw);
    return {
      theme: parsed.theme === "dark" || parsed.theme === "light" ? parsed.theme : fallbackTheme,
      user: parsed.user,
    };
  } catch {
    return { theme: fallbackTheme };
  }
}

export function saveBoardState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme: state.theme, user: state.user }));
}

export function resetBoardState() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem("taskflow-token");
}

export function cloneSampleProjects() {
  return JSON.parse(JSON.stringify(sampleProjects));
}

export function cloneSampleTasks() {
  return JSON.parse(JSON.stringify(sampleTasks));
}
