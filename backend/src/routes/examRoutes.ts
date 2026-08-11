import express from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { startExam, getExamSession, submitExam } from '../controllers/examController';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for exam submission and start
const examActionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // max 10 requests per minute
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply auth middleware to all student exam routes
router.use(requireAuth);

router.post('/start', examActionLimiter, startExam);
router.get('/session/:id', getExamSession);
router.post('/submit', examActionLimiter, submitExam);

export default router;
