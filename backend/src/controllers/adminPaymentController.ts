import { Request, Response, NextFunction } from 'express';
import Payment, { PaymentStatus } from '../models/Payment';
import Purchase from '../models/Purchase';
import catchAsync from '../utils/catchAsync';

// @desc    Get all payments for Admin
// @route   GET /api/admin/payments
// @access  Private (Super Admin)
export const getAllPayments = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;
  const status = req.query.status as string;

  let query: any = {};
  if (status) {
    query.status = status;
  }

  const payments = await Payment.find(query)
    .populate({
      path: 'user',
      select: 'fullName email',
    })
    .populate({
      path: 'mockTest',
      select: 'title',
    })
    .sort('-createdAt')
    .skip(skip)
    .limit(limit)
    .lean();

  const populatedPayments = await Promise.all(
    payments.map(async (payment: any) => {
      if (!payment.mockTest && payment.cart) {
        const purchases = await Purchase.find({ payment: payment._id }).populate('mockTest', 'title').lean();
        if (purchases.length > 0) {
          payment.mockTestTitles = purchases.map((p: any) => p.mockTest?.title).filter(Boolean).join(', ');
        }
      }
      return payment;
    })
  );

  const total = await Payment.countDocuments(query);

  res.status(200).json({
    success: true,
    data: {
      payments: populatedPayments,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// @desc    Get payment stats for Admin
// @route   GET /api/admin/payments/stats
// @access  Private (Super Admin)
export const getPaymentStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Aggregate total revenue for completed payments
  const revenueData = await Payment.aggregate([
    { $match: { status: PaymentStatus.SUCCESS } },
    { $group: { _id: null, totalRevenue: { $sum: '$amount' }, count: { $sum: 1 } } }
  ]);

  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;
  const totalSuccessCount = revenueData.length > 0 ? revenueData[0].count : 0;

  const totalPayments = await Payment.countDocuments();
  const pendingPayments = await Payment.countDocuments({ status: PaymentStatus.PENDING });
  const failedPayments = await Payment.countDocuments({ status: PaymentStatus.FAILED });

  res.status(200).json({
    success: true,
    data: {
      totalRevenue,
      totalSuccessCount,
      totalPayments,
      pendingPayments,
      failedPayments,
    },
  });
});
