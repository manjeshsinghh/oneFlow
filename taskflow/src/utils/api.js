const TOKEN_KEY = "taskflow-token";

async function request(url, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Request failed");
  }

  return response.json();
}

export const api = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  async login(email, password) {
    const params = new URLSearchParams();
    params.append("username", email);
    params.append("password", password);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Invalid credentials");
    }

    const data = await response.json();
    localStorage.setItem(TOKEN_KEY, data.access_token);
    return data.user;
  },

  async register(email, password, name, avatar, color) {
    await request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name, avatar, color }),
    });
    // Log in automatically after registration
    return this.login(email, password);
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
  },

  async getMe() {
    return request("/api/auth/me");
  },

  async getBoardState() {
    return request("/api/board");
  },

  async createProject(project) {
    return request("/api/projects", {
      method: "POST",
      body: JSON.stringify(project),
    });
  },

  async updateProject(id, name, description) {
    return request(`/api/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify({ name, description }),
    });
  },

  async deleteProject(id) {
    return request(`/api/projects/${id}`, {
      method: "DELETE",
    });
  },

  async addColumn(projectId, column) {
    return request(`/api/projects/${projectId}/columns`, {
      method: "POST",
      body: JSON.stringify(column),
    });
  },

  async updateColumn(projectId, columnId, title, accent) {
    return request(`/api/projects/${projectId}/columns/${columnId}`, {
      method: "PUT",
      body: JSON.stringify({ title, accent }),
    });
  },

  async deleteColumn(projectId, columnId) {
    return request(`/api/projects/${projectId}/columns/${columnId}`, {
      method: "DELETE",
    });
  },

  async createTask(task) {
    return request("/api/tasks", {
      method: "POST",
      body: JSON.stringify(task),
    });
  },

  async updateTask(task) {
    return request(`/api/tasks/${task.id}`, {
      method: "PUT",
      body: JSON.stringify(task),
    });
  },

  async deleteTask(taskId) {
    return request(`/api/tasks/${taskId}`, {
      method: "DELETE",
    });
  },

  async importBoard(boardState) {
    return request("/api/import", {
      method: "POST",
      body: JSON.stringify(boardState),
    });
  },

  async clearBoard() {
    return request("/api/clear", {
      method: "POST",
    });
  },
};
