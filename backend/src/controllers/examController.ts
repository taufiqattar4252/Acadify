import { Request, Response, NextFunction } from 'express';
import MockTest, { MockTestStatus } from '../models/MockTest';
import Purchase, { PurchaseStatus } from '../models/Purchase';
import ExamSession, { ExamSessionStatus } from '../models/ExamSession';
import Question, { IQuestion } from '../models/Question';
import Setting from '../models/Setting';
import AppError from '../utils/AppError';
import catchAsync from '../utils/catchAsync';

// Deterministic PRNG based on string seed
const getDeterministicSeed = (str: string) => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return h;
};

const seededRandom = (a: number) => {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
};

const shuffleArray = (array: any[], seedStr: string) => {
  const random = seededRandom(getDeterministicSeed(seedStr));
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

// Helper function to strip sensitive question data and optionally shuffle
const sanitizeQuestions = (
  questions: IQuestion[], 
  sessionId?: string, 
  shuffleQuestions: boolean = false, 
  shuffleOptions: boolean = false
) => {
  let sanitized = questions.map((q) => {
    // Strip correct answers from options
    let sanitizedOptions = q.options.map((opt) => ({
      _id: opt._id,
      text: opt.text,
      image: opt.image,
    }));

    if (shuffleOptions && sessionId) {
      sanitizedOptions = shuffleArray(sanitizedOptions, `${sessionId}_${q._id}`);
    }

    return {
      _id: q._id,
      questionType: q.questionType,
      questionText: q.questionText,
      questionImage: q.questionImage,
      options: sanitizedOptions,
      positiveMarks: q.positiveMarks,
      negativeMarks: q.negativeMarks,
    };
  });

  if (shuffleQuestions && sessionId) {
    sanitized = shuffleArray(sanitized, sessionId);
  }

  return sanitized;
};

// @desc    Start an exam session
// @route   POST /api/student/exam/start
// @access  Private (Student)
export const startExam = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { mockTestId } = req.body;

  if (!mockTestId) {
    return next(new AppError('Mock Test ID is required', 400));
  }

  // 1. Verify Mock exists and is published
  const mockTest = await MockTest.findOne({ _id: mockTestId, isDeleted: false } as any)
    .populate('questions'); // Populate to return later

  if (!mockTest) {
    return next(new AppError('Mock Test not found', 404));
  }

  if (mockTest.status !== MockTestStatus.PUBLISHED) {
    return next(new AppError('This mock test is not available yet', 400));
  }

  // 2. Verify Purchase (if not free)
  if (mockTest.price && mockTest.price > 0) {
    const purchase = await Purchase.findOne({
      user: req.user._id,
      mockTest: mockTest._id,
      status: PurchaseStatus.COMPLETED,
    });

    if (!purchase) {
      return next(new AppError('You must purchase this mock test to start the exam', 403));
    }
  }

  // Fetch global exam settings
  const settings = await Setting.findOne();
  const shuffleQuestions = settings?.exam?.shuffleQuestions ?? false;
  const shuffleOptions = settings?.exam?.shuffleOptions ?? false;

  // 3. Prevent multiple active sessions for the same user and mock test
  const existingActiveSession = await ExamSession.findOne({
    user: req.user._id,
    mockTest: mockTest._id,
    status: ExamSessionStatus.IN_PROGRESS,
  });

  if (existingActiveSession) {
    // Return existing session for refresh support and multiple session prevention
    const sanitizedQuestions = sanitizeQuestions(
      mockTest.questions, 
      existingActiveSession._id.toString(), 
      shuffleQuestions, 
      shuffleOptions
    );
    
    if ((req as any).log) {
      (req as any).log.info({
        event: 'exam.resumed',
        userId: req.user._id,
        examSessionId: existingActiveSession._id,
        mockTestId: mockTest._id
      }, 'Exam session resumed');
    }
    
    return res.status(200).json({
      success: true,
      data: {
        session: {
          _id: existingActiveSession._id,
          startedAt: existingActiveSession.startedAt,
          expiresAt: existingActiveSession.expiresAt,
          status: existingActiveSession.status,
        },
        duration: mockTest.duration,
        questions: sanitizedQuestions,
      },
    });
  }

  // 4. Create new Exam Session
  const durationMs = mockTest.duration * 60 * 1000;
  const startedAt = new Date();
  const expiresAt = new Date(startedAt.getTime() + durationMs);

  const newSession = new ExamSession({
    user: req.user._id,
    mockTest: mockTest._id,
    startedAt,
    expiresAt,
    status: ExamSessionStatus.IN_PROGRESS,
    ipAddress: req.ip || '',
    userAgent: req.headers['user-agent'] || '',
  });
  await newSession.save();

  if ((req as any).log) {
    (req as any).log.info({
      event: 'exam.started',
      userId: req.user._id,
      examSessionId: newSession._id,
      mockTestId: mockTest._id,
      duration: mockTest.duration
    }, 'Exam started');
  }

  // 5. Sanitize questions (Remove correct answers, explanations)
  const sanitizedQuestions = sanitizeQuestions(
    mockTest.questions, 
    newSession._id.toString(), 
    shuffleQuestions, 
    shuffleOptions
  );

  res.status(201).json({
    success: true,
    data: {
      session: {
        _id: newSession._id,
        startedAt: newSession.startedAt,
        expiresAt: newSession.expiresAt,
        status: newSession.status,
      },
      duration: mockTest.duration,
      questions: sanitizedQuestions,
    },
  });
});

