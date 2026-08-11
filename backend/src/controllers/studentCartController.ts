import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Cart from '../models/Cart';
import MockTest from '../models/MockTest';
import Coupon, { DiscountType } from '../models/Coupon';
import Purchase from '../models/Purchase';
import Payment, { PaymentStatus } from '../models/Payment';
import AppError from '../utils/AppError';
import catchAsync from '../utils/catchAsync';
import Razorpay from 'razorpay';

// Helper function to calculate cart totals
const calculateCartTotals = async (cart: any) => {
  let subtotal = 0;

  // Calculate subtotal from items
  cart.items.forEach((item: any) => {
    subtotal += item.price;
  });

  let discount = 0;

  // Apply coupon if exists
  if (cart.coupon && cart.coupon.isActive) {
    const coupon = cart.coupon;
    if (subtotal >= coupon.minOrderValue) {
      if (coupon.discountType === DiscountType.PERCENTAGE) {
        discount = (subtotal * coupon.discountValue) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else if (coupon.discountType === DiscountType.FLAT) {
        discount = coupon.discountValue;
      }
    }
  }

  // Ensure discount doesn't exceed subtotal
  if (discount > subtotal) {
    discount = subtotal;
  }

  const finalTotal = subtotal - discount;

  cart.subtotal = subtotal;
  cart.discount = discount;
  cart.finalTotal = finalTotal;

  return cart;
};

// @desc    Get student cart
// @route   GET /api/student/cart
// @access  Private
export const getCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let cart = await Cart.findOne({ user: req.user._id } as any)
    .populate({
      path: 'items.mockTest',
      select: 'title category duration price thumbnail totalQuestions difficulty',
    })
    .populate('coupon');

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Filter out any items where the mock test was deleted
  const originalItemCount = cart!.items.length;
  cart!.items = cart!.items.filter((item: any) => item.mockTest != null);

  // If items were removed because tests were deleted, save
  if (originalItemCount !== cart!.items.length) {
    cart = await calculateCartTotals(cart!);
    await cart!.save();
  }

  res.status(200).json({
    status: 'success',
    data: {
      cart,
    },
  });
});

// @desc    Add mock test to cart
// @route   POST /api/student/cart/add
// @access  Private
export const addToCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { mockTestId } = req.body;

  if (!mockTestId) {
    return next(new AppError('Please provide a mock test ID', 400));
  }

  const mockTest = await (MockTest as any).findById(mockTestId);
  if (!mockTest) {
    return next(new AppError('Mock test not found', 404));
  }

  if (mockTest.status !== 'Published') {
    return next(new AppError('This mock test is not available for purchase', 400));
  }

  // Check if already purchased
  const existingPurchase = await Purchase.findOne({
    user: req.user._id,
    mockTest: mockTestId,
    status: 'completed',
  } as any);

  if (existingPurchase) {
    return next(new AppError('You have already purchased this mock test', 400));
  }

  let cart = await Cart.findOne({ user: req.user._id } as any).populate('coupon');

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  // Check if already in cart
  const existingItemIndex = cart!.items.findIndex(
    (item: any) => item.mockTest.toString() === mockTestId
  );

  if (existingItemIndex !== -1) {
    return next(new AppError('Item is already in your cart', 400));
  }

  // Add to cart
  cart!.items.push({
    mockTest: mockTest._id,
    price: mockTest.price,
    addedAt: new Date(),
  });

  cart = await calculateCartTotals(cart!);
  await cart!.save();

  // Populate before sending back
  await cart!.populate({
    path: 'items.mockTest',
    select: 'title category duration price thumbnail totalQuestions difficulty',
  });

  res.status(200).json({
    status: 'success',
    message: 'Added to cart successfully',
    data: {
      cart,
    },
  });
});

// @desc    Remove mock test from cart
// @route   DELETE /api/student/cart/remove/:mockId
// @access  Private
export const removeFromCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { mockId } = req.params;

  let cart = await Cart.findOne({ user: req.user._id as any }).populate('coupon');

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  cart!.items = cart!.items.filter((item: any) => item.mockTest.toString() !== mockId);

  // If cart is empty, optionally remove coupon
  if (cart!.items.length === 0) {
    cart!.coupon = undefined as any;
  }

  cart = await calculateCartTotals(cart!);
  await cart!.save();

  await cart!.populate({
    path: 'items.mockTest',
    select: 'title category duration price thumbnail totalQuestions difficulty',
  });

  res.status(200).json({
    status: 'success',
    message: 'Item removed from cart',
    data: {
      cart,
    },
  });
});

