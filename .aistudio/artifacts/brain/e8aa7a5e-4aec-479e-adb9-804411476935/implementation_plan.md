# TaskFlow: Collaborative Kanban & Task Management Platform (MERN Architecture)

A modern, production-grade collaborative task management and Kanban platform built on the MERN stack (MongoDB, Express, React, Node.js) with role-based access control, JWT authentication, and high-performance interactive boards.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The architectural direction and entity design have been tailored to your confirmed specifications:
> - **Domain**: Enterprise Task Management & Collaborative Kanban Platform
> - **Structure**: Full-Stack Unified Project with Express API server and React SPA
> - **Auth & Security**: JWT Authentication with secure HTTP-only Refresh Tokens and 4-tier Role-Based Access Control (Admin, Project Manager, Member, Viewer)

- **Step 1 Focus**: Unified monorepo structure separating client React code (`src/`), server controllers/models/routes (`server/`), and shared TypeScript interfaces (`shared/`).
- **Step 2 Focus**: Scalable MongoDB schema design with Mongoose models, compound indexes, relational references, embedded sub-documents (checklists, labels), and full audit activity trails.

---

## 1. Overview & Core Concept

### What It Does
TaskFlow provides agile teams with a responsive Kanban and sprint management environment. Users can organize work across multi-tenant workspaces, create customizable boards (Backlog, In Progress, Review, Done), drag and drop tasks with optimistic UI updates, assign tasks with granular role permissions, and track real-time activity histories.

### Target Audience & Personas
- **Engineering & Product Leads (Admins / Project Managers)**: Manage workspaces, configure board swimlanes, assign team members, and view sprint velocity and task throughput.
- **Developers & Designers (Members)**: Manage day-to-day task cards, update progress, create subtask checklists, and log comments.
- **Stakeholders & Clients (Viewers)**: Monitor project progress and milestones with read-only access.

### Key Value Delivered
- Eliminates context switching with fluid drag-and-drop Kanban interactions.
- Enforces strict data integrity via Mongoose schema validators and RBAC middleware.
- Scalable dual-token JWT security model preventing unauthorized horizontal or vertical privilege escalation.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Authentication & Onboarding**:
   - Clean registration/login with email and password.
   - Automatic workspace bootstrap: new users get a default "Personal Workspace" with a starter "Sprint 1" board.
2. **Workspace & Board Navigation**:
   - Left fixed sidebar ($260\text{px}$) displaying workspaces, active boards, team members, and filter presets.
   - Breadcrumb navigation (`Acme Corp / Core Platform / Sprint 24 Board`).
3. **Interactive Kanban Board View**:
   - Horizontal multi-column board with smooth drag-and-drop between columns.
   - Search & filter bar: instant client-side filtering by assignee, priority, label, and due date.
   - Task cards showing priority indicators, assignee avatars, subtask completion count, and comment counts (without static pill badge clutter).
4. **Task Detail Drawer / Modal**:
   - In-depth task management: title, rich markdown description, status selector, priority picker, checklist with toggleable items, attachments, and timestamped activity log.
5. **Team & Permissions Console**:
   - Workspace settings table showing member emails, roles, join dates, and actions for role elevation or removal.

### Visual Identity & Theme (SaaS Dashboard Constitution)
- **Aesthetic Direction**: High-efficiency, utilitarian engineering console with deliberate whitespace, subtle 1px hairline borders (`border-neutral-200 dark:border-neutral-800`), and zero-pill discipline.
- **Color Palette (60-30-10 Rule)**:
  - *Canvas (60%)*: Crisp light workspace canvas (`#FAFAFA`) or deep slate night mode (`#0F172A`).
  - *Structural Surfaces (30%)*: Clean column backdrops (`#F1F5F9` / `#1E293B`) with single-elevation depth and sharp divider lines.
  - *Action & Priority Budget (10%)*: High-intent accents for primary actions and semantic urgency:
    - Urgent/Critical: `#DC2626` (Crimson)
    - High: `#EA580C` (Orange)
    - Medium: `#2563EB` (Royal Blue)
    - Low: `#64748B` (Muted Slate)
