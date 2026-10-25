export type Role = 'admin' | 'manager' | 'member' | 'viewer';

export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: Role;
  defaultWorkspace?: string;
  createdAt?: string;
}

export interface WorkspaceMember {
  user: User | string;
  role: Role;
  joinedAt: string;
}

export interface Workspace {
  _id: string;
  name: string;
  slug: string;
  owner: User | string;
  members: WorkspaceMember[];
  createdAt: string;
  updatedAt?: string;
}

export interface BoardColumn {
  _id: string;
  title: string;
  order: number;
  wipLimit?: number;
  color?: string;
}

export interface Board {
  _id: string;
  workspaceId: string;
  title: string;
  description?: string;
  columns: BoardColumn[];
  createdBy: User | string;
  createdAt: string;
  updatedAt?: string;
}

export interface ChecklistItem {
  _id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  _id: string;
  boardId: string;
  columnId: string;
  title: string;
  description?: string;
  order: number;
  priority: Priority;
  assignees: (User | string)[];
  dueDate?: string;
  labels: string[];
  checklist: ChecklistItem[];
  createdBy: User | string;
  createdAt: string;
  updatedAt?: string;
}

export interface ActivityLog {
  _id: string;
  workspaceId: string;
  boardId: string;
  taskId?: string;
  actor: User;
  action: 'created' | 'moved' | 'updated' | 'assigned' | 'commented' | 'deleted';
  details: {
    taskTitle?: string;
    fromColumn?: string;
    toColumn?: string;
    message?: string;
  };
  timestamp: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}
