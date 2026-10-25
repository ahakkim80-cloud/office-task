import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { BoardColumn, Priority } from '../../../shared/types/index';

interface TaskCreateModalProps {
  columns: BoardColumn[];
  defaultColumnId?: string;
  onClose: () => void;
  onCreate: (taskData: {
    columnId: string;
    title: string;
    description: string;
    priority: Priority;
    labels: string[];
    dueDate?: string;
  }) => Promise<void>;
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  columns,
  defaultColumnId,
  onClose,
  onCreate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [columnId, setColumnId] = useState(defaultColumnId || columns[0]?._id || '');
  const [priority, setPriority] = useState<Priority>('medium');
  const [labelsInput, setLabelsInput] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const labels = labelsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await onCreate({
        columnId,
        title: title.trim(),
        description: description.trim(),
        priority,
        labels,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create task');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <h3 className="text-sm font-bold text-neutral-900 tracking-tight">Create New Task</h3>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Audit Redis rate limiter middleware"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs border border-neutral-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Lane</label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="w-full text-xs border border-neutral-200 rounded-lg p-2.5 focus:outline-none cursor-pointer bg-white"
              >
                {columns.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full text-xs border border-neutral-200 rounded-lg p-2.5 focus:outline-none cursor-pointer bg-white capitalize"
              >
                <option value="urgent">Urgent (P0)</option>
                <option value="high">High (P1)</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-700 block mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Add technical context, specifications, or link to issues..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs border border-neutral-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">
                Labels (comma-separated)
              </label>
              <input
                type="text"
                placeholder="Backend, P0, Auth"
                value={labelsInput}
                onChange={(e) => setLabelsInput(e.target.value)}
                className="w-full text-xs border border-neutral-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-neutral-900"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-700 block mb-1">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs border border-neutral-200 rounded-lg p-2.5 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
