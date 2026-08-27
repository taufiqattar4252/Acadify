import express from 'express';
import {
  register,
  login,
  adminLogin,
  partnerLogin,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  sendOtp,
  verifyOtp,
} from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from '../validators/authValidator';

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/admin/login', validateRequest(loginSchema), adminLogin);
router.post('/partner/login', validateRequest(loginSchema), partnerLogin);
router.post('/logout', logout);

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);


router.post('/verify-email/:token', validateRequest(verifyEmailSchema), verifyEmail);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validateRequest(resetPasswordSchema), resetPassword);

// Protected routes below
router.use(requireAuth);
router.get('/me', getMe);

export default router;