// @desc    Get current active exam session and questions
// @route   GET /api/student/exam/session/:id
// @access  Private (Student)
export const getExamSession = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const sessionId = req.params.id;

  const session = await ExamSession.findOne({
    _id: sessionId,
    user: req.user._id, // Ensure student can only access their own session
  } as any).populate({
    path: 'mockTest',
    select: 'title duration questions status',
    populate: {
      path: 'questions',
    },
  });

  if (!session) {
    return next(new AppError('Exam session not found', 404));
  }

  // Determine time left
  const now = new Date();
  let timeLeft = Math.max(0, session.expiresAt.getTime() - now.getTime());
  
  if (timeLeft === 0 && session.status === ExamSessionStatus.IN_PROGRESS) {
    // If time is up, we should ideally mark it expired or submitted.
    // We will handle submission in a future task, but for now we update the status.
    session.status = ExamSessionStatus.EXPIRED;
    await session.save();
  }

  // Extract MockTest and questions safely
  const mockTest = session.mockTest as any; 
  
  if (mockTest.status !== MockTestStatus.PUBLISHED) {
    return next(new AppError('This mock test is no longer available', 400));
  }

  // Fetch global exam settings
  const settings = await Setting.findOne();
  const shuffleQuestions = settings?.exam?.shuffleQuestions ?? false;
  const shuffleOptions = settings?.exam?.shuffleOptions ?? false;

  const sanitizedQuestions = sanitizeQuestions(mockTest.questions, session._id.toString(), shuffleQuestions, shuffleOptions);

  res.status(200).json({
    success: true,
    data: {
      session: {
        _id: session._id,
        startedAt: session.startedAt,
        expiresAt: session.expiresAt,
        status: session.status,
        timeLeft, // In milliseconds
      },
      duration: mockTest.duration,
      questions: sanitizedQuestions,
    },
  });
});

