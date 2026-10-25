import mongoose, { Document, Schema } from 'mongoose';

export interface IWorkspaceMember {
  user: mongoose.Types.ObjectId;
  role: 'admin' | 'manager' | 'member' | 'viewer';
  joinedAt: Date;
}

export interface IWorkspace extends Document {
  name: string;
  slug: string;
  owner: mongoose.Types.ObjectId;
  members: IWorkspaceMember[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceMemberSchema = new Schema<IWorkspaceMember>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['admin', 'manager', 'member', 'viewer'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const WorkspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
      maxlength: [80, 'Workspace name cannot exceed 80 characters'],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: [WorkspaceMemberSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user workspaces fast
WorkspaceSchema.index({ 'members.user': 1 });

export const Workspace = mongoose.models.Workspace || mongoose.model<IWorkspace>('Workspace', WorkspaceSchema);
