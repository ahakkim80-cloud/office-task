import { Request, Response } from 'express';
import { dbStore } from '../services/dbStore.js';

export const taskController = {
  async getBoardDetails(req: Request, res: Response) {
    try {
      const { boardId } = req.params;
      const board = dbStore.getBoardById(boardId);

      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      const tasks = dbStore.getTasksByBoard(boardId);
      const activities = dbStore.getBoardActivities(boardId);
      const workspace = dbStore.getWorkspaceById(board.workspaceId);

      return res.json({
        board,
        tasks,
        activities,
        workspace,
      });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error fetching board data' });
    }
  },

  async createTask(req: Request, res: Response) {
    try {
      const { boardId } = req.params;
      const { columnId, title, description, priority, assignees, dueDate, labels, checklist } = req.body;

      if (!title || !columnId) {
        return res.status(400).json({ message: 'Title and columnId are required' });
      }

      const board = dbStore.getBoardById(boardId);
      if (!board) {
        return res.status(404).json({ message: 'Board not found' });
      }

      // Check WIP limit on target column
      const column = board.columns.find((c) => c._id === columnId);
      if (column && column.wipLimit && column.wipLimit > 0) {
        const currentCount = dbStore.getTasksByBoard(boardId).filter((t) => t.columnId === columnId).length;
        if (currentCount >= column.wipLimit) {
          return res.status(400).json({
            message: `WIP limit exceeded: "${column.title}" allows at most ${column.wipLimit} active tasks.`,
          });
        }
      }

      // Resolve assignees if provided as IDs
      const resolvedAssignees = (assignees || []).map((idOrUser: any) => {
        if (typeof idOrUser === 'string') {
          return dbStore.findUserById(idOrUser) || idOrUser;
        }
        return idOrUser;
      });

      const task = dbStore.createTask({
        boardId,
        columnId,
        title,
        description,
        priority,
        assignees: resolvedAssignees,
        dueDate,
        labels,
        checklist,
        createdBy: req.user!._id,
      });

      return res.status(201).json({ task });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error creating task' });
    }
  },

  async updateTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const updated = dbStore.updateTask(id, updates, req.user!._id);
      if (!updated) {
        return res.status(404).json({ message: 'Task not found' });
      }

      return res.json({ task: updated });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error updating task' });
    }
  },

  async moveTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { targetColumnId, newOrder } = req.body;

      if (!targetColumnId || newOrder === undefined) {
        return res.status(400).json({ message: 'targetColumnId and newOrder are required' });
      }

      const existingTask = dbStore.getTaskById(id);
      if (!existingTask) {
        return res.status(404).json({ message: 'Task not found' });
      }

      const board = dbStore.getBoardById(existingTask.boardId);
      const targetCol = board?.columns.find((c) => c._id === targetColumnId);

      // Check WIP limit if moving to a different column
      if (existingTask.columnId !== targetColumnId && targetCol && targetCol.wipLimit && targetCol.wipLimit > 0) {
        const currentCount = dbStore.getTasksByBoard(existingTask.boardId).filter((t) => t.columnId === targetColumnId).length;
        if (currentCount >= targetCol.wipLimit) {
          return res.status(400).json({
            message: `WIP limit exceeded: "${targetCol.title}" cannot exceed ${targetCol.wipLimit} tasks.`,
          });
        }
      }

      const moved = dbStore.moveTask(id, targetColumnId, Number(newOrder), req.user!._id);
      return res.json({ task: moved });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error moving task' });
    }
  },

  async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = dbStore.deleteTask(id, req.user!._id);

      if (!success) {
        return res.status(404).json({ message: 'Task not found' });
      }

      return res.json({ message: 'Task deleted successfully', id });
    } catch (err: any) {
      return res.status(500).json({ message: err.message || 'Error deleting task' });
    }
  },
};
