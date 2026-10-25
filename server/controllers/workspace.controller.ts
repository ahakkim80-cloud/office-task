import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore.js';
import type { Role } from '../../shared/types/index.js';

export const workspaceController = {
  async getWorkspaces(req: Request, res: Response) {
    try {
      const userId = req.user!._id;
      const workspaces = dbStore.getUserWorkspaces(userId);
      return res.json({ workspaces });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error fetching workspaces' });
    }
  },

  async getWorkspace(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const workspace = dbStore.getWorkspaceById(id);
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      return res.json({ workspace });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error fetching workspace' });
    }
  },

  async addMember(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email, role } = req.body;

      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }

      const assignedRole: Role = role || 'member';
      const result = dbStore.addWorkspaceMember(id, email, assignedRole);

      if (!result) {
        return res.status(404).json({ message: 'Workspace not found' });
      }

      return res.status(201).json({
        message: 'Member invited successfully',
        workspace: result.workspace,
        member: result.memberUser,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error adding member' });
    }
  },

  async updateMemberRole(req: Request, res: Response) {
    try {
      const { id, memberId } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({ message: 'Role is required' });
      }

      const success = dbStore.updateMemberRole(id, memberId, role as Role);
      if (!success) {
        return res.status(404).json({ message: 'Workspace or member not found' });
      }

      const updatedWs = dbStore.getWorkspaceById(id);
      return res.json({ workspace: updatedWs, message: 'Role updated successfully' });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error updating member role' });
    }
  },

  async getBoards(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const boards = dbStore.getBoardsByWorkspace(id);
      return res.json({ boards });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error fetching boards' });
    }
  },

  async createBoard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, description } = req.body;

      if (!title) {
        return res.status(400).json({ message: 'Board title is required' });
      }

      const board = dbStore.createBoard(id, title, description || '', req.user!._id);
      return res.status(201).json({ board });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error creating board' });
    }
  },
};
