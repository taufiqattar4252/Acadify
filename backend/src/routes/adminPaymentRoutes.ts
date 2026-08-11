import express from 'express';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';
import { getAllPayments, getPaymentStats } from '../controllers/adminPaymentController';

const router = express.Router();

router.use(requireAuth);
router.use(requireAdmin); // Super Admin or related role

router.get('/', getAllPayments);
router.get('/stats', getPaymentStats);

export default router;
