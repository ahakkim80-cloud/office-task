import React from 'react';
import { CheckSquare, Calendar, AlertCircle } from 'lucide-react';
import type { Task, Priority } from '../../../shared/types/index';

interface TaskCardProps {
  task: Task;
  onSelect: (task: Task) => void;
  onDragStart: (e: React.DragEvent, task: Task) => void;
}

const PRIORITY_THEME: Record<Priority, { label: string; dot: string; text: string }> = {
  urgent: { label: 'Urgent', dot: 'bg-rose-500', text: 'text-rose-600' },
  high: { label: 'High', dot: 'bg-orange-500', text: 'text-orange-600' },
  medium: { label: 'Medium', dot: 'bg-blue-500', text: 'text-blue-600' },
  low: { label: 'Low', dot: 'bg-slate-400', text: 'text-slate-500' },
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onSelect, onDragStart }) => {
  const completedChecklist = task.checklist ? task.checklist.filter((c) => c.completed).length : 0;
  const totalChecklist = task.checklist ? task.checklist.length : 0;
  const priorityInfo = PRIORITY_THEME[task.priority] || PRIORITY_THEME.medium;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, task)}
      onClick={() => onSelect(task)}
      className="p-3.5 bg-white rounded-lg border border-neutral-200/90 shadow-xs hover:border-neutral-300 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing group select-none"
    >
      {/* Top row: Priority & Labels (Unboxed, typographic discipline) */}
      <div className="flex items-center justify-between gap-2 mb-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${priorityInfo.dot} shrink-0`} />
          <span className={`font-semibold ${priorityInfo.text}`}>{priorityInfo.label}</span>
          {task.labels && task.labels.length > 0 ? (
            <>
              <span className="text-neutral-300" aria-hidden="true">·</span>
              <span className="text-neutral-500 font-medium truncate max-w-[120px]">
                {task.labels.join(', ')}
              </span>
            </>
          ) : null}
        </div>

        <span className="font-mono text-[11px] text-neutral-400 tabular-nums">
          #{task._id.slice(-4)}
        </span>
      </div>

      {/* Task Title */}
      <h4 className="text-sm font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-3">
        {task.title}
      </h4>

      {/* Bottom Metadata: Checklist & Assignees (Zero pills, clean typography) */}
      <div className="flex items-center justify-between text-xs text-neutral-500 pt-2 border-t border-neutral-100">
        <div className="flex items-center gap-3">
          {totalChecklist > 0 && (
            <div className="flex items-center gap-1 font-mono text-[11px] tabular-nums text-neutral-600">
              <CheckSquare className="w-3.5 h-3.5 text-neutral-400" />
              <span>
                {completedChecklist}/{totalChecklist}
              </span>
            </div>
          )}

          {task.dueDate && (
            <div className="flex items-center gap-1 text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
              <span className="font-mono tabular-nums">{formatDate(task.dueDate)}</span>
            </div>
          )}
        </div>

        {/* Assignees */}
        <div className="flex items-center -space-x-1.5 overflow-hidden">
          {task.assignees && task.assignees.length > 0 ? (
            task.assignees.slice(0, 3).map((assignee, idx) => {
              const name = typeof assignee === 'object' ? assignee.name : 'User';
              const avatar = typeof assignee === 'object' ? assignee.avatar : undefined;
              return avatar ? (
                <img
                  key={idx}
                  src={avatar}
                  alt={name}
                  className="w-5 h-5 rounded-full border border-white object-cover"
                />
              ) : (
                <div
                  key={idx}
                  className="w-5 h-5 rounded-full bg-neutral-200 border border-white flex items-center justify-center text-[9px] font-bold text-neutral-700"
                  title={name}
                >
                  {name.charAt(0)}
                </div>
              );
            })
          ) : (
            <span className="text-[11px] text-neutral-400">Unassigned</span>
          )}
        </div>
      </div>
    </div>
  );
};
