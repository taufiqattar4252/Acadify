import express from 'express';
import {
  getSettings,
  updateProfile,
  updateGeneral,
  updateExam,
  updatePayment,
  updateEmail,
  updateNotifications,
  updateRoles,
  updateBranding,
  updateSecurity,
  testEmail
} from '../controllers/adminSettingsController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { AdminRole } from '../models/Admin';

const router = express.Router();

// Require admin authentication for all routes
router.use(requireAuth);

// Base GET settings (accessible by any admin, sensitive keys masked in controller)
router.get('/', getSettings);

// Profile is updateable by the currently logged in admin
router.put('/profile', updateProfile);

// The following can be updated by Content Admin or Super Admin
router.put('/general', requireRole(AdminRole.CONTENT_ADMIN, AdminRole.SUPER_ADMIN), updateGeneral);
router.put('/exam', requireRole(AdminRole.CONTENT_ADMIN, AdminRole.SUPER_ADMIN), updateExam);
router.put('/branding', requireRole(AdminRole.CONTENT_ADMIN, AdminRole.SUPER_ADMIN), updateBranding);
router.put('/notifications', requireRole(AdminRole.CONTENT_ADMIN, AdminRole.SUPER_ADMIN), updateNotifications);

// The following are HIGHLY SENSITIVE and only accessible by Super Admin
router.put('/payment', requireRole(AdminRole.SUPER_ADMIN), updatePayment);
router.put('/security', requireRole(AdminRole.SUPER_ADMIN), updateSecurity);
router.put('/roles', requireRole(AdminRole.SUPER_ADMIN), updateRoles);
router.put('/email', requireRole(AdminRole.SUPER_ADMIN), updateEmail);
router.post('/email/test', requireRole(AdminRole.SUPER_ADMIN), testEmail);

export default router;
