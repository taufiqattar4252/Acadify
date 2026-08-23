import express from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import {
  getAvailableMockTests,
  getMockTestDetails,
  getPurchases,
  getStudentProfile,
  updateStudentProfile,
  changePassword,
  updateNotificationPreferences,
  getStudentDashboard,
  getStudentStudyProgress,
  getChapterIncorrectQuestions,
} from '../controllers/studentController';
import {
  getCart,
  addToCart,
  removeFromCart,
  clearCart,
  applyCoupon,
  removeCoupon,
  checkoutCart,
} from '../controllers/studentCartController';

const router = express.Router();

// Apply auth middleware to all student routes
router.use(requireAuth);

// Dashboard
router.get('/dashboard', getStudentDashboard);
router.get('/dashboard/study-progress', getStudentStudyProgress);
router.get('/dashboard/study-progress/:chapterId/incorrect', getChapterIncorrectQuestions);

// Mock Tests (Store)
router.get('/mock-tests', getAvailableMockTests);
router.get('/mock-tests/:slug', getMockTestDetails);

// Cart & Checkout
router.get('/cart', getCart);
router.post('/cart/add', addToCart);
router.delete('/cart/remove/:mockId', removeFromCart);
router.delete('/cart/clear', clearCart);
router.post('/cart/apply-coupon', applyCoupon);
router.delete('/cart/remove-coupon', removeCoupon);
router.post('/cart/checkout', checkoutCart);

// Purchases
router.get('/purchases', getPurchases);

// Profile
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.put('/change-password', changePassword);
router.put('/notification-preferences', updateNotificationPreferences);

export default router;
