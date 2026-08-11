import { Request, Response, NextFunction } from 'express';
import Purchase, { PurchaseStatus } from '../models/Purchase';
import Payment, { PaymentStatus } from '../models/Payment';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import sendEmail from '../services/emailService';
import mongoose from 'mongoose';
import * as xlsx from 'xlsx';

// 1) GET ALL PURCHASES WITH PAGINATION, SORTING, SEARCH, FILTERS
export const getAllPurchases = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Filters
  const search = req.query.search as string;
  const category = req.query.category as string;
  const paymentStatus = req.query.paymentStatus as string;
  const paymentMethod = req.query.paymentMethod as string;
  
  // Date range
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  
  // Amount range
  const minAmount = req.query.minAmount ? parseFloat(req.query.minAmount as string) : undefined;
  const maxAmount = req.query.maxAmount ? parseFloat(req.query.maxAmount as string) : undefined;

  const matchStage: any = {};

  if (category) {
    matchStage['mockTest.category'] = category;
  }
  
  if (paymentStatus) {
    matchStage['payment.status'] = paymentStatus;
  }
  
  if (paymentMethod) {
    matchStage['payment.paymentGateway'] = paymentMethod;
  }

  if (startDate || endDate) {
    matchStage.purchaseDate = {};
    if (startDate) matchStage.purchaseDate.$gte = new Date(startDate);
    if (endDate) matchStage.purchaseDate.$lte = new Date(endDate);
  }

  if (minAmount !== undefined || maxAmount !== undefined) {
    matchStage.amountPaid = {};
    if (minAmount !== undefined) matchStage.amountPaid.$gte = minAmount;
    if (maxAmount !== undefined) matchStage.amountPaid.$lte = maxAmount;
  }

  const pipeline: any[] = [
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'mocktests',
        localField: 'mockTest',
        foreignField: '_id',
        as: 'mockTest'
      }
    },
    { $unwind: { path: '$mockTest', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'payments',
        localField: 'payment',
        foreignField: '_id',
        as: 'payment'
      }
    },
    { $unwind: { path: '$payment', preserveNullAndEmptyArrays: true } }
  ];

  // Apply search
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    pipeline.push({
      $match: {
        $or: [
          { 'user.fullName': searchRegex },
          { 'user.email': searchRegex },
          { 'mockTest.title': searchRegex },
          { _id: mongoose.Types.ObjectId.isValid(search) ? new mongoose.Types.ObjectId(search) : null }
        ]
      }
    });
  }

  // Apply filters
  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  // Sorting
  const sortBy = req.query.sortBy as string || 'purchaseDate';
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  const sortStage: any = { [sortBy]: sortOrder };

  // Count total documents for pagination
  const countPipeline = [...pipeline, { $count: 'total' }];
  const totalCount = await Purchase.aggregate(countPipeline);
  const total = totalCount.length > 0 ? totalCount[0].total : 0;

  // Pagination
  pipeline.push({ $sort: sortStage });
  pipeline.push({ $skip: skip });
  pipeline.push({ $limit: limit });

  const purchases = await Purchase.aggregate(pipeline);

  res.status(200).json({
    success: true,
    data: {
      purchases,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    }
  });
});

// 2) GET SINGLE PURCHASE DETAILS
export const getPurchaseDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const purchase = await Purchase.findById(req.params.id)
    .populate('user', 'fullName email phone avatar')
    .populate('mockTest', 'title category price discount')
    .populate('payment');

  if (!purchase) {
    return next(new AppError('No purchase found with that ID', 404));
  }

  res.status(200).json({
    success: true,
    data: purchase
  });
});

// 3) GRANT ACCESS
export const grantAccess = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const purchase = await Purchase.findById(req.params.id);
  if (!purchase) return next(new AppError('No purchase found with that ID', 404));

  purchase.status = PurchaseStatus.COMPLETED;
  await purchase.save();

  res.status(200).json({
    success: true,
    message: 'Access granted successfully',
    data: purchase
  });
});

// 4) REVOKE ACCESS
export const revokeAccess = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const purchase = await Purchase.findById(req.params.id);
  if (!purchase) return next(new AppError('No purchase found with that ID', 404));

  purchase.status = PurchaseStatus.REVOKED;
  await purchase.save();

  res.status(200).json({
    success: true,
    message: 'Access revoked successfully',
    data: purchase
  });
});

