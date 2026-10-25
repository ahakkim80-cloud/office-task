import mongoose, { Document, Schema } from 'mongoose';

export interface IChecklistItem {
  _id?: mongoose.Types.ObjectId;
  title: string;
  completed: boolean;
}

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
  checklist: IChecklistItem[];
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChecklistItemSchema = new Schema<IChecklistItem>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const TaskSchema = new Schema<ITask>(
  {
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    columnId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      default: 1000,
    },
    priority: {
      type: String,
      enum: ['urgent', 'high', 'medium', 'low'],
      default: 'medium',
      index: true,
    },
    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dueDate: {
      type: Date,
    },
    labels: [
      {
        type: String,
        trim: true,
      },
    ],
    checklist: [ChecklistItemSchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// High-speed compound index for Kanban hydration and sorting
TaskSchema.index({ boardId: 1, columnId: 1, order: 1 });
TaskSchema.index({ boardId: 1, dueDate: 1 });

export const Task = mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
