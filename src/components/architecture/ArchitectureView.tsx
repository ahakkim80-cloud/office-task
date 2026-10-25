import React, { useState } from 'react';
import { Layers, Database, Globe, ShieldCheck, Copy, Check, Code2 } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'structure' | 'schemas' | 'api' | 'rbac'>('schemas');
  const [selectedSchema, setSelectedSchema] = useState<'user' | 'workspace' | 'board' | 'task' | 'activity'>('task');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const schemaSnippets = {
    user: `// server/models/User.ts
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  defaultWorkspace?: mongoose.Types.ObjectId;
  refreshToken?: string;
  comparePassword(entered: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true, minlength: 2 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  avatar: { type: String, default: '' },
  defaultWorkspace: { type: Schema.Types.ObjectId, ref: 'Workspace' },
  refreshToken: { type: String, select: false },
}, { timestamps: true });

UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (entered: string) {
  return await bcrypt.compare(entered, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);`,

    workspace: `// server/models/Workspace.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkspace extends Document {
  name: string;
  slug: string;
  owner: mongoose.Types.ObjectId;
  members: Array<{
    user: mongoose.Types.ObjectId;
    role: 'admin' | 'manager' | 'member' | 'viewer';
    joinedAt: Date;
  }>;
}

const WorkspaceSchema = new Schema<IWorkspace>({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  members: [{
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'manager', 'member', 'viewer'], default: 'member' },
    joinedAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

// Compound index for querying user memberships in sub-millisecond time
WorkspaceSchema.index({ 'members.user': 1 });

export const Workspace = mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);`,

    board: `// server/models/Board.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IBoard extends Document {
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  columns: Array<{
    _id: mongoose.Types.ObjectId;
    title: string;
    order: number;
    wipLimit?: number;
    color?: string;
  }>;
  isArchived: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const BoardSchema = new Schema<IBoard>({
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  columns: [{
    title: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
    wipLimit: { type: Number, default: 0 },
    color: { type: String, default: '#94a3b8' },
  }],
  isArchived: { type: Boolean, default: false },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

BoardSchema.index({ workspaceId: 1, isArchived: 1 });

export const Board = mongoose.model<IBoard>('Board', BoardSchema);`,

    task: `// server/models/Task.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface ITask extends Document {
  boardId: mongoose.Types.ObjectId;
  columnId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  order: number;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignees: mongoose.Types.ObjectId[];
  dueDate?: Date;
  labels: string[];
  checklist: Array<{ title: string; completed: boolean }>;
  createdBy: mongoose.Types.ObjectId;
}

const TaskSchema = new Schema<ITask>({
  boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
  columnId: { type: Schema.Types.ObjectId, required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, default: '' },
  order: { type: Number, required: true, default: 1000 },
  priority: { type: String, enum: ['urgent', 'high', 'medium', 'low'], default: 'medium', index: true },
  assignees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  dueDate: { type: Date },
  labels: [{ type: String, trim: true }],
  checklist: [{
    title: { type: String, required: true },
    completed: { type: Boolean, default: false },
  }],
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// High-speed compound index for board hydration & column ordering
TaskSchema.index({ boardId: 1, columnId: 1, order: 1 });
TaskSchema.index({ boardId: 1, dueDate: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);`,

    activity: `// server/models/ActivityLog.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  workspaceId: mongoose.Types.ObjectId;
  boardId: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  actor: mongoose.Types.ObjectId;
  action: 'created' | 'moved' | 'updated' | 'assigned' | 'commented' | 'deleted';
  details: Record<string, any>;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
  workspaceId: { type: Schema.Types.ObjectId, ref: 'Workspace', required: true, index: true },
  boardId: { type: Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
  taskId: { type: Schema.Types.ObjectId, ref: 'Task', index: true },
  actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, enum: ['created', 'moved', 'updated', 'assigned', 'commented', 'deleted'], required: true },
  details: { type: Schema.Types.Mixed, default: {} },
  timestamp: { type: Date, default: Date.now, index: true },
});

ActivityLogSchema.index({ boardId: 1, timestamp: -1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);`,
  };

  const folderStructureTree = `taskflow-platform/
├── package.json               # Root dependencies & full-stack scripts ("dev": "tsx server.ts")
├── tsconfig.json              # Shared TypeScript base configuration
├── vite.config.ts             # Vite frontend bundler with server proxy config
├── server.ts                  # Full-Stack Express server mounting Vite middlewares
│
├── shared/                    # Shared types & contracts (isomorphic, client + server)
│   └── types/
│       └── index.ts           # User, Workspace, Board, Task, Role, ActivityLog interfaces
│
├── server/                    # Node.js + Express + MongoDB Backend
│   ├── config/
│   │   └── db.ts              # MongoDB Mongoose connection with resilient fallback
│   ├── models/                # Production Mongoose Schemas & Models
│   │   ├── User.ts            # User schema with bcrypt salt hashing
│   │   ├── Workspace.ts       # Multi-tenant workspace & member roles
│   │   ├── Board.ts           # Boards with embedded ordered columns & WIP limits
│   │   ├── Task.ts            # Tasks with compound indexes, checklists & assignees
│   │   └── ActivityLog.ts     # Audit timeline schema
│   ├── middleware/
│   │   ├── auth.middleware.ts # Dual-token JWT verification & user injection
│   │   └── rbac.middleware.ts # 4-tier Role-Based Access Control gatekeeper
│   ├── controllers/
│   │   ├── auth.controller.ts # Signup, login, refresh, logout, me
│   │   ├── workspace.controller.ts
│   │   └── task.controller.ts # Hydration, CRUD, move reordering
│   └── routes/
│       ├── auth.routes.ts
│       ├── workspace.routes.ts
│       └── task.routes.ts
│
└── src/                       # React 19 SPA Frontend
    ├── components/
    │   ├── layout/            # TopBar (3-zone contract), Sidebar
    │   ├── kanban/            # KanbanBoard, KanbanColumn, TaskCard
    │   ├── task/              # TaskDetailModal, TaskCreateModal
    │   ├── architecture/      # Architecture & Schemas Explorer
    │   └── team/              # Team & RBAC Management Console
    ├── context/               # AuthContext with role switcher
    ├── services/              # API Fetch client with Bearer token injection
    ├── App.tsx                # Main view router & tab coordinator
    ├── main.tsx               # Client entry point
    └── index.css              # Tailwind CSS with DM Sans & Plus Jakarta Sans typography`;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-57px)] overflow-y-auto bg-neutral-50/60 p-6 md:p-8">
      <div className="max-w-6xl mx-auto w-full space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 tracking-tight">
            MERN Architecture & Schema Blueprint
          </h1>
          <p className="text-xs text-neutral-500 mt-1 max-w-2xl leading-relaxed">
            Detailed technical breakdown of the full-stack folder hierarchy, production MongoDB
            Mongoose models, RESTful API specifications, and the RBAC authorization matrix.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 p-1 bg-neutral-200/70 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('schemas')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'schemas'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>2. MongoDB Schemas</span>
          </button>
          <button
            onClick={() => setActiveTab('structure')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'structure'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Folder Structure</span>
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'api'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>3. REST API Routes</span>
          </button>
          <button
            onClick={() => setActiveTab('rbac')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'rbac'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>RBAC Matrix</span>
          </button>
        </div>

        {/* Tab 1: Folder Structure */}
        {activeTab === 'structure' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Scalable Monorepo Folder Structure
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Clear boundary between client React components, Node.js Express controllers, and
                    shared isomorphic TypeScript types.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy('folder-tree', folderStructureTree)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                >
                  {copiedKey === 'folder-tree' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === 'folder-tree' ? 'Copied' : 'Copy Structure'}</span>
                </button>
              </div>

              <pre className="p-4 bg-neutral-900 text-neutral-200 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed">
                {folderStructureTree}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 2: MongoDB Schemas */}
        {activeTab === 'schemas' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    Production Mongoose Schemas & Models
                  </h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Featuring bcrypt password hashing, embedded arrays for columns/checklists, and
                    compound indexing for high-throughput boards.
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(selectedSchema, schemaSnippets[selectedSchema])}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
                >
                  {copiedKey === selectedSchema ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedKey === selectedSchema ? 'Copied' : 'Copy Mongoose Code'}</span>
                </button>
              </div>

              {/* Model Sub-Tabs */}
              <div className="flex items-center gap-2 border-b border-neutral-200 pb-3 mb-4">
                {(['task', 'board', 'workspace', 'user', 'activity'] as const).map((model) => (
                  <button
                    key={model}
                    onClick={() => setSelectedSchema(model)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer uppercase tracking-wider ${
                      selectedSchema === model
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {model}.ts
                  </button>
                ))}
              </div>

              <pre className="p-4 bg-neutral-900 text-neutral-200 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed max-h-[500px]">
                {schemaSnippets[selectedSchema]}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: REST API Specifications */}
        {activeTab === 'api' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-neutral-900 mb-1">
                RESTful API Route Catalog
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                All endpoints require standard JSON payloads and return structured responses with
                proper HTTP status codes.
              </p>

              <div className="space-y-3">
                {[
                  {
                    method: 'POST',
                    path: '/api/auth/register',
                    desc: 'Register new user account and bootstrap initial workspace and starter board',
                    auth: 'Public',
                    body: '{ "name": "Alex Chen", "email": "alex@taskflow.dev", "password": "..." }',
                  },
                  {
                    method: 'POST',
                    path: '/api/auth/login',
                    desc: 'Authenticate user with email & password, returns JWT and sets HTTP-only refresh cookie',
                    auth: 'Public',
                    body: '{ "email": "alex@taskflow.dev", "password": "..." }',
                  },
                  {
                    method: 'GET',
                    path: '/api/tasks/board/:boardId',
                    desc: 'Hydrates the entire Kanban board with ordered tasks, columns, and audit trail',
                    auth: 'Bearer JWT (Viewer+)',
                    body: 'N/A',
                  },
                  {
                    method: 'POST',
                    path: '/api/tasks/board/:boardId',
                    desc: 'Create new task within a specific column (enforces column WIP limit)',
                    auth: 'Bearer JWT (Member+)',
                    body: '{ "columnId": "col_1", "title": "Implement JWT", "priority": "urgent" }',
                  },
                  {
                    method: 'PATCH',
                    path: '/api/tasks/:id/move',
                    desc: 'Move and reorder task across Kanban lanes with optimistic sync',
                    auth: 'Bearer JWT (Member+)',
                    body: '{ "targetColumnId": "col_done", "newOrder": 3000 }',
                  },
                  {
                    method: 'POST',
                    path: '/api/workspaces/:id/members',
                    desc: 'Invite new team member to workspace and assign role',
                    auth: 'Bearer JWT (Manager+)',
                    body: '{ "email": "colleague@company.com", "role": "member" }',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg border border-neutral-200/80 bg-neutral-50/50">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded ${
                            item.method === 'GET'
                              ? 'bg-blue-100 text-blue-700'
                              : item.method === 'POST'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {item.method}
                        </span>
                        <code className="text-xs font-semibold text-neutral-900 font-mono">
                          {item.path}
                        </code>
                      </div>
                      <span className="text-[11px] font-mono text-neutral-500">{item.auth}</span>
                    </div>
                    <p className="text-xs text-neutral-600 mb-2">{item.desc}</p>
                    {item.body !== 'N/A' && (
                      <div className="bg-neutral-900 text-neutral-300 p-2 rounded text-[11px] font-mono">
                        Body: {item.body}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: RBAC Matrix */}
        {activeTab === 'rbac' && (
          <div className="space-y-4 animate-in fade-in-50 duration-150">
            <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-neutral-900 mb-1">
                Role-Based Access Control (RBAC) Matrix
              </h3>
              <p className="text-xs text-neutral-500 mb-4">
                Enforced server-side in Express via <code className="font-mono">requireRole()</code>{' '}
                middleware and reflected in the React UI with disabled state guards.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-100 text-neutral-700 uppercase font-mono text-[11px]">
                    <tr>
                      <th className="p-3 rounded-l-lg">Role</th>
                      <th className="p-3">View Board</th>
                      <th className="p-3">Create/Edit Tasks</th>
                      <th className="p-3">Move & Reorder</th>
                      <th className="p-3">Invite Members</th>
                      <th className="p-3 rounded-r-lg">Manage Workspace</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {[
                      {
                        role: 'Admin',
                        view: true,
                        edit: true,
                        move: true,
                        invite: true,
                        manage: true,
                        persona: 'Alex Chen',
                      },
                      {
                        role: 'Manager',
                        view: true,
                        edit: true,
                        move: true,
                        invite: true,
                        manage: false,
                        persona: 'Elena Rostova',
                      },
                      {
                        role: 'Member',
                        view: true,
                        edit: true,
                        move: true,
                        invite: false,
                        manage: false,
                        persona: 'Marcus Vance',
                      },
                      {
                        role: 'Viewer',
                        view: true,
                        edit: false,
                        move: false,
                        invite: false,
                        manage: false,
                        persona: 'Sarah Kim',
                      },
                    ].map((row, idx) => (
                      <tr key={idx} className="hover:bg-neutral-50">
                        <td className="p-3 font-semibold text-neutral-900">
                          <div>{row.role}</div>
                          <div className="text-[10px] text-neutral-400 font-normal">
                            Persona: {row.persona}
                          </div>
                        </td>
                        <td className="p-3 text-emerald-600 font-bold">✓</td>
                        <td className="p-3">
                          {row.edit ? (
                            <span className="text-emerald-600 font-bold">✓</span>
                          ) : (
                            <span className="text-neutral-300">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          {row.move ? (
                            <span className="text-emerald-600 font-bold">✓</span>
                          ) : (
                            <span className="text-neutral-300">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          {row.invite ? (
                            <span className="text-emerald-600 font-bold">✓</span>
                          ) : (
                            <span className="text-neutral-300">—</span>
                          )}
                        </td>
                        <td className="p-3">
                          {row.manage ? (
                            <span className="text-emerald-600 font-bold">✓</span>
                          ) : (
                            <span className="text-neutral-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
