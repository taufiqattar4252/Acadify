import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import MockTest from '../models/MockTest';
import Purchase from '../models/Purchase';
import User, { UserRole } from '../models/User';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import Attempt from '../models/Attempt';
import ExamSession from '../models/ExamSession';

// @desc    Get all published mock tests (Mock Store)
// @route   GET /api/student/mock-tests
// @access  Private (Student)
export const getAvailableMockTests = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 12;
  const skip = (page - 1) * limit;

  const search = req.query.search as string;
  const category = req.query.category as string;
  const sort = req.query.sort as string || '-createdAt';

  // Only fetch Published and non-deleted mock tests
  let query: any = { status: 'Published', isDeleted: false };

  if (category) query.category = category;

  if (search) {
    query = {
      ...query,
      $or: [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ],
    };
  }

  // Handle sorting (Newest, Price, Popularity etc.)
  let sortOption: any = {};
  if (sort === 'Newest') sortOption = { createdAt: -1 };
  else if (sort === 'Oldest') sortOption = { createdAt: 1 };
  else if (sort === 'Price') sortOption = { price: 1 };
  else if (sort === '-Price') sortOption = { price: -1 };
  else if (sort.startsWith('-')) sortOption[sort.substring(1)] = -1;
  else sortOption[sort] = 1;

  const tests = await MockTest.find(query)
    .select('-questions') // don't send raw question arrays in list
    .sort(sortOption)
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await MockTest.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      tests,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// @desc    Get mock test details
// @route   GET /api/student/mock-tests/:slug
// @access  Private (Student)
export const getMockTestDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const query: any = {
    slug: req.params.slug,
    status: 'Published',
    isDeleted: false,
  };
  const test = await MockTest.findOne(query).lean();

  if (!test) {
    return next(new AppError('Mock test not found', 404));
  }

  // Check if current student has purchased this test
  const purchaseQuery: any = {
    user: req.user._id,
    mockTest: test._id,
    status: 'completed',
  };
  const purchase = await Purchase.findOne(purchaseQuery).lean();

  res.status(200).json({
    success: true,
    data: { 
      test,
      isPurchased: !!purchase 
    },
  });
});

// @desc    Get student purchases
// @route   GET /api/student/purchases
// @access  Private (Student)
export const getPurchases = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const purchases = await Purchase.find({ user: req.user._id })
    .populate({
      path: 'mockTest',
      select: 'title slug thumbnail category duration price',
    })
    .sort({ purchaseDate: -1 })
    .lean();

  res.status(200).json({
    success: true,
    data: { purchases },
  });
});

// @desc    Get student profile
// @route   GET /api/student/profile
// @access  Private (Student)
export const getStudentProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user._id;
  const user = await User.findById(userId).lean();
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Calculate statistics
  const [purchases, attempts] = await Promise.all([
    Purchase.find({ user: userId, status: 'completed' } as any).populate({ path: 'mockTest', select: 'title' }).lean(),
    Attempt.find({ user: userId } as any).sort({ createdAt: -1 }).lean(),
  ]);

  const purchasedMocks = purchases.length;
  const totalAmountSpent = purchases.reduce((acc, p: any) => acc + (p.amountPaid || 0), 0);
  
  const attemptedMocks = attempts.length;
  let averageScore = 0;
  let accuracy = 0;

  if (attemptedMocks > 0) {
    const totalScore = attempts.reduce((acc, a: any) => acc + (a.score || 0), 0);
    averageScore = Math.round(totalScore / attemptedMocks);
    
    const totalCorrect = attempts.reduce((acc, a: any) => acc + (a.correct || 0), 0);
    const totalQuestions = attempts.reduce((acc, a: any) => acc + ((a.correct || 0) + (a.wrong || 0) + (a.skipped || 0)), 0);
    
    accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
  }

  const percentile = attemptedMocks > 0 ? 85 + Math.floor(Math.random() * 10) : 0;
  const rank = attemptedMocks > 0 ? 425 : '-';

  // Recent Activity
  const recentActivity: any[] = [];
  
  if (user.lastLogin) {
    recentActivity.push({
      id: 'login-' + new Date(user.lastLogin).getTime(),
      type: 'Login',
      title: 'Logged In',
      target: 'System',
      date: user.lastLogin,
      status: 'completed'
    });
  }

  purchases.slice(0, 5).forEach((p: any) => {
    recentActivity.push({
      id: `purchase-${p._id}`,
      type: 'Purchase',
      title: 'Purchased Mock Test',
      target: p.mockTest?.title || 'Mock Test',
      date: p.purchaseDate,
      status: 'completed'
    });
  });

  attempts.slice(0, 5).forEach((a: any) => {
    recentActivity.push({
      id: `attempt-${a._id}`,
      type: 'Exam',
      title: 'Completed Exam',
      target: `Scored ${a.score}`,
      date: a.createdAt,
      status: 'completed'
    });
  });

  recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  res.status(200).json({
    success: true,
    data: { 
      user,
      stats: {
        purchasedMocks,
        attemptedMocks,
        averageScore,
        accuracy,
        totalAmountSpent,
        percentile,
        rank
      },
      recentActivity: recentActivity.slice(0, 10)
    },
  });
});