// @desc    Submit an exam session
// @route   POST /api/student/exam/submit
// @access  Private (Student)
export const submitExam = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { sessionId, answers } = req.body;

  if (!sessionId) {
    return next(new AppError('Session ID is required', 400));
  }

  // 1. Fetch Session and Verify
  const session = await ExamSession.findOne({
    _id: sessionId,
    user: req.user._id,
  }).populate('mockTest');

  if (!session) {
    return next(new AppError('Exam session not found or unauthorized', 404));
  }

  if (session.status === ExamSessionStatus.SUBMITTED) {
    return next(new AppError('This exam session has already been submitted', 400));
  }

  const mockTest = session.mockTest as any;

  // 2. Fetch all questions from the database in a secure, fast manner
  // Use lean() for performance since we just need data, not Mongoose methods
  const dbQuestions = await Question.find({
    _id: { $in: mockTest.questions }
  }).lean();

  if (!dbQuestions || dbQuestions.length === 0) {
    return next(new AppError('No questions found for this exam', 400));
  }

  // 3. Scoring Engine
  let score = 0;
  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  
  let maxScore = 0;
  
  const attemptAnswers = [];

  // Iterate over database questions (the absolute source of truth)
  for (const q of dbQuestions) {
    maxScore += q.positiveMarks;

    const studentAnswerId = answers ? answers[q._id.toString()] : undefined;
    
    // Find the correct option ID
    const correctOption = q.options.find(opt => opt.isCorrect);
    const correctOptionId = correctOption && correctOption._id ? correctOption._id.toString() : null;

    if (!studentAnswerId) {
      // Skipped
      skipped++;
      attemptAnswers.push({
        questionId: q._id,
        selectedOptionId: null,
      });
    } else {
      if (studentAnswerId === correctOptionId) {
        // Correct
        correct++;
        score += q.positiveMarks;
      } else {
        // Wrong
        wrong++;
        score -= q.negativeMarks;
      }
      attemptAnswers.push({
        questionId: q._id,
        selectedOptionId: studentAnswerId,
      });
    }
  }

  // Calculate percentages
  const accuracy = (correct + wrong) > 0 ? (correct / (correct + wrong)) * 100 : 0;
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;

  // Calculate duration taken and validate Expiry with a 2-minute grace period
  const now = new Date();
  const startedAt = session.startedAt;
  const expiresAt = session.expiresAt;
  
  const gracePeriodMs = 2 * 60 * 1000; // 2 minutes
  if (now.getTime() > expiresAt.getTime() + gracePeriodMs) {
    if ((req as any).log) {
      (req as any).log.warn({
        event: 'exam.submit.failed',
        userId: req.user._id,
        examSessionId: sessionId,
        reason: 'expired'
      }, 'Submission failed (Expired)');
    }
    return next(new AppError('This exam session has expired and can no longer be submitted.', 403));
  }
  
  // Prevent time manipulation if submitted slightly after expiry
  const actualTimeMs = now.getTime() - startedAt.getTime();
  const maxTimeMs = mockTest.duration * 60 * 1000;
  const timeTakenMs = Math.min(actualTimeMs, maxTimeMs);
  const timeTakenSec = Math.floor(timeTakenMs / 1000);

  // 4. Create Attempt record
  const mongoose = require('mongoose');
  const Attempt = require('../models/Attempt').default;

  const newAttempt = new Attempt({
    user: req.user._id,
    mockTest: mockTest._id,
    startedAt: session.startedAt,
    submittedAt: now,
    duration: timeTakenSec,
    answers: attemptAnswers,
    score,
    correct,
    wrong,
    skipped,
    percentage: Math.max(0, percentage), // Avoid negative percentage if score is negative
    ipAddress: req.ip || '',
    userAgent: req.headers['user-agent'] || '',
  });

  await newAttempt.save();

  // 5. Update Session Status
  session.status = ExamSessionStatus.SUBMITTED;
  await session.save();
  
  if ((req as any).log) {
    (req as any).log.info({
      event: 'exam.submitted',
      userId: req.user._id,
      examSessionId: session._id,
      mockTestId: mockTest._id,
      attemptId: newAttempt._id,
      timeTaken: timeTakenSec
    }, 'Exam submitted');
  }

  // 6. Return Result Summary
  res.status(200).json({
    success: true,
    data: {
      attemptId: newAttempt._id,
      score,
      correct,
      wrong,
      skipped,
      percentage: Math.max(0, percentage),
      accuracy,
      timeTaken: timeTakenSec
    },
  });
});

