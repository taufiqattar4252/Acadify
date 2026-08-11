import express from 'express';
import { requireAuth, requireAdmin, requireRole } from '../middleware/authMiddleware';
import {
  getAllPurchases,
  getPurchaseDetails,
  grantAccess,
  revokeAccess,
  refundPurchase,
  resendPurchaseEmail,
  exportPurchases,
  deletePurchase
} from '../controllers/adminPurchaseController';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// Content Admin is View Only (handled by requireAdmin but we need finer grain)
// But wait, the standard requireAdmin in Acadify allows Super Admin, Content Admin, Support Admin.
// We'll define specific roles per route as requested.

// 1. Super Admin: Full Access
// 2. Finance Admin: View, Refund, Export
// 3. Support Admin: View, Grant Access, Revoke Access
// 4. Content Admin: View Only

// To handle this properly, any route requires at least one of these roles.
const allAdmins = ['Super Admin', 'Finance Admin', 'Support Admin', 'Content Admin'];

// Export (Super Admin, Finance Admin)
router.get(
  '/export',
  requireRole('Super Admin', 'Finance Admin'),
  exportPurchases
);

// View All (All Admins)
router.get(
  '/',
  requireRole(...allAdmins),
  getAllPurchases
);

// View Single (All Admins)
router.get(
  '/:id',
  requireRole(...allAdmins),
  getPurchaseDetails
);

// Grant Access (Super Admin, Support Admin)
router.patch(
  '/:id/grant-access',
  requireRole('Super Admin', 'Support Admin'),
  grantAccess
);

// Revoke Access (Super Admin, Support Admin)
router.patch(
  '/:id/revoke-access',
  requireRole('Super Admin', 'Support Admin'),
  revokeAccess
);

// Refund (Super Admin, Finance Admin)
router.patch(
  '/:id/refund',
  requireRole('Super Admin', 'Finance Admin'),
  refundPurchase
);

// Resend Email (Super Admin, Support Admin)
router.post(
  '/:id/resend-email',
  requireRole('Super Admin', 'Support Admin'),
  resendPurchaseEmail
);

// Delete (Super Admin Only)
router.delete(
  '/:id',
  requireRole('Super Admin'),
  deletePurchase
);

export default router;