- **Typography**:
  - *Display / Headings*: `Plus Jakarta Sans` (SemiBold / Bold) for crisp navigation and board headers.
  - *Body / Tasks*: `DM Sans` (Regular 400 / Medium 500) for maximum scannability at 13px–14px.
  - *Timestamps, Counters & Identifiers*: Monospace with tabular numerals (`font-mono tabular-nums`) to prevent layout jitter.

---

## 3. Key Architectural Decisions (Steps 1 & 2)

### Step 1: Clean, Scalable Folder Structure

A unified full-stack architecture that allows concurrent development, shared TypeScript contracts, and clean separation of concerns:

```
taskflow-platform/
├── package.json               # Root dependencies & scripts (dev, build, start)
├── tsconfig.json              # Shared TypeScript base configuration
├── vite.config.ts             # Vite frontend bundler with server proxy config
├── .env.example               # Environment variables specification
│
├── shared/                    # Shared types & contracts (isomorphic)
│   ├── types/
│   │   ├── auth.types.ts      # User, AuthResponse, JWTPayload
│   │   ├── workspace.types.ts # Workspace, Role, Member definitions
│   │   ├── board.types.ts     # Board, Column, BoardConfig
│   │   └── task.types.ts      # Task, Subtask, Priority, Status, Activity
│   └── constants/
│       └── roles.ts           # Role enums & permission matrices
│
├── server/                    # Node.js + Express + MongoDB Backend
│   ├── config/
│   │   └── db.ts              # MongoDB connection via Mongoose
│   ├── models/
│   │   ├── User.ts            # User schema & password hashing
│   │   ├── Workspace.ts       # Multi-tenant workspace & team memberships
│   │   ├── Board.ts           # Boards & ordered columns
│   │   ├── Task.ts            # Tasks, checklists, and assignees
│   │   └── ActivityLog.ts     # Audit trail of mutations
│   ├── middleware/
│   │   ├── auth.middleware.ts # JWT verification & user injection
│   │   ├── rbac.middleware.ts # Permission checks by workspace role
│   │   └── error.middleware.ts# Centralized error handler
│   ├── controllers/
│   │   ├── auth.controller.ts # Signup, login, refresh, logout, me
│   │   ├── workspace.controller.ts
│   │   ├── board.controller.ts
│   │   └── task.controller.ts # CRUD, drag/reorder, batch update
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── workspace.routes.ts
│   │   ├── board.routes.ts
│   │   └── task.routes.ts
│   └── server.ts              # Express application bootstrap & API mounting
│
└── src/                       # React 19 Frontend (SPA)
    ├── assets/                # Static assets, branding, and icons
    ├── components/
    │   ├── common/            # Reusable buttons, inputs, modals, avatars
    │   ├── layout/            # Sidebar, Header, Breadcrumbs, UserProfile
    │   ├── kanban/            # KanbanBoard, KanbanColumn, TaskCard, DragDropContext
    │   ├── task/              # TaskDetailModal, TaskCreateModal, ChecklistItem
    │   └── team/              # MemberList, InviteMemberModal, RoleSelector
    ├── context/               # AuthContext, WorkspaceContext
    ├── hooks/                 # useKanban, useTasks, useAuth, useDebounce
    ├── services/              # Axios / Fetch API client with interceptors
    ├── pages/                 # BoardPage, DashboardPage, SettingsPage, AuthPage
    ├── App.tsx                # App root with routing & layout wrappers
    └── main.tsx               # React DOM entry point
```

---

### Step 2: Database Schema & Entity Modeling (MongoDB / Mongoose)

The schema utilizes a hybrid relational-referential model designed for fast board hydration and atomic updates:

