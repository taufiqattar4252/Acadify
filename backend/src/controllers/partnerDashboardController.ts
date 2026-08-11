import { Request, Response, NextFunction } from 'express';
import Partner from '../models/Partner';
import Coupon from '../models/Coupon';
import Commission from '../models/Commission';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';

// Get partner dashboard summary
export const getDashboardSummary = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const partnerId = req.user._id;

  const partner = await Partner.findById(partnerId).select('-password');
  if (!partner) {
    return next(new AppError('Partner not found', 404));
  }

  // Get active coupon code (assuming one main coupon for the dashboard display)
  const coupons = await Coupon.find({ partner: partnerId, isActive: true });
  const primaryCoupon = coupons.length > 0 ? coupons[0]?.code : 'No Active Coupon';

  // Calculate monthly earnings
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyCommissions = await Commission.find({
    partner: partnerId,
    createdAt: { $gte: startOfMonth }
  });
  
  const monthlyEarnings = monthlyCommissions.reduce((acc, curr) => acc + curr.commissionAmount, 0);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        couponCode: primaryCoupon,
        studentsReferred: partner.studentsReferred,
        revenueGenerated: partner.revenueGenerated,
        commissionEarned: partner.commissionEarned,
        pendingCommission: partner.commissionEarned - partner.commissionPaid,
        paidCommission: partner.commissionPaid,
        monthlyEarnings
      }
    }
  });
});

// Get partner profile
export const getProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const partnerId = req.user._id;
  const partner = await Partner.findById(partnerId).select('-password');

  res.status(200).json({
    status: 'success',
    data: {
      partner
    }
  });
});

// Update partner profile
export const updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const partnerId = req.user._id;
  const { fullName, phone, password } = req.body;

  const partner = await Partner.findById(partnerId);
  if (!partner) {
    return next(new AppError('Partner not found', 404));
  }

  if (fullName) partner.fullName = fullName;
  if (phone) partner.phone = phone;
  if (password) partner.password = password; // pre-save hook handles hashing

  await partner.save();

  const partnerObj = partner.toObject();
  delete partnerObj.password;

  res.status(200).json({
    status: 'success',
    data: {
      partner: partnerObj
    }
  });
});

// Get partner commissions
export const getCommissions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const partnerId = req.user._id;

  const commissions = await Commission.find({ partner: partnerId })
    .populate('purchase', 'purchaseDate')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    data: {
      commissions
    }
  });
});

// Get partner purchases
export const getPurchases = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const partnerId = req.user._id;

  const commissions = await Commission.find({ partner: partnerId })
    .populate('student', 'fullName')
    .populate('mockTest', 'title')
    .sort('-createdAt');

  const purchases = commissions.map(c => ({
    _id: c.purchase,
    studentName: (c.student as any)?.fullName || 'Unknown Student',
    mockPurchased: (c.mockTest as any)?.title || 'Unknown Test',
    purchaseAmount: c.saleAmount,
    couponUsed: c.couponUsed,
    commission: c.commissionAmount,
    date: c.createdAt
  }));

  res.status(200).json({
    status: 'success',
    data: {
      purchases
    }
  });
});
