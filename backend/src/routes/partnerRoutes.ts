import express from 'express';
import {
  getDashboardSummary,
  getProfile,
  updateProfile,
  getCommissions,
  getPurchases
} from '../controllers/partnerDashboardController';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

// All routes require auth
router.use(requireAuth);

router.get('/dashboard', getDashboardSummary);

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

router.get('/commissions', getCommissions);
router.get('/purchases', getPurchases);

export default router;
