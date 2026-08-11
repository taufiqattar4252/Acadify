import express from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getPaymentDetails,
  razorpayWebhook,
} from '../controllers/paymentController';

const router = express.Router();

// Webhook must be public and ideally uses express.json() but we already parse JSON globally in app.ts
router.post('/webhook', razorpayWebhook);

// Protected Student Routes
router.use(requireAuth);
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.get('/history', getPaymentHistory);
router.get('/:id', getPaymentDetails);

export default router;
