import { Request, Response, NextFunction } from 'express';
import { dbStore } from '../services/dbStore.js';
import type { Role } from '../../shared/types/index.js';

const ROLE_RANK: Record<Role, number> = {
  viewer: 1,
  member: 2,
  manager: 3,
  admin: 4,
};

export function requireRole(minimumRole: Role) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const workspaceId =
      req.params.workspaceId ||
      req.body.workspaceId ||
      req.query.workspaceId;

    if (!workspaceId) {
      // Default to user role if workspace context is implicit
      const userRole = (req.user.role as Role) || 'member';
      if (ROLE_RANK[userRole] >= ROLE_RANK[minimumRole]) {
        return next();
      }
      res.status(403).json({
        message: `Forbidden: requires ${minimumRole} privileges, but you have ${userRole}.`,
      });
      return;
    }

    const workspace = dbStore.getWorkspaceById(workspaceId as string);
    if (!workspace) {
      res.status(404).json({ message: 'Workspace not found' });
      return;
    }

    const member = workspace.members.find(
      (m) => (typeof m.user === 'object' ? m.user._id : m.user) === req.user!._id
    );

    const userRole: Role = member ? member.role : 'viewer';

    if (ROLE_RANK[userRole] < ROLE_RANK[minimumRole]) {
      res.status(403).json({
        message: `Forbidden: ${minimumRole} role required. Your current role in this workspace is ${userRole}.`,
      });
      return;
    }

    next();
  };
}
