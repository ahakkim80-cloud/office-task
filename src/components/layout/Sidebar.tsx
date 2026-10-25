import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Kanban,
  FolderGit2,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  PlusCircle,
} from 'lucide-react';
import type { Board } from '../../../shared/types/index';

interface SidebarProps {
  boards: Board[];
  selectedBoardId: string | null;
  onSelectBoard: (boardId: string) => void;
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
  onOpenCreateBoard?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  boards,
  selectedBoardId,
  onSelectBoard,
  activeFilter,
  onSelectFilter,
  onOpenCreateBoard,
}) => {
  const { currentWorkspace, workspaces, setCurrentWorkspace, currentUserRole } = useAuth();

  return (
    <aside className="w-64 bg-neutral-50/80 border-r border-neutral-200 shrink-0 flex flex-col justify-between hidden md:flex h-[calc(100vh-57px)]">
      <div className="p-4 space-y-6 overflow-y-auto">
        {/* Workspace Switcher */}
        <div>
          <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1.5">
            Workspace
          </label>
          <div className="relative">
            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-neutral-200 shadow-xs">
              <Building2 className="w-4 h-4 text-neutral-600 shrink-0" />
              <select
                value={currentWorkspace?._id || ''}
                onChange={(e) => {
                  const target = workspaces.find((w) => w._id === e.target.value);
                  if (target) setCurrentWorkspace(target);
                }}
                className="w-full text-xs font-semibold text-neutral-800 bg-transparent focus:outline-none cursor-pointer truncate"
              >
                {workspaces.map((ws) => (
                  <option key={ws._id} value={ws._id}>
                    {ws.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Boards Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Boards
            </span>
            {currentUserRole === 'admin' || currentUserRole === 'manager' ? (
              <button
                onClick={onOpenCreateBoard}
                className="text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer"
                title="Create Board"
              >
                <PlusCircle className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          <div className="space-y-1">
            {boards.map((board) => {
              const isSelected = board._id === selectedBoardId;
              return (
                <button
                  key={board._id}
                  onClick={() => onSelectBoard(board._id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-700 hover:bg-neutral-200/60'
                  }`}
                >
                  <Kanban className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-neutral-400'}`} />
                  <span className="truncate">{board.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Filter Presets */}
        <div>
          <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
            Task Views
          </span>
          <div className="space-y-1">
            <button
              onClick={() => onSelectFilter('all')}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                activeFilter === 'all'
                  ? 'bg-neutral-200 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:bg-neutral-200/50'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5 text-neutral-500" />
              <span>All Tasks</span>
            </button>
            <button
              onClick={() => onSelectFilter('my_tasks')}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                activeFilter === 'my_tasks'
                  ? 'bg-neutral-200 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:bg-neutral-200/50'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-neutral-500" />
              <span>Assigned to Me</span>
            </button>
            <button
              onClick={() => onSelectFilter('urgent')}
              className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                activeFilter === 'urgent'
                  ? 'bg-neutral-200 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:bg-neutral-200/50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Urgent & High Priority</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Workspace Metadata (Clean unboxed text, no pills) */}
      <div className="p-4 border-t border-neutral-200 bg-neutral-100/60 text-xs text-neutral-500">
        <div className="flex items-center justify-between mb-1">
          <span className="font-semibold text-neutral-700">Cluster Status</span>
          <span className="font-mono text-emerald-600 font-medium">Ready</span>
        </div>
        <div className="text-[11px] text-neutral-400">
          <span>MongoDB Mongoose</span>
          <span className="mx-1.5">·</span>
          <span>Express 4.21</span>
        </div>
      </div>
    </aside>
  );
};
