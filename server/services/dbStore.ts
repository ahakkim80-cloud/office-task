import bcrypt from 'bcryptjs';
import type { User, Workspace, Board, Task, ActivityLog, Role } from '../../shared/types/index.js';

class InMemoryStore {
  users: User[] = [];
  passwords: Map<string, string> = new Map(); // userId -> hashedPassword
  workspaces: Workspace[] = [];
  boards: Board[] = [];
  tasks: Task[] = [];
  activities: ActivityLog[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    const defaultPasswordHash = bcrypt.hashSync('password123', 10);

    const user1: User = {
      _id: 'usr_alex',
      name: 'Alex Chen',
      email: 'alex@taskflow.dev',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      role: 'admin',
      defaultWorkspace: 'ws_core',
      createdAt: new Date().toISOString(),
    };

    const user2: User = {
      _id: 'usr_elena',
      name: 'Elena Rostova',
      email: 'elena@taskflow.dev',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
      role: 'manager',
      defaultWorkspace: 'ws_core',
      createdAt: new Date().toISOString(),
    };

    const user3: User = {
      _id: 'usr_marcus',
      name: 'Marcus Vance',
      email: 'marcus@taskflow.dev',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      role: 'member',
      defaultWorkspace: 'ws_core',
      createdAt: new Date().toISOString(),
    };

    const user4: User = {
      _id: 'usr_sarah',
      name: 'Sarah Kim',
      email: 'sarah@taskflow.dev',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      role: 'viewer',
      defaultWorkspace: 'ws_core',
      createdAt: new Date().toISOString(),
    };

    this.users = [user1, user2, user3, user4];
    this.users.forEach((u) => this.passwords.set(u._id, defaultPasswordHash));

    const workspace: Workspace = {
      _id: 'ws_core',
      name: 'Core Platform Engineering',
      slug: 'core-platform',
      owner: user1._id,
      members: [
        { user: user1, role: 'admin', joinedAt: new Date(Date.now() - 30 * 86400000).toISOString() },
        { user: user2, role: 'manager', joinedAt: new Date(Date.now() - 25 * 86400000).toISOString() },
        { user: user3, role: 'member', joinedAt: new Date(Date.now() - 20 * 86400000).toISOString() },
        { user: user4, role: 'viewer', joinedAt: new Date(Date.now() - 10 * 86400000).toISOString() },
      ],
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    };
    this.workspaces.push(workspace);

    const board: Board = {
      _id: 'brd_sprint24',
      workspaceId: 'ws_core',
      title: 'Sprint 24 - Kanban & Auth Deliverables',
      description: 'Q4 Core Platform deliverables, JWT security hardening, and board performance optimization.',
      columns: [
        { _id: 'col_backlog', title: 'Backlog', order: 0, wipLimit: 0, color: '#64748B' },
        { _id: 'col_in_progress', title: 'In Progress', order: 1, wipLimit: 4, color: '#2563EB' },
        { _id: 'col_review', title: 'Code Review', order: 2, wipLimit: 3, color: '#EA580C' },
        { _id: 'col_done', title: 'Done', order: 3, wipLimit: 0, color: '#16A34A' },
      ],
      createdBy: user1._id,
      createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    };
    this.boards.push(board);

    this.tasks = [
      {
        _id: 'tsk_101',
        boardId: 'brd_sprint24',
        columnId: 'col_backlog',
        title: 'Design distributed rate-limiter middleware using Redis token buckets',
        description: 'Implement a sliding log or leaky token bucket algorithm in Express to prevent API abuse on `/api/auth/login` and `/api/tasks`.',
        order: 1000,
        priority: 'high',
        assignees: [user3],
        dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
        labels: ['Backend', 'Security', 'P1'],
        checklist: [
          { _id: 'chk_1', title: 'Define interface in shared/types', completed: true },
          { _id: 'chk_2', title: 'Write Redis connection pool', completed: false },
          { _id: 'chk_3', title: 'Add Jest unit tests for throttling', completed: false },
        ],
        createdBy: user1._id,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        _id: 'tsk_102',
        boardId: 'brd_sprint24',
        columnId: 'col_backlog',
        title: 'Draft OpenAPI 3.1 specification for external webhooks',
        description: 'Provide developer documentation for board mutation events (`task.created`, `task.moved`, `board.updated`).',
        order: 2000,
        priority: 'low',
        assignees: [user2],
        dueDate: new Date(Date.now() + 10 * 86400000).toISOString(),
        labels: ['Documentation', 'API'],
        checklist: [
          { _id: 'chk_4', title: 'Document payload schemas', completed: false },
          { _id: 'chk_5', title: 'Generate Swagger UI preview', completed: false },
        ],
        createdBy: user2._id,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        _id: 'tsk_103',
        boardId: 'brd_sprint24',
        columnId: 'col_in_progress',
        title: 'Implement JWT Refresh Token rotation & HTTP-only cookies',
        description: 'Store refresh tokens in cryptographically signed, HTTP-only secure cookies with automatic rotation and revocation on logout.',
        order: 1000,
        priority: 'urgent',
        assignees: [user1, user3],
        dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        labels: ['Auth', 'Security', 'P0'],
        checklist: [
          { _id: 'chk_6', title: 'Create auth.middleware token parser', completed: true },
          { _id: 'chk_7', title: 'Add silent refresh Axios interceptor', completed: true },
          { _id: 'chk_8', title: 'Implement token family invalidation', completed: false },
        ],
        createdBy: user1._id,
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        _id: 'tsk_104',
        boardId: 'brd_sprint24',
        columnId: 'col_in_progress',
        title: 'Build fluid drag-and-drop column reordering with optimistic UI updates',
        description: 'Refactor HTML5 drag-and-drop handlers to calculate fractional midpoint orders and rollback automatically on network error.',
        order: 2000,
        priority: 'high',
        assignees: [user2],
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
        labels: ['Frontend', 'Kanban', 'UX'],
        checklist: [
          { _id: 'chk_9', title: 'Column drop target highlight indicator', completed: true },
          { _id: 'chk_10', title: 'Ghost preview card while dragging', completed: true },
          { _id: 'chk_11', title: 'Smooth height transition on reorder', completed: false },
        ],
        createdBy: user2._id,
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        _id: 'tsk_105',
        boardId: 'brd_sprint24',
        columnId: 'col_review',
        title: 'Mongoose schema validators and compound indexes audit',
        description: 'Verify compound indexes on `{ boardId: 1, columnId: 1, order: 1 }` to guarantee sub-millisecond query execution during board loads.',
        order: 1000,
        priority: 'medium',
        assignees: [user1],
        dueDate: new Date(Date.now() + 1 * 86400000).toISOString(),
        labels: ['Database', 'Mongoose'],
        checklist: [
          { _id: 'chk_12', title: 'Audit TaskSchema compound index', completed: true },
          { _id: 'chk_13', title: 'Audit WorkspaceSchema member query plan', completed: true },
          { _id: 'chk_14', title: 'Benchmark 10,000 document hydration', completed: true },
        ],
        createdBy: user1._id,
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        _id: 'tsk_106',
        boardId: 'brd_sprint24',
        columnId: 'col_done',
        title: 'Establish 4-tier Role-Based Access Control matrix',
        description: 'Enforce Admin, Project Manager, Member, and Viewer permissions across all task mutation endpoints.',
        order: 1000,
        priority: 'high',
        assignees: [user1, user2],
        dueDate: new Date(Date.now() - 1 * 86400000).toISOString(),
        labels: ['Security', 'RBAC'],
        checklist: [
          { _id: 'chk_15', title: 'Define role permissions table', completed: true },
          { _id: 'chk_16', title: 'Create rbac.middleware route decorator', completed: true },
          { _id: 'chk_17', title: 'Render disabled controls for Viewers', completed: true },
        ],
        createdBy: user1._id,
        createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
      },
    ];

    this.activities = [
      {
        _id: 'act_1',
        workspaceId: 'ws_core',
        boardId: 'brd_sprint24',
        taskId: 'tsk_106',
        actor: user1,
        action: 'moved',
        details: {
          taskTitle: 'Establish 4-tier Role-Based Access Control matrix',
          fromColumn: 'Code Review',
          toColumn: 'Done',
          message: 'All unit and integration permission checks passed.',
        },
        timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
      },
      {
        _id: 'act_2',
        workspaceId: 'ws_core',
        boardId: 'brd_sprint24',
        taskId: 'tsk_104',
        actor: user2,
        action: 'updated',
        details: {
          taskTitle: 'Build fluid drag-and-drop column reordering with optimistic UI updates',
          message: 'Completed ghost preview card and hover states.',
        },
        timestamp: new Date(Date.now() - 12 * 3600000).toISOString(),
      },
    ];
  }

