import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Payment, { PaymentStatus } from '../models/Payment';
import Purchase, { PurchaseStatus } from '../models/Purchase';
import MockTest from '../models/MockTest';
import Cart from '../models/Cart';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import { processCommission } from '../utils/commissionHelper';

// Razorpay gets initialized locally when needed to ensure env vars are fresh

// @desc    Create Razorpay Order
// @route   POST /api/payment/create-order
// @access  Private (Student)
export const createOrder = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { mockTestId } = req.body;

  if (!mockTestId) {
    return next(new AppError('Mock Test ID is required', 400));
  }

  const mockTestQuery: any = { _id: mockTestId };
  const mockTest = await MockTest.findOne(mockTestQuery);
  if (!mockTest) {
    return next(new AppError('Mock Test not found', 404));
  }

  if (mockTest.price === 0) {
    const existingFreePurchase = await Purchase.findOne({
      user: req.user._id,
      mockTest: mockTest._id,
      status: PurchaseStatus.COMPLETED,
    });

    if (existingFreePurchase) {
      return next(new AppError('You have already enrolled in this free mock test.', 400));
    }

    await Purchase.create({
      user: req.user._id,
      mockTest: mockTest._id,
      amountPaid: 0,
      status: PurchaseStatus.COMPLETED,
    });

    return res.status(200).json({
      success: true,
      data: {
        isFree: true,
        message: 'Successfully enrolled in the free mock test',
      },
    });
  }

  // Check if already purchased
  const purchaseQuery: any = {
    user: req.user._id,
    mockTest: mockTest._id,
    status: PurchaseStatus.COMPLETED,
  };
  const existingPurchase = await Purchase.findOne(purchaseQuery);

  if (existingPurchase) {
    return next(new AppError('You have already purchased this mock test.', 400));
  }

  // Check for existing pending payment to avoid duplicates
  const pendingPaymentQuery: any = {
    user: req.user._id,
    mockTest: mockTest._id,
    status: PaymentStatus.PENDING,
  };
  const existingPendingPayment = await Payment.findOne(pendingPaymentQuery);

  if (existingPendingPayment) {
    // Optionally we could return the existing order, but creating a new one is safer in Razorpay
    const updateQuery: any = { _id: existingPendingPayment._id };
    await Payment.findOneAndUpdate(updateQuery, { status: PaymentStatus.CANCELLED });
  }

  // Create Razorpay Order
  const options = {
    amount: mockTest.price * 100, // Amount in paise
    currency: 'INR',
    receipt: `rcpt_${Date.now()}_${mockTest._id.toString().slice(-4)}`,
  };

  const currentKeyId = process.env.RAZORPAY_KEY_ID || 'missing_key_id';
  if (currentKeyId === 'rzp_test_dummy' || currentKeyId === 'missing_key_id') {
    return next(new AppError(`CRITICAL DEBUG: key is ${currentKeyId}`, 400));
  }
  
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_secret',
  });

  const order = await razorpay.orders.create(options);

  if (!order) {
    return next(new AppError('Failed to create Razorpay order', 500));
  }

  // Save Pending Payment
  const payment = await Payment.create({
    user: req.user._id,
    mockTest: mockTest._id,
    paymentGateway: 'razorpay',
    orderId: order.id,
    amount: mockTest.price,
    currency: 'INR',
    status: PaymentStatus.PENDING,
  });

  res.status(200).json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
    },
  });
});

// @desc    Verify Payment
// @route   POST /api/payment/verify
// @access  Private (Student)
export const verifyPayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return next(new AppError('Payment details are missing', 400));
  }

  const payment = await Payment.findOne({ orderId: razorpay_order_id });

  if (!payment) {
    return next(new AppError('Payment record not found', 404));
  }

  if (payment.status === PaymentStatus.SUCCESS) {
    return next(new AppError('Payment is already verified', 400));
  }

  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(body.toString())
    .digest('hex');

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.status = PaymentStatus.SUCCESS;
    payment.transactionDate = new Date();
    await payment.save();

    if (payment.cart) {
      // Cart checkout
      const cart = await Cart.findById(payment.cart).populate('items.mockTest');
      if (cart && cart.items && cart.items.length > 0) {
        // Create purchase for each item
        const purchasesToCreate = cart.items.map((item: any) => ({
          user: payment.user,
          mockTest: item.mockTest._id || item.mockTest,
          payment: payment._id,
          amountPaid: item.price,
          status: PurchaseStatus.COMPLETED,
        }));
        const createdPurchases = await Purchase.insertMany(purchasesToCreate);

        // Process Commission if coupon applied
        if (cart.coupon) {
          for (const purchase of createdPurchases) {
             await processCommission(purchase._id, cart.coupon as any);
          }
        }

        // Clear cart
        cart.items = [];
        cart.coupon = undefined as any;
        cart.subtotal = 0;
        cart.discount = 0;
        cart.finalTotal = 0;
        await cart.save();
      }
    } else if (payment.mockTest) {
      // Single mock test checkout
      await Purchase.create({
        user: payment.user,
        mockTest: payment.mockTest,
        payment: payment._id,
        amountPaid: payment.amount,
        status: PurchaseStatus.COMPLETED,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
    });
  } else {
    payment.status = PaymentStatus.FAILED;
    await payment.save();
    
    return next(new AppError('Payment signature verification failed', 400));
  }
});

