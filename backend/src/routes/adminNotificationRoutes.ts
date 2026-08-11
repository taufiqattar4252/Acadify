import express from 'express';
import { 
  sendBroadcast, 
  getNotificationHistory, 
  getDashboardStats,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate
} from '../controllers/adminNotificationController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = express.Router();

router.use(requireAuth);
router.use(requireRole('Super Admin')); // Or whatever specific roles are required

// Dashboard & Broadcasts
router.get('/dashboard-stats', getDashboardStats);
router.get('/history', getNotificationHistory);
router.post('/broadcast', sendBroadcast);

// Templates
router.route('/templates')
  .get(getTemplates)
  .post(createTemplate);

router.route('/templates/:id')
  .put(updateTemplate)
  .delete(deleteTemplate);

export default router;
