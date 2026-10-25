import mongoose, { Document, Schema } from 'mongoose';

export interface IActivityLog extends Document {
  workspaceId: mongoose.Types.ObjectId;
  boardId: mongoose.Types.ObjectId;
  taskId?: mongoose.Types.ObjectId;
  actor: mongoose.Types.ObjectId;
  action: 'created' | 'moved' | 'updated' | 'assigned' | 'commented' | 'deleted';
  details: Record<string, any>;
  timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
      index: true,
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
      index: true,
    },
    actor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      enum: ['created', 'moved', 'updated', 'assigned', 'commented', 'deleted'],
      required: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Query recent board events sorted by time
ActivityLogSchema.index({ boardId: 1, timestamp: -1 });

export const ActivityLog = mongoose.models.ActivityLog || mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
