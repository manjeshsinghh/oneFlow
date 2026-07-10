import { BoardState, Priority, Task, Project } from "../types";

const priorities: Priority[] = ["High", "Medium", "Low"];

export function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function exportJson(tasks: Task[], theme: BoardState["theme"]) {
  downloadFile(
    "tasks.json",
    JSON.stringify({ tasks, theme }, null, 2),
    "application/json",
  );
}

export function exportCsv(tasks: Task[]) {
  const headers = [
    "id",
    "projectId",
    "title",
    "description",
    "status",
    "assignees",
    "dueDate",
    "priority",
    "labels",
    "comments",
    "createdAt",
  ];

  const rows = tasks.map((task) => [
    task.id,
    task.projectId || "project-1",
    task.title,
    task.description,
    task.status,
    task.assignees.map((assignee) => `${assignee.name}:${assignee.avatar}:${assignee.color}`).join("|"),
    task.dueDate,
    task.priority,
    task.labels.map((label) => `${label.name}:${label.color}`).join("|"),
    String(task.comments),
    task.createdAt,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(csvEscape).join(","))
    .join("\n");

  downloadFile("tasks.csv", csv, "text/csv");
}

export async function readImportFile(file: File): Promise<BoardState> {
  const text = await file.text();
  if (file.name.toLowerCase().endsWith(".json")) {
    return parseJsonImport(text);
  }

  if (file.name.toLowerCase().endsWith(".csv")) {
    return { projects: [], tasks: parseCsvImport(text), theme: "light" }; // projects will be merged in App.tsx
  }

  throw new Error("Use a JSON or CSV file.");
}

function parseJsonImport(text: string): BoardState {
  const parsed = JSON.parse(text) as unknown;
  
  let tasks: Task[];
  let theme: BoardState["theme"];
  let projects: BoardState["projects"];

  if (Array.isArray(parsed)) {
    tasks = parsed as Task[];
    theme = "light";
    projects = [];
  } else if (parsed && typeof parsed === "object") {
    const obj = parsed as Record<string, unknown>;
    tasks = (obj.tasks as Task[]) || [];
    theme = obj.theme === "dark" ? "dark" : "light";
    projects = (obj.projects as Project[]) || [];
  } else {
    tasks = [];
    theme = "light";
    projects = [];
  }

  return {
    projects,
    tasks: validateTasks(tasks),
    theme,
  };
}

function parseCsvImport(text: string): Task[] {
  const rows = parseCsv(text.trim());
  if (rows.length < 2) {
    throw new Error("CSV must include a header row and at least one task.");
  }

  const headers = rows[0];
  const required = ["title", "description", "status", "dueDate", "priority"];
  const missing = required.filter((header) => !headers.includes(header));
  if (missing.length) {
    throw new Error(`CSV is missing: ${missing.join(", ")}`);
  }

  const tasks = rows.slice(1).map((row, index) => {
    const record = Object.fromEntries(headers.map((header, cellIndex) => [header, row[cellIndex] ?? ""]));
    return {
      id: record.id || `imported-${Date.now()}-${index}`,
      projectId: record.projectId || "project-1",
      title: record.title,
      description: record.description,
      status: record.status,
      assignees: record.assignees
        ? record.assignees.split("|").map((assignee) => {
            const [name, avatar, color] = assignee.split(":");
            return { name, avatar: avatar || initials(name), color: color || "#64748b" };
          })
        : [],
      dueDate: record.dueDate,
      priority: record.priority as Priority,
      labels: record.labels
        ? record.labels.split("|").map((label) => {
            const [name, color] = label.split(":");
            return { name, color: color || "#94a3b8" };
          })
        : [],
      comments: Number(record.comments || 0),
      createdAt: record.createdAt || new Date().toISOString(),
    };
  });

  return validateTasks(tasks);
}

function validateTasks(tasks: Task[]): Task[] {
  return tasks.map((task) => {
    if (!task.title || !task.description) {
      throw new Error("Each task needs a title and description.");
    }
    if (!task.status) {
      throw new Error("Each task needs a status.");
    }
    if (!priorities.includes(task.priority)) {
      throw new Error(`Unknown priority: ${task.priority}`);
    }

    return {
      ...task,
      id: task.id || crypto.randomUUID(),
      projectId: task.projectId || "project-1",
      assignees: Array.isArray(task.assignees) ? task.assignees : [],
      labels: Array.isArray(task.labels) ? task.labels : [],
      comments: Number.isFinite(Number(task.comments)) ? Number(task.comments) : 0,
      createdAt: task.createdAt || new Date().toISOString(),
    };
  });
}

function parseCsv(csv: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }

  row.push(cell);
  rows.push(row);
  return rows.filter((entry) => entry.some(Boolean));
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