  // User methods
  findUserByEmail(email: string) {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string) {
    return this.users.find((u) => u._id === id);
  }

  verifyPassword(userId: string, plain: string): boolean {
    const hash = this.passwords.get(userId);
    if (!hash) return false;
    return bcrypt.compareSync(plain, hash);
  }

  createUser(name: string, email: string, passwordPlain: string): User {
    const id = `usr_${Date.now()}`;
    const hash = bcrypt.hashSync(passwordPlain, 10);
    const newUser: User = {
      _id: id,
      name,
      email: email.toLowerCase(),
      avatar: '',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    this.passwords.set(id, hash);

    // Bootstrap personal workspace
    const wsId = `ws_${Date.now()}`;
    const personalWorkspace: Workspace = {
      _id: wsId,
      name: `${name}'s Workspace`,
      slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`,
      owner: id,
      members: [{ user: newUser, role: 'admin', joinedAt: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
    };
    this.workspaces.push(personalWorkspace);
    newUser.defaultWorkspace = wsId;

    // Bootstrap personal starter board
    const starterBoard: Board = {
      _id: `brd_${Date.now()}`,
      workspaceId: wsId,
      title: 'Sprint 1 - Starter Board',
      description: 'Default Kanban board to track your team milestones.',
      columns: [
        { _id: `col_b_${Date.now()}`, title: 'Backlog', order: 0, wipLimit: 0, color: '#64748B' },
        { _id: `col_p_${Date.now()}`, title: 'In Progress', order: 1, wipLimit: 3, color: '#2563EB' },
        { _id: `col_r_${Date.now()}`, title: 'Review', order: 2, wipLimit: 2, color: '#EA580C' },
        { _id: `col_d_${Date.now()}`, title: 'Done', order: 3, wipLimit: 0, color: '#16A34A' },
      ],
      createdBy: id,
      createdAt: new Date().toISOString(),
    };
    this.boards.push(starterBoard);

    return newUser;
  }

  // Workspaces
  getUserWorkspaces(userId: string): Workspace[] {
    return this.workspaces.filter(
      (w) =>
        (typeof w.owner === 'object' ? w.owner._id : w.owner) === userId ||
        w.members.some((m) => (typeof m.user === 'object' ? m.user._id : m.user) === userId)
    );
  }

  getWorkspaceById(id: string): Workspace | undefined {
    return this.workspaces.find((w) => w._id === id);
  }

  addWorkspaceMember(workspaceId: string, email: string, role: Role): { workspace: Workspace; memberUser: User } | null {
    const ws = this.getWorkspaceById(workspaceId);
    if (!ws) return null;
    let user = this.findUserByEmail(email);
    if (!user) {
      // Auto-invite placeholder user
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      user = this.createUser(name, email, 'password123');
    }
    const alreadyMember = ws.members.some((m) => (typeof m.user === 'object' ? m.user._id : m.user) === user!._id);
    if (!alreadyMember) {
      ws.members.push({
        user,
        role,
        joinedAt: new Date().toISOString(),
      });
    }
    return { workspace: ws, memberUser: user };
  }

  updateMemberRole(workspaceId: string, userId: string, newRole: Role): boolean {
    const ws = this.getWorkspaceById(workspaceId);
    if (!ws) return false;
    const member = ws.members.find((m) => (typeof m.user === 'object' ? m.user._id : m.user) === userId);
    if (member) {
      member.role = newRole;
      return true;
    }
    return false;
  }

  // Boards
  getBoardsByWorkspace(workspaceId: string): Board[] {
    return this.boards.filter((b) => b.workspaceId === workspaceId);
  }

  getBoardById(id: string): Board | undefined {
    return this.boards.find((b) => b._id === id);
  }

  createBoard(workspaceId: string, title: string, description: string, createdBy: string): Board {
    const board: Board = {
      _id: `brd_${Date.now()}`,
      workspaceId,
      title,
      description,
      columns: [
        { _id: `col_b_${Date.now()}`, title: 'Backlog', order: 0, wipLimit: 0, color: '#64748B' },
        { _id: `col_p_${Date.now()}`, title: 'In Progress', order: 1, wipLimit: 3, color: '#2563EB' },
        { _id: `col_r_${Date.now()}`, title: 'Review', order: 2, wipLimit: 2, color: '#EA580C' },
        { _id: `col_d_${Date.now()}`, title: 'Done', order: 3, wipLimit: 0, color: '#16A34A' },
      ],
      createdBy,
      createdAt: new Date().toISOString(),
    };
    this.boards.push(board);
    return board;
  }

  // Tasks
  getTasksByBoard(boardId: string): Task[] {
    return this.tasks.filter((t) => t.boardId === boardId).sort((a, b) => a.order - b.order);
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find((t) => t._id === id);
  }

  createTask(data: Partial<Task> & { boardId: string; columnId: string; title: string; createdBy: string }): Task {
    const existing = this.getTasksByBoard(data.boardId).filter((t) => t.columnId === data.columnId);
    const maxOrder = existing.reduce((max, t) => Math.max(max, t.order), 0);

    const task: Task = {
      _id: `tsk_${Date.now()}`,
      boardId: data.boardId,
      columnId: data.columnId,
      title: data.title,
      description: data.description || '',
      order: maxOrder + 1000,
      priority: data.priority || 'medium',
      assignees: data.assignees || [],
      dueDate: data.dueDate,
      labels: data.labels || [],
      checklist: data.checklist || [],
      createdBy: data.createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tasks.push(task);

    const actor = this.findUserById(data.createdBy);
    if (actor) {
      const board = this.getBoardById(data.boardId);
      const col = board?.columns.find((c) => c._id === data.columnId);
      this.logActivity({
        workspaceId: board?.workspaceId || '',
        boardId: data.boardId,
        taskId: task._id,
        actor,
        action: 'created',
        details: { taskTitle: task.title, toColumn: col?.title || 'Column' },
      });
    }

    return task;
  }

  updateTask(id: string, updates: Partial<Task>, actorId: string): Task | null {
    const task = this.getTaskById(id);
    if (!task) return null;

    Object.assign(task, updates, { updatedAt: new Date().toISOString() });

    const actor = this.findUserById(actorId);
    if (actor) {
      const board = this.getBoardById(task.boardId);
      this.logActivity({
        workspaceId: board?.workspaceId || '',
        boardId: task.boardId,
        taskId: task._id,
        actor,
        action: 'updated',
        details: { taskTitle: task.title, message: 'Updated task properties' },
      });
    }

    return task;
  }

  moveTask(taskId: string, targetColumnId: string, newOrder: number, actorId: string): Task | null {
    const task = this.getTaskById(taskId);
    if (!task) return null;

    const board = this.getBoardById(task.boardId);
    const fromCol = board?.columns.find((c) => c._id === task.columnId);
    const toCol = board?.columns.find((c) => c._id === targetColumnId);

    task.columnId = targetColumnId;
    task.order = newOrder;
    task.updatedAt = new Date().toISOString();

    const actor = this.findUserById(actorId);
    if (actor && board) {
      this.logActivity({
        workspaceId: board.workspaceId,
        boardId: task.boardId,
        taskId: task._id,
        actor,
        action: 'moved',
        details: {
          taskTitle: task.title,
          fromColumn: fromCol?.title,
          toColumn: toCol?.title,
        },
      });
    }

    return task;
  }

  deleteTask(id: string, actorId: string): boolean {
    const idx = this.tasks.findIndex((t) => t._id === id);
    if (idx === -1) return false;
    const task = this.tasks[idx];
    this.tasks.splice(idx, 1);

    const actor = this.findUserById(actorId);
    if (actor) {
      const board = this.getBoardById(task.boardId);
      if (board) {
        this.logActivity({
          workspaceId: board.workspaceId,
          boardId: task.boardId,
          taskId: id,
          actor,
          action: 'deleted',
          details: { taskTitle: task.title },
        });
      }
    }
    return true;
  }

  // Activities
  getBoardActivities(boardId: string): ActivityLog[] {
    return this.activities.filter((a) => a.boardId === boardId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private logActivity(data: Omit<ActivityLog, '_id' | 'timestamp'>) {
    const activity: ActivityLog = {
      _id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      ...data,
      timestamp: new Date().toISOString(),
    };
    this.activities.unshift(activity);
    if (this.activities.length > 100) this.activities.pop();
  }
}

export const dbStore = new InMemoryStore();