```
┌─────────────────┐       1:N       ┌─────────────────────┐
│      User       │ ───────────────>│  Workspace (Member) │
└─────────────────┘                 └─────────────────────┘
         │                                     │
         │ 1:N (created)                       │ 1:N
         ▼                                     ▼
┌─────────────────┐       1:N       ┌─────────────────────┐
│   ActivityLog   │                 │        Board        │
└─────────────────┘                 └─────────────────────┘
         ▲                                     │
         │ 1:N (task logs)                     │ 1:N
         │                                     ▼
         └───────────────────────── ┌─────────────────────┐
                                    │        Task         │
                                    │ (Column ID, Order)  │
                                    └─────────────────────┘
```

#### 1. User Model (`server/models/User.ts`)
- **Fields**:
  - `_id`: `ObjectId`
  - `name`: `String` (Required, trimmed, min 2 chars)
  - `email`: `String` (Required, unique, lowercase, indexed)
  - `password`: `String` (Hashed with `bcryptjs`, excluded in queries by default)
  - `avatar`: `String` (Optional profile photo URL or initials fallback)
  - `defaultWorkspace`: `ObjectId` ref `Workspace`
  - `refreshToken`: `String` (Optional hashed refresh token for revocation)
  - `createdAt`, `updatedAt`: `Date` (Timestamps enabled)

#### 2. Workspace Model (`server/models/Workspace.ts`)
- **Fields**:
  - `_id`: `ObjectId`
  - `name`: `String` (Required, e.g., "Engineering Squad")
  - `slug`: `String` (URL-friendly unique slug)
  - `owner`: `ObjectId` ref `User` (Indexed)
  - `members`: Array of sub-documents:
    - `user`: `ObjectId` ref `User`
    - `role`: `String` enum (`'admin'`, `'manager'`, `'member'`, `'viewer'`)
    - `joinedAt`: `Date`
  - `createdAt`, `updatedAt`: `Date`
- **Index**: Compound unique index `{ _id: 1, 'members.user': 1 }` for instant membership and role validation.

#### 3. Board Model (`server/models/Board.ts`)
- **Fields**:
  - `_id`: `ObjectId`
  - `workspaceId`: `ObjectId` ref `Workspace` (Required, indexed)
  - `title`: `String` (Required, e.g., "Sprint 24 Kanban")
  - `description`: `String`
  - `columns`: Array of embedded sub-documents (preserving sequence):
    - `_id`: `ObjectId`
    - `title`: `String` (e.g., "Backlog", "In Progress", "In Review", "Done")
    - `order`: `Number` (0, 1, 2, 3)
    - `wipLimit`: `Number` (Optional work-in-progress cap, default 0 for unlimited)
    - `color`: `String` (Subtle column indicator)
  - `isArchived`: `Boolean` (Default false)
  - `createdBy`: `ObjectId` ref `User`
  - `createdAt`, `updatedAt`: `Date`

#### 4. Task Model (`server/models/Task.ts`)
- **Fields**:
  - `_id`: `ObjectId`
  - `boardId`: `ObjectId` ref `Board` (Required, indexed)
  - `columnId`: `ObjectId` (Required, references sub-document column in Board)
  - `title`: `String` (Required, max 200 chars)
  - `description`: `String` (Markdown text support)
  - `order`: `Number` (Rank within the column, e.g., 1000, 2000, enabling fast midpoint reordering)
  - `priority`: `String` enum (`'urgent'`, `'high'`, `'medium'`, `'low'`, default: `'medium'`)
  - `assignees`: `[ObjectId]` refs to `User`
  - `dueDate`: `Date` (Optional, indexed for deadline queries)
  - `labels`: `[String]` (e.g., `['Frontend', 'Bug', 'P0']`)
  - `checklist`: Array of sub-documents:
    - `_id`: `ObjectId`
    - `title`: `String`
    - `completed`: `Boolean` (Default false)
  - `createdBy`: `ObjectId` ref `User`
  - `createdAt`, `updatedAt`: `Date`
- **Indexes**: Compound index `{ boardId: 1, columnId: 1, order: 1 }` for high-speed board hydration.

