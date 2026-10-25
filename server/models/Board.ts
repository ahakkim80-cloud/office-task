import mongoose, { Document, Schema } from 'mongoose';

export interface IBoardColumn {
  _id: mongoose.Types.ObjectId;
  title: string;
  order: number;
  wipLimit?: number;
  color?: string;
}

export interface IBoard extends Document {
  workspaceId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  columns: IBoardColumn[];
  isArchived: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BoardColumnSchema = new Schema<IBoardColumn>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
    wipLimit: {
      type: Number,
      default: 0, // 0 means no limit
    },
    color: {
      type: String,
      default: '#94a3b8',
    },
  },
  { _id: true }
);

const BoardSchema = new Schema<IBoard>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Board title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    columns: [BoardColumnSchema],
    isArchived: {
      type: Boolean,
      default: false,
    },
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

// Indexes
BoardSchema.index({ workspaceId: 1, isArchived: 1 });

export const Board = mongoose.models.Board || mongoose.model<IBoard>('Board', BoardSchema);