// @desc    Get user payment history
// @route   GET /api/payment/history
// @access  Private (Student)
export const getPaymentHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const payments = await Payment.find({ user: req.user._id })
    .populate({
      path: 'mockTest',
      select: 'title category',
    })
    .sort('-createdAt');

  res.status(200).json({
    success: true,
    data: { payments },
  });
});

// @desc    Get single payment details
// @route   GET /api/payment/:id
// @access  Private (Student)
export const getPaymentDetails = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const query: any = { _id: req.params.id, user: req.user._id };
  const payment = await Payment.findOne(query)
    .populate({
      path: 'mockTest',
      select: 'title category price thumbnail',
    })
    .populate({
      path: 'user',
      select: 'fullName email phone',
    });

  if (!payment) {
    return next(new AppError('Payment not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { payment },
  });
});

// @desc    Razorpay Webhook
// @route   POST /api/payment/webhook
// @access  Public
export const razorpayWebhook = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Verifying webhook signature
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
  const signature = req.headers['x-razorpay-signature'] as string;
  
  if (!signature) {
    return res.status(400).json({ success: false, message: 'Missing signature' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (expectedSignature !== signature) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  const event = req.body.event;
  const payload = req.body.payload;

  if (event === 'payment.captured' || event === 'order.paid') {
    const paymentEntity = payload.payment.entity;
    const orderId = paymentEntity.order_id;
    
    const payment = await Payment.findOne({ orderId });
    if (payment && payment.status !== PaymentStatus.SUCCESS) {
      payment.paymentId = paymentEntity.id;
      payment.status = PaymentStatus.SUCCESS;
      payment.transactionDate = new Date();
      await payment.save();

      if (payment.cart) {
        // Cart checkout webhook
        const cart = await Cart.findById(payment.cart).populate('items.mockTest');
        if (cart && cart.items && cart.items.length > 0) {
          for (const item of cart.items) {
            const mockTestId = item.mockTest._id || item.mockTest;
            const existingPurchase = await Purchase.findOne({ user: payment.user, mockTest: mockTestId });
            if (!existingPurchase) {
              const newPurchase = await Purchase.create({
                user: payment.user,
                mockTest: mockTestId,
                payment: payment._id,
                amountPaid: item.price,
                status: PurchaseStatus.COMPLETED,
              });
              
              if (cart.coupon) {
                await processCommission(newPurchase._id, cart.coupon as any);
              }
            }
          }
          // Clear cart
          cart.items = [];
          cart.coupon = undefined as any;
          cart.subtotal = 0;
          cart.discount = 0;
          cart.finalTotal = 0;
          await cart.save();
        }
      } else if (payment.mockTest) {
        // Single mock test checkout webhook
        const existingPurchase = await Purchase.findOne({ user: payment.user, mockTest: payment.mockTest });
        if (!existingPurchase) {
          await Purchase.create({
            user: payment.user,
            mockTest: payment.mockTest,
            payment: payment._id,
            amountPaid: payment.amount,
            status: PurchaseStatus.COMPLETED,
          });
        }
      }
    }
  } else if (event === 'payment.failed') {
    const paymentEntity = payload.payment.entity;
    const orderId = paymentEntity.order_id;
    
    const payment = await Payment.findOne({ orderId });
    if (payment && payment.status === PaymentStatus.PENDING) {
      payment.status = PaymentStatus.FAILED;
      await payment.save();
    }
  }

  res.status(200).json({ status: 'ok' });
});