#### 5. ActivityLog Model (`server/models/ActivityLog.ts`)
- **Fields**:
  - `_id`: `ObjectId`
  - `workspaceId`: `ObjectId` ref `Workspace`
  - `boardId`: `ObjectId` ref `Board`
  - `taskId`: `ObjectId` ref `Task`
  - `actor`: `ObjectId` ref `User`
  - `action`: `String` enum (`'created'`, `'moved'`, `'status_changed'`, `'assigned'`, `'commented'`)
  - `details`: `Schema.Types.Mixed` (e.g., `{ fromColumn: "Backlog", toColumn: "In Progress" }`)
  - `timestamp`: `Date` (Default `Date.now`, TTL indexed optional)

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        React SPA Client (Vite)                         │
│  ┌───────────────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
│  │   Auth & Workspace    │  │  Kanban Board   │  │ Task Modal & Log │  │
│  │      Navigation       │  │ (Drag and Drop) │  │   (Checklists)   │  │
│  └───────────┬───────────┘  └────────┬────────┘  └────────┬─────────┘  │
│              └───────────────────────┼────────────────────┘            │
│                        Axios HTTP Client / Interceptors                │
└──────────────────────────────────────┼─────────────────────────────────┘
                                       │ Bearer JWT Token
                                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Node.js / Express Server API                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Middleware: JWT Verification -> RBAC Role Gate -> Error Handler  │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│         ┌───────────────────────────┼────────────────────────┐         │
│         ▼                           ▼                        ▼         │
│  /api/auth/*               /api/workspaces/*             /api/tasks/*  │
│  - /register               - /:id/members                - /:id/move   │
│  - /login                  - /:id/boards                 - /:id/status │
│  - /refresh                - /boards/:id                 - CRUD routes │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      │ Mongoose ORM / Driver
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          MongoDB Database                              │
│       [users]         [workspaces]         [boards]         [tasks]    │
└────────────────────────────────────────────────────────────────────────┘
```

### JWT Dual-Token Authentication Lifecycle
1. **Access Token**: Short-lived (15 minutes), sent in `Authorization: Bearer <token>` header, payload contains `{ userId, email }`.
2. **Refresh Token**: Long-lived (7 days), stored in an `httpOnly`, `secure`, `sameSite: 'strict'` cookie.
3. **Silent Refresh Interceptor**: Axios response interceptor detects `401 Unauthorized`, hits `/api/auth/refresh`, obtains new access token, and retries original request without user interruption.

### RBAC Permission Matrix
| Role | View Board | Create/Edit Tasks | Move Tasks | Manage Columns | Invite Members | Workspace Settings |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| **Admin** | Yes | Yes | Yes | Yes | Yes | Yes |
| **Project Manager** | Yes | Yes | Yes | Yes | Yes | No |
| **Member** | Yes | Yes | Yes | No | No | No |
| **Viewer** | Yes | No | No | No | No | No |

---

## 5. Next Steps & Implementation Roadmap

Once this plan is approved:
1. **Bootstrap Setup**: Configure unified dependencies (`express`, `mongoose`, `jsonwebtoken`, `bcryptjs`, `cors`, `@types/jsonwebtoken`, `@types/bcryptjs`).
2. **Server & Database Layer**:
   - Establish Mongoose connection in `server/config/db.ts` with resilience for local/cloud URI.
   - Implement Mongoose models (`User`, `Workspace`, `Board`, `Task`, `ActivityLog`).
   - Create auth & RBAC middleware with password hashing and token generation.
3. **REST API Endpoints**:
   - Auth endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`).
   - Workspace & Board endpoints with seed demo data.
   - Task CRUD & `/api/tasks/:id/move` with column rank calculation.
4. **React Frontend Experience**:
   - Build responsive workspace shell (Sidebar + Breadcrumb TopBar).
   - Implement high-performance Kanban board with fluid drag-and-drop state transitions and optimistic updates.
   - Detail modal for task inspection, checklist editing, and priority tagging.
