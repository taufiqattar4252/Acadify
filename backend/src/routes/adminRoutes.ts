import express from 'express';
import {
  getAllAdmins,
  getAdmin,
  createAdmin,
  updateAdmin,
  deleteAdmin
} from '../controllers/adminController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { createAdminSchema, updateAdminSchema } from '../validators/adminValidator';

const router = express.Router();

// All routes require authentication and Super Admin privileges
router.use(requireAuth, requireRole('Super Admin'));

router
  .route('/')
  .get(getAllAdmins)
  .post(validateRequest(createAdminSchema), createAdmin);

router
  .route('/:id')
  .get(getAdmin)
  .patch(validateRequest(updateAdminSchema), updateAdmin)
  .delete(deleteAdmin);

export default router;
