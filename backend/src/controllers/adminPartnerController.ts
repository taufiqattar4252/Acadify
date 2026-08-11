import { Request, Response, NextFunction } from 'express';
import Partner from '../models/Partner';
import Coupon, { DiscountType } from '../models/Coupon';
import Commission, { CommissionStatus } from '../models/Commission';
import Purchase, { PurchaseStatus } from '../models/Purchase';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';

// --------------------------------------------------------------------------
// PARTNER MANAGEMENT (CRUD)
// --------------------------------------------------------------------------

// Get all partners with stats
export const getAllPartners = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const partners = await Partner.find().select('-password').sort('-createdAt');
  
  // Calculate aggregated stats for overview cards
  const totalPartners = partners.length;
  const activePartners = partners.filter(p => p.status).length;
  const inactivePartners = totalPartners - activePartners;
  
  const totalRevenue = partners.reduce((acc, curr) => acc + curr.revenueGenerated, 0);
  const pendingCommission = partners.reduce((acc, curr) => acc + (curr.commissionEarned - curr.commissionPaid), 0);
  const paidCommission = partners.reduce((acc, curr) => acc + curr.commissionPaid, 0);

  res.status(200).json({
    status: 'success',
    data: {
      stats: {
        totalPartners,
        activePartners,
        inactivePartners,
        totalRevenue,
        pendingCommission,
        paidCommission
      },
      partners
    }
  });
});

// Get single partner with coupon details
export const getPartner = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const partner = await Partner.findById(req.params.id).select('-password');
  
  if (!partner) {
    return next(new AppError('No partner found with that ID', 404));
  }

  const coupons = await Coupon.find({ partner: partner._id });

  res.status(200).json({
    status: 'success',
    data: {
      partner,
      coupons
    }
  });
});

// Create partner
export const createPartner = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { fullName, email, phone, password, status, commissionType, commissionValue } = req.body;

  const existingPartner = await Partner.findOne({ $or: [{ email }, { phone }] });
  if (existingPartner) {
    return next(new AppError('Email or Phone already in use by another partner', 400));
  }

  const newPartner = await Partner.create({
    fullName,
    email,
    phone,
    password,
    status: status !== undefined ? status : true,
    commissionType,
    commissionValue
  });

  const partnerObj = newPartner.toObject();
  delete partnerObj.password;

  res.status(201).json({
    status: 'success',
    data: {
      partner: partnerObj
    }
  });
});

// Update partner
export const updatePartner = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { fullName, email, phone, status, commissionType, commissionValue } = req.body;
  const partner = await Partner.findById(req.params.id);

  if (!partner) {
    return next(new AppError('No partner found with that ID', 404));
  }

  if (email && email !== partner.email) {
    const existing = await Partner.findOne({ email });
    if (existing) return next(new AppError('Email already in use', 400));
    partner.email = email;
  }
  
  if (phone && phone !== partner.phone) {
    const existing = await Partner.findOne({ phone });
    if (existing) return next(new AppError('Phone already in use', 400));
    partner.phone = phone;
  }

  if (fullName) partner.fullName = fullName;
  if (status !== undefined) partner.status = status;
  if (commissionType) partner.commissionType = commissionType;
  if (commissionValue !== undefined) partner.commissionValue = commissionValue;

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

export const updatePartnerStatus = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { status } = req.body;
  const partner = await Partner.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true }).select('-password');

  if (!partner) {
    return next(new AppError('No partner found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      partner
    }
  });
});

// Delete partner
export const deletePartner = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const partner = await Partner.findByIdAndDelete(req.params.id);

  if (!partner) {
    return next(new AppError('No partner found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// --------------------------------------------------------------------------
// COUPON GENERATION
// --------------------------------------------------------------------------

export const generateCoupon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { code, discountType, discountValue, expiryDate, minOrderValue, maxDiscount } = req.body;
  const partnerId = req.params.id;

  const partner = await Partner.findById(partnerId);
  if (!partner) {
    return next(new AppError('Partner not found', 404));
  }

  const existingCoupon = await Coupon.findOne({ code });
  if (existingCoupon) {
    return next(new AppError('Coupon code already exists', 400));
  }

  const newCoupon = await Coupon.create({
    code,
    discountType,
    discountValue,
    expiryDate,
    minOrderValue: minOrderValue || 0,
    maxDiscount,
    partner: partner._id,
    isActive: true
  });

  res.status(201).json({
    status: 'success',
    data: {
      coupon: newCoupon
    }
  });
});

// --------------------------------------------------------------------------
// COMMISSIONS & PURCHASES
// --------------------------------------------------------------------------

export const getPartnerCommissions = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const commissions = await Commission.find({ partner: req.params.id })
    .populate('student', 'fullName email')
    .populate('mockTest', 'title')
    .sort('-createdAt');

  res.status(200).json({
    status: 'success',
    data: {
      commissions
    }
  });
});

export const getPartnerPurchases = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const commissions = await Commission.find({ partner: req.params.id })
    .populate('student', 'fullName email')
    .populate('mockTest', 'title')
    .sort('-createdAt');
    
  // Format to look like purchase history for the partner
  const purchases = commissions.map(c => ({
    _id: c.purchase,
    student: c.student,
    mockTest: c.mockTest,
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

// Change Commission details on the Partner directly
export const changePartnerCommission = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { commissionType, commissionValue } = req.body;
  
  if(commissionType === 'percentage' && commissionValue > 100) {
      return next(new AppError('Commission cannot exceed 100%', 400));
  }
  
  const partner = await Partner.findByIdAndUpdate(
    req.params.id, 
    { commissionType, commissionValue }, 
    { new: true, runValidators: true }
  ).select('-password');

  if (!partner) {
    return next(new AppError('Partner not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      partner
    }
  });
});

// Mark commission as paid
export const payCommission = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const commission = await Commission.findById(req.params.commissionId);

  if (!commission) {
    return next(new AppError('Commission not found', 404));
  }

  if (commission.status === CommissionStatus.PAID) {
    return next(new AppError('Commission already paid', 400));
  }

  commission.status = CommissionStatus.PAID;
  commission.paidAt = new Date();
  await commission.save();

  // Update partner totals
  const partner = await Partner.findById(commission.partner);
  if (partner) {
    partner.commissionPaid += commission.commissionAmount;
    await partner.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      commission
    }
  });
});
