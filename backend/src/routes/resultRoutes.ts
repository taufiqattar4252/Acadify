import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';
import { getStudentAttempts, getAttemptDetails, getAdminAnalytics, getAllAttempts } from '../controllers/resultController';

const router = express.Router();

// Student Routes
router.get('/student/results', requireAuth, getStudentAttempts);
router.get('/student/results/:attemptId', requireAuth, getAttemptDetails);

// Admin Routes
router.get('/admin/analytics', requireAuth, requireAdmin, getAdminAnalytics);
router.get('/admin/attempts', requireAuth, requireAdmin, getAllAttempts);

export default router;
