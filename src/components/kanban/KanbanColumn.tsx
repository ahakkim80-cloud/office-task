import React, { useState } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { TaskCard } from './TaskCard';
import type { BoardColumn, Task, Role } from '../../../shared/types/index';

interface KanbanColumnProps {
  column: BoardColumn;
  tasks: Task[];
  userRole: Role;
  onSelectTask: (task: Task) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
  onDropTask: (columnId: string) => void;
  onQuickAddTask: (columnId: string) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  tasks,
  userRole,
  onSelectTask,
  onDragStart,
  onDropTask,
  onQuickAddTask,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const isWipExceeded = column.wipLimit && column.wipLimit > 0 && tasks.length >= column.wipLimit;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDropTask(column._id);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`flex flex-col flex-1 min-w-[280px] max-w-[340px] bg-neutral-100/70 rounded-xl p-3 border transition-colors ${
        isDragOver
          ? 'border-blue-400 bg-blue-50/40 ring-2 ring-blue-100'
          : 'border-neutral-200/80'
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-1 border-b border-neutral-200/60">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: column.color || '#64748B' }}
          />
          <h3 className="text-xs font-bold text-neutral-800 tracking-tight uppercase">
            {column.title}
          </h3>
        </div>

        {/* Count and WIP Limit */}
        <div className="flex items-center gap-1.5 text-xs font-mono tabular-nums">
          <span className="font-semibold text-neutral-700 bg-white px-2 py-0.5 rounded border border-neutral-200 shadow-2xs">
            {tasks.length}
          </span>
          {column.wipLimit && column.wipLimit > 0 ? (
            <span
              className={`text-[11px] ${
                isWipExceeded ? 'text-rose-600 font-bold' : 'text-neutral-400'
              }`}
              title={`WIP Limit: ${column.wipLimit}`}
            >
              / {column.wipLimit}
            </span>
          ) : null}
        </div>
      </div>

      {/* Task List Scroll Container */}
      <div className="flex-1 space-y-2.5 overflow-y-auto min-h-[140px] py-1">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onSelect={onSelectTask}
            onDragStart={onDragStart}
          />
        ))}

        {tasks.length === 0 && (
          <div className="h-28 flex flex-col items-center justify-center border border-dashed border-neutral-300 rounded-lg text-neutral-400 text-xs">
            <span>No tasks in this lane</span>
          </div>
        )}
      </div>

      {/* Bottom Column Action */}
      {userRole !== 'viewer' && (
        <button
          onClick={() => onQuickAddTask(column._id)}
          className="mt-2 flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-neutral-200 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Task</span>
        </button>
      )}
    </div>
  );
};
