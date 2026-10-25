import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Shield, UserCircle } from 'lucide-react';
import type { Role } from '../../../shared/types/index';

interface TopBarProps {
  currentTab: 'board' | 'architecture' | 'api' | 'team';
  onSelectTab: (tab: 'board' | 'architecture' | 'api' | 'team') => void;
  onOpenCreateTask: () => void;
  onOpenAuthModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenCreateTask,
  onOpenAuthModal,
}) => {
  const { user, currentUserRole, switchRole } = useAuth();

  const roleColors: Record<Role, string> = {
    admin: 'text-rose-600 bg-rose-50 border-rose-200',
    manager: 'text-amber-600 bg-amber-50 border-amber-200',
    member: 'text-blue-600 bg-blue-50 border-blue-200',
    viewer: 'text-slate-600 bg-slate-50 border-slate-200',
  };

  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-neutral-200 shrink-0 sticky top-0 z-30">
      {/* Zone 1: Brand wordmark (single line, no subtitle) */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onSelectTab('board');
          }}
          className="text-lg font-bold tracking-tight text-neutral-900 whitespace-nowrap"
        >
          TaskFlow
        </a>
        <span className="text-xs text-neutral-400 font-mono">MERN</span>
      </div>

      {/* Zone 2: 4-5 clean single-line nav links with hover underlines */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-600">
        <button
          onClick={() => onSelectTab('board')}
          className={`hover:text-neutral-900 transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
            currentTab === 'board'
              ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900'
              : ''
          }`}
        >
          Kanban Board
        </button>
        <button
          onClick={() => onSelectTab('architecture')}
          className={`hover:text-neutral-900 transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
            currentTab === 'architecture'
              ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900'
              : ''
          }`}
        >
          Architecture & Schemas
        </button>
        <button
          onClick={() => onSelectTab('api')}
          className={`hover:text-neutral-900 transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
            currentTab === 'api'
              ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900'
              : ''
          }`}
        >
          REST API Spec
        </button>
        <button
          onClick={() => onSelectTab('team')}
          className={`hover:text-neutral-900 transition-colors whitespace-nowrap cursor-pointer pb-0.5 ${
            currentTab === 'team'
              ? 'text-neutral-900 font-semibold border-b-2 border-neutral-900'
              : ''
          }`}
        >
          Team & RBAC
        </button>
      </nav>

      {/* Zone 3: 1 primary action & role tester */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Quick RBAC Role Switcher */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 rounded-md text-xs">
          <Shield className="w-3.5 h-3.5 text-neutral-500" />
          <span className="text-neutral-500 font-medium">Role:</span>
          <select
            value={currentUserRole}
            onChange={(e) => switchRole(e.target.value as Role)}
            className="bg-transparent font-semibold text-neutral-900 focus:outline-none cursor-pointer text-xs capitalize"
          >
            <option value="admin">Admin (Alex)</option>
            <option value="manager">Manager (Elena)</option>
            <option value="member">Member (Marcus)</option>
            <option value="viewer">Viewer (Sarah)</option>
          </select>
        </div>

        {currentUserRole !== 'viewer' ? (
          <button
            onClick={onOpenCreateTask}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors whitespace-nowrap shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        ) : (
          <div className="text-xs text-neutral-500 font-medium px-2 py-1 bg-neutral-100 rounded">
            Read-only mode
          </div>
        )}

        <button
          onClick={onOpenAuthModal}
          className="p-1.5 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
          title={user ? `Signed in as ${user.name}` : 'Sign In'}
        >
          <UserCircle className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};
