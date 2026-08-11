import express from 'express';
import multer from 'multer';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import { createQuestionSchema, updateQuestionSchema } from '../validators/questionValidator';
import {
  getAllQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  restoreQuestion,
  toggleStatus,
  duplicateQuestion,
  importQuestions,
  exportQuestions
} from '../controllers/questionController';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Export doesn't modify data, so it can be GET
router.get('/export', requireAuth, requireRole('Super Admin', 'Content Admin', 'Support Admin'), exportQuestions);

// GET routes (accessible by Support Admin as well)
router.get('/', requireAuth, requireRole('Super Admin', 'Content Admin', 'Support Admin'), getAllQuestions);
router.get('/:id', requireAuth, requireRole('Super Admin', 'Content Admin', 'Support Admin'), getQuestion);

// All routes below this point modify data
router.use(requireAuth, requireRole('Super Admin', 'Content Admin'));

router.post('/', validateRequest(createQuestionSchema), createQuestion);
router.post('/import', upload.single('file'), importQuestions);
router.post('/duplicate/:id', duplicateQuestion);

router.put('/:id', validateRequest(updateQuestionSchema), updateQuestion);
router.patch('/:id/status', toggleStatus);
router.patch('/:id/restore', restoreQuestion);
router.delete('/:id', deleteQuestion);

export default router;
