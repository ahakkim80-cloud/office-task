import { Router } from 'express';
import { taskController } from '../controllers/task.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/rbac.middleware.js';

const router = Router();

router.use(authMiddleware);

// Board details, tasks, and activity timeline
router.get('/board/:boardId', taskController.getBoardDetails);

// Task mutations with RBAC
router.post('/board/:boardId', requireRole('member'), taskController.createTask);
router.patch('/:id', requireRole('member'), taskController.updateTask);
router.patch('/:id/move', requireRole('member'), taskController.moveTask);
router.delete('/:id', requireRole('member'), taskController.deleteTask);

export default router;
