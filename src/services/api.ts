import type { User, Workspace, Board, Task, ActivityLog, Role } from '../../shared/types/index.js';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('taskflow_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('taskflow_token', token);
    } else {
      localStorage.removeItem('taskflow_token');
    }
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('taskflow_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Clear token on unauthorized
      this.setToken(null);
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  }

  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.token);
    return res;
  }

  async register(name: string, email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    this.setToken(res.token);
    return res;
  }

  async getMe(): Promise<{ user: User; workspaces: Workspace[] }> {
    return this.request<{ user: User; workspaces: Workspace[] }>('/auth/me');
  }

  async logout(): Promise<void> {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  // Workspaces
  async getWorkspaces(): Promise<{ workspaces: Workspace[] }> {
    return this.request<{ workspaces: Workspace[] }>('/workspaces');
  }

  async getWorkspace(id: string): Promise<{ workspace: Workspace }> {
    return this.request<{ workspace: Workspace }>(`/workspaces/${id}`);
  }

  async inviteMember(workspaceId: string, email: string, role: Role): Promise<{ workspace: Workspace; member: User }> {
    return this.request<{ workspace: Workspace; member: User }>(`/workspaces/${workspaceId}/members`, {
      method: 'POST',
      body: JSON.stringify({ email, role, workspaceId }),
    });
  }

  async updateMemberRole(workspaceId: string, memberId: string, role: Role): Promise<{ workspace: Workspace }> {
    return this.request<{ workspace: Workspace }>(`/workspaces/${workspaceId}/members/${memberId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role, workspaceId }),
    });
  }

  async getBoards(workspaceId: string): Promise<{ boards: Board[] }> {
    return this.request<{ boards: Board[] }>(`/workspaces/${workspaceId}/boards`);
  }

  async createBoard(workspaceId: string, title: string, description: string): Promise<{ board: Board }> {
    return this.request<{ board: Board }>(`/workspaces/${workspaceId}/boards`, {
      method: 'POST',
      body: JSON.stringify({ title, description, workspaceId }),
    });
  }

  // Board Details & Tasks
  async getBoardDetails(boardId: string): Promise<{
    board: Board;
    tasks: Task[];
    activities: ActivityLog[];
    workspace: Workspace;
  }> {
    return this.request(`/tasks/board/${boardId}`);
  }

  async createTask(
    boardId: string,
    data: {
      columnId: string;
      title: string;
      description?: string;
      priority?: string;
      assignees?: string[];
      dueDate?: string;
      labels?: string[];
    }
  ): Promise<{ task: Task }> {
    return this.request(`/tasks/board/${boardId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<{ task: Task }> {
    return this.request(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async moveTask(taskId: string, targetColumnId: string, newOrder: number): Promise<{ task: Task }> {
    return this.request(`/tasks/${taskId}/move`, {
      method: 'PATCH',
      body: JSON.stringify({ targetColumnId, newOrder }),
    });
  }

  async deleteTask(taskId: string): Promise<{ id: string }> {
    return this.request(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();