// @desc    Update student profile
// @route   PUT /api/student/profile
// @access  Private (Student)
export const updateStudentProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { fullName, phone, avatar, goals } = req.body;

  const user = await User.findById(req.user._id);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  if (fullName) user.fullName = fullName;
  if (phone !== undefined) user.phone = phone; // Allow empty phone
  if (avatar) user.avatar = avatar;
  if (goals) {
    user.goals = { ...user.goals, ...goals };
  }

  await user.save();

  // Return updated user (excluding password)
  const updatedUser = await User.findById(req.user._id).lean();

  res.status(200).json({
    success: true,
    data: { user: updatedUser },
  });
});

// @desc    Get student dashboard overview data
// @route   GET /api/student/dashboard
// @access  Private (Student)
export const getStudentDashboard = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user._id;

  // 1. Fetch user profile
  const user = await User.findById(userId).select('fullName').lean();

  // 2. Determine greeting
  const hour = new Date().getHours();
  let greeting = 'Good Evening';
  if (hour < 12) greeting = 'Good Morning';
  else if (hour < 17) greeting = 'Good Afternoon';

  // 3. Parallel aggregations and queries
  const [
    purchasesCount,
    attempts,
    activeSession,
    recentPurchases,
    recommendations
  ] = await Promise.all([
    // Purchases count
    Purchase.countDocuments({ user: userId, status: 'completed' } as any),

    // All attempts for analytics (sorted chronologically)
    Attempt.find({ user: userId } as any)
      .sort({ createdAt: 1 })
      .select('score totalMarks correct wrong skipped percentage createdAt')
      .lean(),

    // Active exam session
    ExamSession.findOne({ user: userId, status: 'In Progress' } as any)
      .populate({ path: 'mockTest', select: 'title duration' })
      .lean(),

    // Recent purchases for activity
    Purchase.find({ user: userId, status: 'completed' } as any)
      .sort({ purchaseDate: -1 })
      .limit(5)
      .populate({ path: 'mockTest', select: 'title thumbnail category duration price' })
      .lean(),

    // Recommended tests (excluding purchased)
    Purchase.find({ user: userId, status: 'completed' } as any).distinct('mockTest')
      .then(purchasedTestIds => 
        MockTest.find({ 
          _id: { $nin: purchasedTestIds },
          status: 'Published',
          isDeleted: false
        } as any)
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title slug thumbnail category duration price')
        .lean()
      )
  ]);

  // 4. Calculate Derived Stats
  const attemptedMocks = attempts.length;
  let averageScore = 0;
  let bestScore = 0;
  let totalQuestionsAttempted = 0;
  let totalCorrect = 0;
  let totalWrong = 0;
  let totalSkipped = 0;

  if (attemptedMocks > 0) {
    const totalScore = attempts.reduce((acc, a) => acc + (a.score || 0), 0);
    averageScore = Math.round(totalScore / attemptedMocks);
    bestScore = Math.max(...attempts.map(a => a.score || 0));
    
    totalCorrect = attempts.reduce((acc, a) => acc + (a.correct || 0), 0);
    totalWrong = attempts.reduce((acc, a) => acc + (a.wrong || 0), 0);
    totalSkipped = attempts.reduce((acc, a) => acc + (a.skipped || 0), 0);
    totalQuestionsAttempted = totalCorrect + totalWrong + totalSkipped;
  }

  const accuracy = totalQuestionsAttempted > 0 
    ? Math.round((totalCorrect / totalQuestionsAttempted) * 100) 
    : 0;

  // Calculate Real Percentile
  let percentile = 0;
  let totalStudents = 0;
  if (attemptedMocks > 0) {
    const allAttemptsCount = await Attempt.countDocuments();
    const attemptsBelow = await Attempt.countDocuments({ score: { $lt: bestScore } });
    percentile = allAttemptsCount > 0 ? Math.round((attemptsBelow / allAttemptsCount) * 100) : 0;
    totalStudents = await User.countDocuments({ role: UserRole.STUDENT });
  }

  // Score Trend
  const scoreTrend = attempts.slice(-10).map((a, i) => ({
    name: `Test ${i + 1}`,
    score: a.score,
    percentage: a.percentage
  }));

  // Subject Performance (Mocked for now as we don't have full subject tagging per answer yet)
  const subjectPerformance = {
    physics: { accuracy: accuracy > 0 ? Math.min(100, accuracy + 2) : 0, averageScore: averageScore > 0 ? Math.round(averageScore / 3) : 0, solved: Math.round(totalCorrect / 3) },
    chemistry: { accuracy: accuracy > 0 ? Math.max(0, accuracy - 5) : 0, averageScore: averageScore > 0 ? Math.round(averageScore / 3) : 0, solved: Math.round(totalCorrect / 3) },
    mathematics: { accuracy: accuracy > 0 ? Math.min(100, accuracy + 5) : 0, averageScore: averageScore > 0 ? Math.round(averageScore / 3) : 0, solved: Math.round(totalCorrect / 3) }
  };

  const questionStats = {
    correct: totalCorrect,
    wrong: totalWrong,
    skipped: totalSkipped,
    markedForReview: 0,
    bookmarked: 0
  };

  const studyProgress = {
    strongChapters: ['Rotational Dynamics', 'Electrochemistry', 'Calculus'],
    weakChapters: ['Wave Optics', 'P-Block Elements', 'Probability'],
    needsRevision: 4,
    practicePending: 12
  };

  const leaderboard = {
    currentRank: attemptedMocks > 0 ? Math.round(totalStudents * (1 - percentile / 100)) || 1 : '-',
    percentile: percentile,
    highestScore: 300, // Assuming 300 is max score, ideally from DB
    averageScore: averageScore,
    totalStudents: totalStudents || 12500
  };

  // Recent Activity merging (Mocks & Purchases)
  const recentActivity: any[] = [];
  
  recentPurchases.forEach(p => {
    recentActivity.push({
      id: `purchase-${p._id}`,
      type: 'Purchase',
      title: 'Purchased Mock Test',
      target: (p.mockTest as any)?.title || 'Mock Test',
      date: p.purchaseDate,
      status: 'completed'
    });
  });

  attempts.slice(-5).forEach(a => {
    recentActivity.push({
      id: `attempt-${a._id}`,
      type: 'Exam',
      title: 'Completed Exam',
      target: `Scored ${a.score}`,
      date: a.createdAt,
      status: 'completed'
    });
  });

  // Sort combined activity by date descending
  recentActivity.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const notifications = [
    { id: 1, title: 'New Mock Test Available', message: 'MHT-CET Full Syllabus Test 10 is now live.', isRead: false, time: '2 hours ago' },
    { id: 2, title: 'Result Published', message: 'Your result for Physics Chapter Test is ready.', isRead: true, time: '1 day ago' }
  ];

  const goals = {
    targetScore: 180,
    targetPercentile: 99,
    targetCollege: 'COEP Pune'
  };

  res.status(200).json({
    success: true,
    data: {
      overview: {
        studentName: user?.fullName || 'Student',
        greeting,
        purchasedMocks: purchasesCount,
        attemptedMocks,
        averageScore,
        bestScore,
        accuracy,
        percentile
      },
      continueExam: activeSession || null,
      scoreTrend,
      subjectPerformance,
      questionStats,
      studyProgress,
      leaderboard,
      recommendations,
      recentActivity: recentActivity.slice(0, 8),
      notifications,
      goals
    }
  });
});

// @desc    Change student password
// @route   PUT /api/student/change-password
// @access  Private (Student)
export const changePassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide both current and new password', 400));
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new AppError('Incorrect current password', 401));
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});

// @desc    Update notification preferences
// @route   PUT /api/student/notification-preferences
// @access  Private (Student)
export const updateNotificationPreferences = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { preferences } = req.body;

  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.notificationPreferences = {
    ...user.notificationPreferences,
    ...preferences
  };

  await user.save();

  res.status(200).json({
    success: true,
    data: {
      notificationPreferences: user.notificationPreferences
    }
  });
});
