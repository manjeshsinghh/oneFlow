export const sampleProjects = [
  {
    id: "project-1",
    name: "Platform Engineering",
    description: "Core infrastructure, API endpoints, and platform tooling tasks.",
    columns: [
      { id: "backlog", title: "Backlog", accent: "#64748b" },
      { id: "progress", title: "In Progress", accent: "#2563eb" },
      { id: "qa", title: "Quality Assurance", accent: "#7c3aed" },
      { id: "done", title: "Done", accent: "#059669" },
    ],
  },
  {
    id: "project-2",
    name: "Growth Marketing",
    description: "Acquisition landing pages, user onboarding optimization, and copy sprint.",
    columns: [
      { id: "ideas", title: "Ideas", accent: "#f59e0b" },
      { id: "design", title: "Design & Copy", accent: "#db2777" },
      { id: "prod", title: "Production", accent: "#0891b2" },
      { id: "complete", title: "Complete", accent: "#10b981" },
    ],
  },
];

export const sampleTasks = [
  {
    id: "task-1",
    projectId: "project-2",
    title: "Map onboarding activation path",
    description: "Audit the first-run journey and identify moments where new teams lose momentum.",
    status: "ideas",
    assignees: [
      { name: "Ava Stone", avatar: "AS", color: "#2563eb" },
      { name: "Maya Chen", avatar: "MC", color: "#f97316" },
    ],
    dueDate: "2026-07-14",
    priority: "High",
    labels: [
      { name: "Research", color: "#38bdf8" },
      { name: "Growth", color: "#84cc16" },
    ],
    comments: 8,
    createdAt: "2026-07-01T09:00:00.000Z",
  },
  {
    id: "task-2",
    projectId: "project-1",
    title: "Design sprint planning surface",
    description: "Create a dense planning view for prioritizing sprint candidates across squads.",
    status: "progress",
    assignees: [
      { name: "Leo Park", avatar: "LP", color: "#14b8a6" },
    ],
    dueDate: "2026-07-18",
    priority: "Medium",
    labels: [
      { name: "Design", color: "#a855f7" },
      { name: "Platform", color: "#22c55e" },
    ],
    comments: 5,
    createdAt: "2026-07-02T10:30:00.000Z",
  },
  {
    id: "task-3",
    projectId: "project-1",
    title: "Ship CSV import validation",
    description: "Show clear import errors for missing columns, invalid dates, and unknown priorities.",
    status: "qa",
    assignees: [
      { name: "Nora Patel", avatar: "NP", color: "#e11d48" },
      { name: "Sam Rivera", avatar: "SR", color: "#0f766e" },
    ],
    dueDate: "2026-07-10",
    priority: "High",
    labels: [
      { name: "Frontend", color: "#f59e0b" },
      { name: "Data", color: "#06b6d4" },
    ],
    comments: 12,
    createdAt: "2026-07-03T14:15:00.000Z",
  },
  {
    id: "task-4",
    projectId: "project-2",
    title: "Finalize billing empty states",
    description: "Polish upgrade, invoice, and failed payment states with consistent tone and spacing.",
    status: "complete",
    assignees: [
      { name: "Iris Kim", avatar: "IK", color: "#db2777" },
    ],
    dueDate: "2026-07-08",
    priority: "Low",
    labels: [
      { name: "UX", color: "#6366f1" },
    ],
    comments: 3,
    createdAt: "2026-06-29T11:20:00.000Z",
  },
  {
    id: "task-5",
    projectId: "project-1",
    title: "Instrument release health dashboard",
    description: "Track adoption, error rate, support volume, and latency after each release window.",
    status: "backlog",
    assignees: [
      { name: "Owen Wells", avatar: "OW", color: "#0891b2" },
    ],
    dueDate: "2026-07-22",
    priority: "Medium",
    labels: [
      { name: "Analytics", color: "#10b981" },
      { name: "Ops", color: "#ef4444" },
    ],
    comments: 6,
    createdAt: "2026-07-05T08:45:00.000Z",
  },
  {
    id: "task-6",
    projectId: "project-1",
    title: "Refine command menu shortcuts",
    description: "Add discoverable keyboard paths for creating tasks, moving cards, and switching filters.",
    status: "progress",
    assignees: [
      { name: "Maya Chen", avatar: "MC", color: "#f97316" },
      { name: "Sam Rivera", avatar: "SR", color: "#0f766e" },
    ],
    dueDate: "2026-07-16",
    priority: "Low",
    labels: [
      { name: "Accessibility", color: "#8b5cf6" },
      { name: "Product", color: "#f43f5e" },
    ],
    comments: 4,
    createdAt: "2026-07-04T12:00:00.000Z",
  },
];
