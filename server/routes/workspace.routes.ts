import { Router } from 'express';
import { workspaceController } from '../controllers/workspace.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authMiddleware);

router.get('/', workspaceController.getWorkspaces);
router.get('/:id', workspaceController.getWorkspace);
router.post('/:id/members', requireRole('manager'), workspaceController.addMember);
router.patch('/:id/members/:memberId/role', requireRole('admin'), workspaceController.updateMemberRole);
router.get('/:id/boards', workspaceController.getBoards);
router.post('/:id/boards', requireRole('manager'), workspaceController.createBoard);

export default router;