// 5) REFUND PURCHASE
export const refundPurchase = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const purchase = await Purchase.findById(req.params.id).populate('payment');
  if (!purchase) return next(new AppError('No purchase found with that ID', 404));

  // Update payment status if exists
  if (purchase.payment) {
    const paymentId = (purchase.payment as any)._id;
    await Payment.findByIdAndUpdate(paymentId, { status: PaymentStatus.REFUNDED });
  }

  purchase.status = PurchaseStatus.REFUNDED;
  await purchase.save();

  res.status(200).json({
    success: true,
    message: 'Purchase refunded successfully',
    data: purchase
  });
});

// 6) RESEND EMAIL
export const resendPurchaseEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const purchase = await Purchase.findById(req.params.id)
    .populate('user')
    .populate('mockTest');
    
  if (!purchase) return next(new AppError('No purchase found with that ID', 404));

  const user = purchase.user as any;
  const mockTest = purchase.mockTest as any;

  if (user && user.email) {
    try {
      await sendEmail({
        email: user.email,
        subject: 'Purchase Confirmation - Acadify',
        message: `Hello ${user.fullName},\n\nYour purchase for ${mockTest.title} has been confirmed. You now have full access.\n\nThank you!`
      });
    } catch (err) {
      if ((req as any).log) (req as any).log.error({ event: 'admin.purchase.email.failed', err }, 'Error resending email');
    }
  }

  res.status(200).json({
    success: true,
    message: 'Confirmation email resent successfully'
  });
});

// 7) EXPORT PURCHASES
export const exportPurchases = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const search = req.query.search as string;
  const category = req.query.category as string;
  const paymentStatus = req.query.paymentStatus as string;
  const paymentMethod = req.query.paymentMethod as string;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;
  
  const matchStage: any = {};
  if (category) matchStage['mockTest.category'] = category;
  if (paymentStatus) matchStage['payment.status'] = paymentStatus;
  if (paymentMethod) matchStage['payment.paymentGateway'] = paymentMethod;
  if (startDate || endDate) {
    matchStage.purchaseDate = {};
    if (startDate) matchStage.purchaseDate.$gte = new Date(startDate);
    if (endDate) matchStage.purchaseDate.$lte = new Date(endDate);
  }

  const pipeline: any[] = [
    { $lookup: { from: 'users', localField: 'user', foreignField: '_id', as: 'user' } },
    { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'mocktests', localField: 'mockTest', foreignField: '_id', as: 'mockTest' } },
    { $unwind: { path: '$mockTest', preserveNullAndEmptyArrays: true } },
    { $lookup: { from: 'payments', localField: 'payment', foreignField: '_id', as: 'payment' } },
    { $unwind: { path: '$payment', preserveNullAndEmptyArrays: true } }
  ];

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    pipeline.push({
      $match: {
        $or: [
          { 'user.fullName': searchRegex },
          { 'user.email': searchRegex },
          { 'mockTest.title': searchRegex },
          { _id: mongoose.Types.ObjectId.isValid(search) ? new mongoose.Types.ObjectId(search) : null }
        ]
      }
    });
  }

  if (Object.keys(matchStage).length > 0) {
    pipeline.push({ $match: matchStage });
  }

  const purchases = await Purchase.aggregate(pipeline);
  const format = req.query.format as string || 'excel';

  const exportData = purchases.map(p => ({
    'Purchase ID': p._id.toString(),
    'Student Name': p.user?.fullName || 'N/A',
    'Student Email': p.user?.email || 'N/A',
    'Mock Test': p.mockTest?.title || 'N/A',
    'Category': p.mockTest?.category || 'N/A',
    'Amount': p.amountPaid,
    'Payment Method': p.payment?.paymentGateway || 'N/A',
    'Payment Status': p.payment?.status || 'N/A',
    'Purchase Date': new Date(p.purchaseDate).toLocaleDateString(),
    'Access Status': p.status
  }));

  const worksheet = xlsx.utils.json_to_sheet(exportData);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Purchases');

  if (format === 'csv') {
    const csvOutput = xlsx.write(workbook, { bookType: 'csv', type: 'buffer' });
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=purchases.csv');
    return res.status(200).send(csvOutput);
  } else {
    const excelOutput = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=purchases.xlsx');
    return res.status(200).send(excelOutput);
  }
});

// 8) DELETE PURCHASE
export const deletePurchase = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const purchase = await Purchase.findByIdAndDelete(req.params.id);
  if (!purchase) return next(new AppError('No purchase found with that ID', 404));

  res.status(200).json({
    success: true,
    message: 'Purchase deleted successfully'
  });
});
