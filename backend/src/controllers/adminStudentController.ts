import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Purchase, { PurchaseStatus } from '../models/Purchase';
import MockTest from '../models/MockTest';
import Attempt from '../models/Attempt';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';

// ----------------------------------------------------------------------
// GET ALL STUDENTS (With Aggregation, Pagination, Search, Filter)
// ----------------------------------------------------------------------
export const getStudents = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const { search, status, purchased } = req.query;

  // Base Match Query
  const matchQuery: any = { role: 'student' };

  if (search) {
    const searchRegex = new RegExp(search as string, 'i');
    matchQuery.$or = [
      { fullName: searchRegex },
      { email: searchRegex },
      { phone: searchRegex }
    ];
  }

  if (status === 'active') {
    matchQuery.isActive = true;
  } else if (status === 'blocked') {
    matchQuery.isActive = false;
  }

  // Pipeline for aggregation
  const pipeline: any[] = [
    { $match: matchQuery },
    
    // Lookup Purchases
    {
      $lookup: {
        from: 'purchases',
        localField: '_id',
        foreignField: 'user',
        as: 'purchases',
      }
    },
    
    // Lookup Attempts
    {
      $lookup: {
        from: 'attempts',
        localField: '_id',
        foreignField: 'user',
        as: 'attempts',
      }
    },

    // Add Computed Fields
    {
      $addFields: {
        purchasedMockTests: {
          $size: {
            $filter: {
              input: '$purchases',
              as: 'p',
              cond: { $eq: ['$$p.status', 'completed'] }
            }
          }
        },
        totalAmountSpent: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$purchases',
                  as: 'p',
                  cond: { $eq: ['$$p.status', 'completed'] }
                }
              },
              as: 'p',
              in: '$$p.amountPaid'
            }
          }
        },
        examsAttempted: { $size: '$attempts' },
        averageScore: {
          $cond: {
            if: { $gt: [{ $size: '$attempts' }, 0] },
            then: { $avg: '$attempts.score' },
            else: 0
          }
        },
        totalCorrect: { $sum: '$attempts.correct' },
        totalWrong: { $sum: '$attempts.wrong' },
      }
    },

    // Add Accuracy
    {
      $addFields: {
        totalQuestionsAttempted: { $add: ['$totalCorrect', '$totalWrong'] },
      }
    },
    {
      $addFields: {
        accuracy: {
          $cond: {
            if: { $gt: ['$totalQuestionsAttempted', 0] },
            then: { $multiply: [{ $divide: ['$totalCorrect', '$totalQuestionsAttempted'] }, 100] },
            else: 0
          }
        }
      }
    }
  ];

  // Post-aggregation match for purchased filter
  if (purchased === 'true') {
    pipeline.push({ $match: { purchasedMockTests: { $gt: 0 } } });
  } else if (purchased === 'false') {
    pipeline.push({ $match: { purchasedMockTests: 0 } });
  }

  // Sorting
  const sortBy = (req.query.sortBy as string) || 'createdAt';
  const sortOrder = (req.query.sortOrder as string) === 'asc' ? 1 : -1;
  pipeline.push({ $sort: { [sortBy]: sortOrder } });

  // Facet for pagination and total count
  pipeline.push({
    $facet: {
      metadata: [{ $count: 'total' }],
      data: [{ $skip: skip }, { $limit: limit }, { $project: { password: 0, purchases: 0, attempts: 0 } }]
    }
  });

  const result = await User.aggregate(pipeline);

  const total = result[0].metadata[0]?.total || 0;
  const students = result[0].data;

  res.status(200).json({
    status: 'success',
    data: {
      students,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      }
    }
  });
});

// ----------------------------------------------------------------------
// GET OVERVIEW STATS
// ----------------------------------------------------------------------
export const getStudentStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalStudents,
    activeStudents,
    inactiveStudents,
    newRegistrations,
    premiumStudents,
    accuracyStats
  ] = await Promise.all([
    User.countDocuments({ role: 'student' as any }),
    User.countDocuments({ role: 'student' as any, isActive: true }),
    User.countDocuments({ role: 'student' as any, isActive: false }),
    User.countDocuments({ role: 'student' as any, createdAt: { $gte: today } }),
    Purchase.distinct('user', { status: 'completed' as any }).then(users => users.length),
    Attempt.aggregate([
      {
        $group: {
          _id: null,
          totalCorrect: { $sum: '$correct' },
          totalWrong: { $sum: '$wrong' }
        }
      }
    ])
  ]);

  let avgAccuracy = 0;
  if (accuracyStats.length > 0) {
    const totalAttempted = accuracyStats[0].totalCorrect + accuracyStats[0].totalWrong;
    if (totalAttempted > 0) {
      avgAccuracy = (accuracyStats[0].totalCorrect / totalAttempted) * 100;
    }
  }

  res.status(200).json({
    status: 'success',
    data: {
      totalStudents,
      activeStudents,
      inactiveStudents,
      newRegistrations,
      premiumStudents,
      avgAccuracy: Math.round(avgAccuracy * 100) / 100
    }
  });
});

