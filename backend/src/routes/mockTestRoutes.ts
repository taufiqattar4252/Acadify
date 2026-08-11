import express from 'express';
import {
  getAllMockTests,
  getMockTestById,
  createMockTest,
  updateMockTest,
  deleteMockTest,
  restoreMockTest,
  updateMockTestStatus,
  cloneMockTest,
} from '../controllers/mockTestController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { createMockTestSchema, updateMockTestSchema, updateStatusSchema } from '../validators/mockTestValidator';

const router = express.Router();

// Apply auth middleware to all routes
router.use(requireAuth);

// Allow Super Admin and Content Admin to manage mock tests
router.use(requireRole('Super Admin', 'Content Admin', 'Support Admin')); 

const restrictToMutators = requireRole('Super Admin', 'Content Admin');

router.route('/')
  .get(getAllMockTests)
  .post(restrictToMutators, validateRequest(createMockTestSchema), createMockTest);

router.route('/:id')
  .get(getMockTestById)
  .put(restrictToMutators, validateRequest(updateMockTestSchema), updateMockTest)
  .delete(restrictToMutators, deleteMockTest);

router.patch('/:id/status', restrictToMutators, validateRequest(updateStatusSchema), updateMockTestStatus);
router.patch('/:id/restore', restrictToMutators, restoreMockTest);
router.post('/:id/clone', restrictToMutators, cloneMockTest);

export default router;
