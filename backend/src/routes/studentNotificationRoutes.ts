import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  updatePreferences
} from '../controllers/studentNotificationController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(UserRole.STUDENT));

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);
router.patch('/preferences', updatePreferences);

export default router;