// ----------------------------------------------------------------------
// GET STUDENT DETAILS
// ----------------------------------------------------------------------
export const getStudentDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const studentId = req.params.id;

  const student = await User.findById(studentId).select('-password');
  if (!student || student.role !== 'student') {
    return next(new AppError('Student not found', 404));
  }

  // Purchases
  const purchases = await Purchase.find({ user: studentId as any })
    .populate('mockTest', 'title slug thumbnail category price')
    .sort('-purchaseDate');

  // Attempts
  const attempts = await Attempt.find({ user: studentId as any })
    .populate('mockTest', 'title')
    .sort('-startedAt');

  // Basic Stats Calculation
  const successfulPurchases = purchases.filter(p => p.status === 'completed');
  const totalAmountSpent = successfulPurchases.reduce((acc, curr) => acc + curr.amountPaid, 0);
  
  const completedAttempts = attempts.filter(a => !!a.submittedAt);
  const totalCorrect = completedAttempts.reduce((acc, curr) => acc + curr.correct, 0);
  const totalWrong = completedAttempts.reduce((acc, curr) => acc + curr.wrong, 0);
  const totalAttempted = totalCorrect + totalWrong;
  const accuracy = totalAttempted > 0 ? (totalCorrect / totalAttempted) * 100 : 0;
  const bestScore = completedAttempts.length > 0 ? Math.max(...completedAttempts.map(a => a.score)) : 0;
  const averageScore = completedAttempts.length > 0 ? completedAttempts.reduce((acc, curr) => acc + curr.score, 0) / completedAttempts.length : 0;

  res.status(200).json({
    status: 'success',
    data: {
      student,
      stats: {
        totalPurchases: successfulPurchases.length,
        totalAmountSpent,
        examsAttempted: attempts.length,
        examsCompleted: completedAttempts.length,
        accuracy,
        bestScore,
        averageScore,
        totalQuestionsAttempted: totalAttempted
      },
      purchases,
      attempts
    }
  });
});

// ----------------------------------------------------------------------
// TOGGLE BLOCK/UNBLOCK
// ----------------------------------------------------------------------
export const toggleBlockStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const student = await User.findById(req.params.id);
  
  if (!student || student.role !== 'student') {
    return next(new AppError('Student not found', 404));
  }

  student.isActive = !student.isActive;
  await student.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 'success',
    message: student.isActive ? 'Student unblocked successfully' : 'Student blocked successfully',
    data: student
  });
});

// ----------------------------------------------------------------------
// RESET PASSWORD
// ----------------------------------------------------------------------
export const resetStudentPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { newPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    return next(new AppError('Please provide a new password with at least 8 characters', 400));
  }

  const student = await User.findById(req.params.id);
  if (!student || student.role !== 'student') {
    return next(new AppError('Student not found', 404));
  }

  student.password = newPassword;
  await student.save();

  res.status(200).json({
    status: 'success',
    message: 'Password reset successfully'
  });
});

// ----------------------------------------------------------------------
// GRANT FREE MOCK TEST
// ----------------------------------------------------------------------
export const grantMockTest = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { mockTestId } = req.body;
  const studentId = req.params.id;

  if (!mockTestId) {
    return next(new AppError('Please provide a mock test ID', 400));
  }

  const mockTest = await (MockTest as any).findById(mockTestId);
  if (!mockTest) {
    return next(new AppError('Mock test not found', 404));
  }

  // Check if already purchased
  const existingPurchase = await Purchase.findOne({ user: studentId as any, mockTest: mockTestId as any, status: PurchaseStatus.COMPLETED });
  if (existingPurchase) {
    return next(new AppError('Student already has access to this mock test', 400));
  }

  // Create Purchase record
  const purchase = await Purchase.create({
    user: studentId,
    mockTest: mockTestId,
    amountPaid: 0,
    status: PurchaseStatus.COMPLETED,
    purchaseDate: new Date()
  } as any);

  res.status(201).json({
    status: 'success',
    message: 'Mock test access granted successfully',
    data: purchase
  });
});
