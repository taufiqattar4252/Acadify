import express from 'express';
import {
  getAllChapters,
  getChapter,
  createChapter,
  updateChapter,
  deleteChapter,
  toggleStatus,
  restoreChapter
} from '../controllers/chapterController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { createChapterSchema, updateChapterSchema } from '../validators/chapterValidator';

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// GET routes are accessible by all admins (Super, Content, Support)
router.get('/', getAllChapters);
router.get('/:id', getChapter);

// Modifying routes require Super Admin or Content Admin
router.use(requireRole('Super Admin', 'Content Admin'));

router.post('/', validateRequest(createChapterSchema), createChapter);
router.put('/:id', validateRequest(updateChapterSchema), updateChapter);
router.delete('/:id', deleteChapter);
router.patch('/:id/status', toggleStatus);
router.patch('/:id/restore', restoreChapter);

export default router;
