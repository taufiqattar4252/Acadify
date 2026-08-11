import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
// removed morgan
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import AppError from './utils/AppError';
import globalErrorHandler from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import subjectRoutes from './routes/subjectRoutes';
import chapterRoutes from './routes/chapterRoutes';
import uploadRoutes from './routes/uploadRoutes';
import questionRoutes from './routes/questionRoutes';
import mockTestRoutes from './routes/mockTestRoutes';

import studentRoutes from './routes/studentRoutes';
import paymentRoutes from './routes/paymentRoutes';
import adminPaymentRoutes from './routes/adminPaymentRoutes';
import examRoutes from './routes/examRoutes';
import resultRoutes from './routes/resultRoutes';
import studentNotificationRoutes from './routes/studentNotificationRoutes';
import adminNotificationRoutes from './routes/adminNotificationRoutes';
import adminSettingsRoutes from './routes/adminSettingsRoutes';
import adminPurchaseRoutes from './routes/adminPurchaseRoutes';
import adminStudentRoutes from './routes/adminStudentRoutes';
import adminPartnerRoutes from './routes/adminPartnerRoutes';
import partnerRoutes from './routes/partnerRoutes';

import requestLogger from './middleware/requestLogger';

const app = express();

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());

// Structured logging
app.use(requestLogger);

// Implement CORS (Must be before rate limiter so 429 responses get CORS headers)
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000', 'http://localhost:3001'];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Check if the origin is explicitly allowed or if it's a Vercel preview URL
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Limit requests from same API
const limiter = rateLimit({
  max: 1000,
  windowMs: 15 * 60 * 1000, // 15 minutes
  message: 'Too many requests from this IP, please try again later!'
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Compress all responses
app.use(compression());



// 2) ROUTES
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'API is running smoothly' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/admin/subjects', subjectRoutes);
app.use('/api/admin/chapters', chapterRoutes);
app.use('/api/admin/upload', uploadRoutes);
app.use('/api/admin/questions', questionRoutes);
app.use('/api/admin/mock-tests', mockTestRoutes);
app.use('/api/admin/payments', adminPaymentRoutes);
app.use('/api/admin/notifications', adminNotificationRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/purchases', adminPurchaseRoutes);
app.use('/api/admin/students', adminStudentRoutes);
app.use('/api/admin/partners', adminPartnerRoutes);
app.use('/api/student/exam', examRoutes);
app.use('/api/student/notifications', studentNotificationRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/partner', partnerRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api', resultRoutes);

app.use((req, res, next) => {
  if (req.log) {
    req.log.warn({ event: 'http.route.not_found' }, `Route not found: ${req.method} ${req.originalUrl}`);
  }
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