// @desc    Clear cart
// @route   DELETE /api/student/cart/clear
// @access  Private
export const clearCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let cart = await Cart.findOne({ user: req.user._id as any });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  } else {
    cart!.items = [];
    cart!.coupon = undefined as any;
    cart!.subtotal = 0;
    cart!.discount = 0;
    cart!.finalTotal = 0;
    await cart!.save();
  }

  res.status(200).json({
    status: 'success',
    message: 'Cart cleared successfully',
    data: {
      cart,
    },
  });
});

// @desc    Apply coupon
// @route   POST /api/student/cart/apply-coupon
// @access  Private
export const applyCoupon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.body;

  if (!code) {
    return next(new AppError('Please provide a coupon code', 400));
  }

  let cart = await Cart.findOne({ user: req.user._id as any });

  if (!cart || cart.items.length === 0) {
    return next(new AppError('Your cart is empty', 400));
  }

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
    expiryDate: { $gt: new Date() }
  });

  if (!coupon) {
    return next(new AppError('Invalid or expired coupon', 400));
  }

  // Calculate subtotal to check minOrderValue
  let subtotal = 0;
  cart.items.forEach((item: any) => {
    subtotal += item.price;
  });

  if (subtotal < coupon.minOrderValue) {
    return next(new AppError(`Minimum order value of ₹${(coupon.minOrderValue || 0).toFixed(2)} required for this coupon`, 400));
  }

  cart!.coupon = coupon._id;

  // Re-populate to calculate correct totals
  await cart!.populate('coupon');
  cart = await calculateCartTotals(cart!);
  await cart!.save();

  await cart!.populate({
    path: 'items.mockTest',
    select: 'title category duration price thumbnail totalQuestions difficulty',
  });

  res.status(200).json({
    status: 'success',
    message: 'Coupon applied successfully',
    data: {
      cart,
    },
  });
});

// @desc    Remove coupon
// @route   DELETE /api/student/cart/remove-coupon
// @access  Private
export const removeCoupon = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let cart = await Cart.findOne({ user: req.user._id as any });

  if (!cart) {
    return next(new AppError('Cart not found', 404));
  }

  cart!.coupon = undefined as any;
  cart = await calculateCartTotals(cart!);
  await cart!.save();

  await cart!.populate({
    path: 'items.mockTest',
    select: 'title category duration price thumbnail totalQuestions difficulty',
  });

  res.status(200).json({
    status: 'success',
    message: 'Coupon removed successfully',
    data: {
      cart,
    },
  });
});

// @desc    Checkout cart (Create Razorpay Order)
// @route   POST /api/student/cart/checkout
// @access  Private
export const checkoutCart = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let cart = await Cart.findOne({ user: req.user._id as any })
    .populate('coupon')
    .populate('items.mockTest');

  if (!cart || cart.items.length === 0) {
    return next(new AppError('Your cart is empty', 400));
  }

  // Re-verify that items are not already purchased
  for (const item of cart!.items) {
    const mockTest: any = item.mockTest;
    if (!mockTest || mockTest.status !== 'Published') {
      return next(new AppError('One or more mock tests in your cart are unavailable', 400));
    }
    const existingPurchase = await Purchase.findOne({
      user: req.user._id,
      mockTest: mockTest._id,
      status: 'completed',
    } as any);
    if (existingPurchase) {
      return next(new AppError(`You have already purchased '${mockTest.title}'`, 400));
    }
  }

  // Recalculate totals to be secure
  cart = await calculateCartTotals(cart!);

  if (cart!.finalTotal <= 0) {
    // If it's totally free, we don't need razorpay. We can just complete it directly.
    // For now, let's say all mock tests in cart must be paid or we can create purchases directly.
    return next(new AppError('Cart total is 0. Please purchase free mock tests directly.', 400));
  }

  // Cancel any existing pending payment for this cart
  await Payment.updateMany(
    { user: req.user._id, cart: cart!._id, status: PaymentStatus.PENDING } as any,
    { status: PaymentStatus.CANCELLED }
  );

  // Initialize Razorpay
  const currentKeyId = process.env.RAZORPAY_KEY_ID || 'missing_key_id';
  if (currentKeyId === 'rzp_test_dummy' || currentKeyId === 'missing_key_id') {
    return next(new AppError(`Payment gateway not configured properly`, 500));
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '',
  });

  const options = {
    amount: Math.round(cart!.finalTotal * 100), // Amount in paise
    currency: 'INR',
    receipt: `cart_${Date.now()}_${req.user._id.toString().slice(-4)}`,
  };

  const order = await razorpay.orders.create(options);

  if (!order) {
    return next(new AppError('Failed to create Razorpay order', 500));
  }

  // Save Pending Payment
  const payment = await Payment.create({
    user: req.user._id,
    cart: cart!._id,
    paymentGateway: 'razorpay',
    orderId: order.id,
    amount: cart!.finalTotal,
    currency: 'INR',
    status: PaymentStatus.PENDING,
  });

  res.status(200).json({
    status: 'success',
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
    },
  });
});
