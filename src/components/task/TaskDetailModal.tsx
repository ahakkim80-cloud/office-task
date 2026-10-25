import React, { useState } from 'react';
import {
  X,
  CheckSquare,
  Plus,
  Trash2,
  Calendar,
  Tag,
  AlertCircle,
  Clock,
  User as UserIcon,
} from 'lucide-react';
import type { Task, BoardColumn, Priority, Role } from '../../../shared/types/index';

interface TaskDetailModalProps {
  task: Task;
  columns: BoardColumn[];
  userRole: Role;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  columns,
  userRole,
  onClose,
  onUpdate,
  onDelete,
}) => {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [columnId, setColumnId] = useState(task.columnId);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
  const [checklist, setChecklist] = useState(task.checklist || []);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newLabelText, setNewLabelText] = useState('');
  const [labels, setLabels] = useState<string[]>(task.labels || []);
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = userRole !== 'viewer';

  const handleToggleChecklist = (index: number) => {
    if (!canEdit) return;
    const updated = [...checklist];
    updated[index].completed = !updated[index].completed;
    setChecklist(updated);
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim() || !canEdit) return;
    const newItem = {
      _id: `chk_${Date.now()}`,
      title: newChecklistText.trim(),
      completed: false,
    };
    setChecklist([...checklist, newItem]);
    setNewChecklistText('');
  };

  const handleDeleteChecklistItem = (index: number) => {
    if (!canEdit) return;
    setChecklist(checklist.filter((_, idx) => idx !== index));
  };

  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelText.trim() || labels.includes(newLabelText.trim()) || !canEdit) return;
    setLabels([...labels, newLabelText.trim()]);
    setNewLabelText('');
  };

  const handleRemoveLabel = (label: string) => {
    if (!canEdit) return;
    setLabels(labels.filter((l) => l !== label));
  };

  const handleSave = async () => {
    if (!canEdit) return;
    setIsSaving(true);
    try {
      await onUpdate(task._id, {
        title,
        description,
        columnId,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        checklist,
        labels,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    await onDelete(task._id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono tabular-nums">
            <span>TASK #{task._id.slice(-6)}</span>
            <span aria-hidden="true">·</span>
            <span>Created {new Date(task.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={handleDelete}
                className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer rounded-md"
                title="Delete Task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 transition-colors cursor-pointer rounded-md"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Title
            </label>
            <input
              type="text"
              disabled={!canEdit}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-base font-semibold text-neutral-900 border border-neutral-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:bg-neutral-50"
            />
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200/80">
            <div>
              <label className="text-xs font-medium text-neutral-500 block mb-1">Lane</label>
              <select
                disabled={!canEdit}
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="w-full text-xs font-semibold text-neutral-800 bg-white border border-neutral-200 rounded-lg p-2 focus:outline-none cursor-pointer"
              >
                {columns.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-500 block mb-1">Priority</label>
              <select
                disabled={!canEdit}
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full text-xs font-semibold text-neutral-800 bg-white border border-neutral-200 rounded-lg p-2 focus:outline-none cursor-pointer capitalize"
              >
                <option value="urgent">Urgent (P0)</option>
                <option value="high">High (P1)</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-500 block mb-1">Due Date</label>
              <input
                type="date"
                disabled={!canEdit}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs font-semibold text-neutral-800 bg-white border border-neutral-200 rounded-lg p-2 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
              Description
            </label>
            <textarea
              disabled={!canEdit}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add technical notes, reproduction steps, or context..."
              className="w-full text-xs text-neutral-800 border border-neutral-200 rounded-lg p-3 focus:outline-none focus:ring-1 focus:ring-neutral-900 disabled:bg-neutral-50 leading-relaxed"
            />
          </div>

          {/* Checklist */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                Checklist ({checklist.filter((c) => c.completed).length}/{checklist.length})
              </label>
            </div>

            <div className="space-y-1.5 mb-3">
              {checklist.map((item, index) => (
                <div
                  key={item._id || index}
                  className="flex items-center justify-between p-2 rounded-lg bg-neutral-50/80 border border-neutral-200/60 text-xs group"
                >
                  <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      disabled={!canEdit}
                      onChange={() => handleToggleChecklist(index)}
                      className="rounded text-neutral-900 focus:ring-0 cursor-pointer"
                    />
                    <span
                      className={`${
                        item.completed ? 'line-through text-neutral-400' : 'text-neutral-800'
                      }`}
                    >
                      {item.title}
                    </span>
                  </label>
                  {canEdit && (
                    <button
                      onClick={() => handleDeleteChecklistItem(index)}
                      className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-rose-500 transition-opacity cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {canEdit && (
              <form onSubmit={handleAddChecklist} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add checklist sub-item..."
                  value={newChecklistText}
                  onChange={(e) => setNewChecklistText(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  Add
                </button>
              </form>
            )}
          </div>

          {/* Labels (Unboxed tags) */}
          <div>
            <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block mb-2">
              Labels
            </label>
            <div className="flex flex-wrap gap-2 mb-2 text-xs">
              {labels.map((lbl) => (
                <span
                  key={lbl}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-neutral-100 text-neutral-700 rounded-md font-medium text-xs"
                >
                  {lbl}
                  {canEdit && (
                    <button
                      onClick={() => handleRemoveLabel(lbl)}
                      className="text-neutral-400 hover:text-neutral-900 cursor-pointer"
                    >
                      ×
                    </button>
                  )}
                </span>
              ))}
            </div>

            {canEdit && (
              <form onSubmit={handleAddLabel} className="flex gap-2 max-w-xs">
                <input
                  type="text"
                  placeholder="New label..."
                  value={newLabelText}
                  onChange={(e) => setNewLabelText(e.target.value)}
                  className="text-xs px-2.5 py-1 border border-neutral-200 rounded-md focus:outline-none flex-1"
                />
                <button
                  type="submit"
                  className="px-2.5 py-1 text-xs bg-neutral-100 text-neutral-700 rounded-md font-medium hover:bg-neutral-200 cursor-pointer"
                >
                  Add
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-200 flex items-center justify-end gap-3 bg-neutral-50/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          {canEdit && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 rounded-lg hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
