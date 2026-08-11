import express from 'express';
import { 
  getStudents, 
  getStudentStats, 
  getStudentDetails, 
  toggleBlockStatus, 
  resetStudentPassword, 
  grantMockTest 
} from '../controllers/adminStudentController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = express.Router();

router.use(requireAuth);

// All routes require at least Support Admin except for potentially read-only (Content Admin)
// In a real app, you might have specific roles like 'Super Admin', 'Support Admin', 'Content Admin'.
// Since we don't have the exact exact enum available right now, we will assume roles are strings.

// Read-only routes (Support, Super, Content)
router.get('/', getStudents);
router.get('/stats', getStudentStats);
router.get('/:id', getStudentDetails);

// Modify routes (Support, Super)
// Since 'requireRole' typically checks if user has one of the roles:
router.patch('/:id/block', requireRole('Super Admin', 'Support Admin'), toggleBlockStatus);
router.patch('/:id/unblock', requireRole('Super Admin', 'Support Admin'), toggleBlockStatus);
router.patch('/:id/reset-password', requireRole('Super Admin', 'Support Admin'), resetStudentPassword);
router.post('/:id/grant-mock', requireRole('Super Admin', 'Support Admin'), grantMockTest);

// Notice: 'export' endpoint can just reuse the GET / logic with limit=1000 or similar
// Or you could add an explicit router.get('/export', exportStudents)

export default router;
