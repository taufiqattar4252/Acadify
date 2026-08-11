import express from 'express';
import {
  getAllSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,
  toggleStatus,
  restoreSubject
} from '../controllers/subjectController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { createSubjectSchema, updateSubjectSchema } from '../validators/subjectValidator';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// GET routes are accessible by all admins (Super, Content, Support)
router.get('/', getAllSubjects);
router.get('/:id', getSubject);

// Modifying routes require Super Admin or Content Admin
router.use(requireRole('Super Admin', 'Content Admin'));

router.post('/', validateRequest(createSubjectSchema), createSubject);
router.put('/:id', validateRequest(updateSubjectSchema), updateSubject);
router.delete('/:id', deleteSubject);
router.patch('/:id/status', toggleStatus);
router.patch('/:id/restore', restoreSubject);

export default router;
