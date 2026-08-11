import express from 'express';
import {
  getAllPartners,
  getPartner,
  createPartner,
  updatePartner,
  updatePartnerStatus,
  deletePartner,
  generateCoupon,
  getPartnerCommissions,
  getPartnerPurchases,
  changePartnerCommission,
  payCommission
} from '../controllers/adminPartnerController';
import { requireAuth, requireAdmin } from '../middleware/authMiddleware';

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.route('/')
  .get(getAllPartners)
  .post(createPartner);

router.route('/:id')
  .get(getPartner)
  .put(updatePartner)
  .delete(deletePartner);

router.patch('/:id/status', updatePartnerStatus);
router.patch('/:id/commission', changePartnerCommission);
router.post('/:id/generate-coupon', generateCoupon);

router.get('/:id/commissions', getPartnerCommissions);
router.get('/:id/purchases', getPartnerPurchases);
router.patch('/commissions/:commissionId/pay', payCommission);

export default router;
