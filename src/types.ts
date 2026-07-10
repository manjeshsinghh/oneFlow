export type ColumnId = string;

export type Priority = "High" | "Medium" | "Low";

export type Label = {
  name: string;
  color: string;
};

export type Assignee = {
  name: string;
  avatar: string;
  color: string;
};

export type Task = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: string;
  assignees: Assignee[];
  dueDate: string;
  priority: Priority;
  labels: Label[];
  comments: number;
  createdAt: string;
};

export type Column = {
  id: string;
  title: string;
  accent: string;
};

export type Project = {
  id: string;
  name: string;
  description: string;
  columns: Column[];
};

export type BoardState = {
  projects: Project[];
  tasks: Task[];
  theme: "light" | "dark";
};
