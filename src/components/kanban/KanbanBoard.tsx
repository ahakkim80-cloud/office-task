import React, { useState } from 'react';
import { KanbanColumn } from './KanbanColumn';
import { Search, Filter, History, Sparkles, CheckCircle2 } from 'lucide-react';
import type { Board, Task, Role, ActivityLog } from '../../../shared/types/index';

interface KanbanBoardProps {
  board: Board;
  tasks: Task[];
  activities: ActivityLog[];
  userRole: Role;
  onSelectTask: (task: Task) => void;
  onMoveTask: (taskId: string, targetColumnId: string, newOrder: number) => Promise<void>;
  onQuickAddTask: (columnId: string) => void;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  board,
  tasks,
  activities,
  userRole,
  onSelectTask,
  onMoveTask,
  onQuickAddTask,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showActivityDrawer, setShowActivityDrawer] = useState(false);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    if (userRole === 'viewer') return;
    setDraggedTask(task);
    e.dataTransfer.setData('text/plain', task._id);
  };

  const handleDropTask = async (targetColumnId: string) => {
    if (!draggedTask || userRole === 'viewer') return;

    if (draggedTask.columnId === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    // Calculate order in target column
    const targetTasks = tasks.filter((t) => t.columnId === targetColumnId);
    const newOrder = targetTasks.length > 0 ? Math.max(...targetTasks.map((t) => t.order)) + 1000 : 1000;

    const currentTask = draggedTask;
    setDraggedTask(null);

    await onMoveTask(currentTask._id, targetColumnId, newOrder);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchLabel = t.labels?.some((l) => l.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchLabel) return false;
    }
    if (selectedPriority !== 'all' && t.priority !== selectedPriority) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-57px)] overflow-hidden bg-neutral-50/50">
      {/* Board Toolbar & Filters */}
      <div className="px-6 py-3.5 bg-white border-b border-neutral-200 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-base font-bold text-neutral-900 tracking-tight leading-none mb-1">
              {board.title}
            </h1>
            <p className="text-xs text-neutral-500 line-clamp-1 max-w-md">
              {board.description || 'Sprint deliverables and active tasks.'}
            </p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter tasks or labels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-neutral-100/80 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 w-44 md:w-56"
            />
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="text-xs px-2.5 py-1.5 bg-neutral-100/80 border border-neutral-200 rounded-lg focus:outline-none text-neutral-700 cursor-pointer font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent (P0)</option>
            <option value="high">High (P1)</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <button
            onClick={() => setShowActivityDrawer(!showActivityDrawer)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
              showActivityDrawer
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Audit Log</span>
          </button>
        </div>
      </div>

      {/* Main Kanban Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-x-auto p-6 flex gap-5 items-start">
          {board.columns.map((column) => {
            const columnTasks = filteredTasks.filter((t) => t.columnId === column._id);
            return (
              <KanbanColumn
                key={column._id}
                column={column}
                tasks={columnTasks}
                userRole={userRole}
                onSelectTask={onSelectTask}
                onDragStart={handleDragStart}
                onDropTask={handleDropTask}
                onQuickAddTask={onQuickAddTask}
              />
            );
          })}
        </div>

        {/* Activity Drawer */}
        {showActivityDrawer && (
          <div className="w-80 bg-white border-l border-neutral-200 flex flex-col h-full shrink-0 animate-in slide-in-from-right duration-200">
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-neutral-700" />
                <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Audit Activity Trail
                </h3>
              </div>
              <button
                onClick={() => setShowActivityDrawer(false)}
                className="text-neutral-400 hover:text-neutral-900 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-3.5">
              {activities.map((act) => (
                <div key={act._id} className="text-xs space-y-1 pb-3 border-b border-neutral-100 last:border-0">
                  <div className="flex items-center justify-between text-neutral-500">
                    <span className="font-semibold text-neutral-800">
                      {typeof act.actor === 'object' ? act.actor.name : 'Team Member'}
                    </span>
                    <span className="font-mono text-[10px] tabular-nums">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-neutral-600">
                    <span className="font-medium text-neutral-900">{act.action}</span>{' '}
                    {act.details.taskTitle && (
                      <span className="italic">"{act.details.taskTitle}"</span>
                    )}
                  </p>
                  {act.details.fromColumn && act.details.toColumn && (
                    <div className="text-[11px] text-neutral-500 font-mono">
                      {act.details.fromColumn} → {act.details.toColumn}
                    </div>
                  )}
                </div>
              ))}

              {activities.length === 0 && (
                <div className="text-center py-8 text-neutral-400 text-xs">
                  No activity recorded yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
