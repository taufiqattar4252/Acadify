import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import Admin from '../models/Admin';
import Partner from '../models/Partner';
import Coupon from '../models/Coupon';
import Otp from '../models/Otp';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import { createSendToken, createVerificationToken } from '../services/authService';
import sendEmail from '../services/emailService';

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { fullName, email, password, phone, targetExamYear, stream, targetMarks, targetCollege, referralCode } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if ((req as any).log) (req as any).log.warn({ event: 'auth.register.failed', email }, 'Registration failed: Email already in use');
    return next(new AppError('Email already in use', 400));
  }

  if (referralCode) {
    const coupon = await Coupon.findOne({ code: referralCode, isActive: true });
    if (!coupon) {
      return next(new AppError('Invalid referral code', 400));
    }
  }

  const newUser = await User.create({
    fullName,
    email,
    password,
    phone,
    isVerified: true,
    goals: {
      targetExamYear,
      stream,
      targetScore: targetMarks,
      targetCollege,
    },
    referralCode,
  });

  if ((req as any).log) (req as any).log.info({ event: 'auth.register.success', userId: newUser._id }, 'User registration successful');

  res.status(201).json({
    status: 'success',
    message: 'Registration successful. You can now log in.',
  });
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    if ((req as any).log) (req as any).log.warn({ event: 'auth.login.failed', email }, 'Login failed: Incorrect email or password');
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!user.isVerified) {
    if ((req as any).log) (req as any).log.warn({ event: 'auth.login.failed', email, reason: 'unverified' }, 'Login failed: Email not verified');
    return next(new AppError('Please verify your email before logging in', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Your account has been deactivated. Please contact support.', 401));
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  if ((req as any).log) (req as any).log.info({ event: 'auth.login.success', userId: user._id }, 'User login successful');

  createSendToken(user, 200, res);
});

export const adminLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin || !(await admin.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!admin.isActive) {
    return next(new AppError('Your account has been deactivated.', 401));
  }

  admin.lastLogin = new Date();
  await admin.save({ validateBeforeSave: false });

  createSendToken(admin, 200, res);
});

export const partnerLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  const partner = await Partner.findOne({ email }).select('+password');

  if (!partner || !(await partner.comparePassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  if (!partner.status) {
    return next(new AppError('Your partner account has been deactivated.', 401));
  }

  partner.lastLogin = new Date();
  await partner.save({ validateBeforeSave: false });

  createSendToken(partner, 200, res);
});

export const verifyEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.params.token as string;

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res);
});

export const forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const user = await User.findOne({ email: req.body.email });
  
  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  const { token, hashedToken } = createVerificationToken();
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 mins
  
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
  const message = `Forgot your password? Submit a new password to:\n${resetURL}\nIf you didn't forget your password, please ignore this email.`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 30 mins)',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Try again later!', 500));
  }
});

export const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const token = req.params.token as string;
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  
  await user.save(); // This will trigger the pre-save hook to hash the new password

  createSendToken(user, 200, res);
});

export const logout = (req: Request, res: Response) => {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL || !!process.env.VERCEL_ENV;
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  } as any);
  if ((req as any).log) (req as any).log.info({ event: 'auth.logout.success' }, 'User logged out');
  res.status(200).json({ status: 'success' });
};

export const getMe = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: req.user,
    },
  });
};

export const checkEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Please provide an email', 400));
  }
  const user = await User.findOne({ email: email.toLowerCase() });
  res.status(200).json({
    status: 'success',
    exists: !!user,
  });
});

export const sendOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Please provide an email address', 400));
  }

  // Delete any existing OTPs for this email to prevent spam
  await Otp.deleteMany({ email: email.toLowerCase() });

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  await Otp.create({
    email: email.toLowerCase(),
    otp: otpCode,
  });

  const message = `Your email verification code is: ${otpCode}\n\nThis code will expire in 10 minutes.`;

  // Send email asynchronously so we don't block the response
  sendEmail({
    email,
    subject: 'Your Acadify Verification Code',
    message,
  }).catch(err => {
    if ((req as any).log) (req as any).log.error({ event: 'auth.otp.failed', err }, 'Failed to send OTP email');
  });

  if ((req as any).log) (req as any).log.info({ event: 'auth.otp.sent', email }, 'OTP sent successfully');

  res.status(200).json({
    status: 'success',
    message: 'OTP sent successfully!',
  });
});

export const verifyOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, otp } = req.body;
  
  if (!email || !otp) {
    return next(new AppError('Please provide email and OTP', 400));
  }

  const otpDoc = await Otp.findOne({ email: email.toLowerCase(), otp });

  if (!otpDoc) {
    return next(new AppError('Invalid or expired OTP', 400));
  }

  // Delete the OTP document so it cannot be reused
  await Otp.deleteOne({ _id: otpDoc._id });

  if ((req as any).log) (req as any).log.info({ event: 'auth.otp.verified', email }, 'OTP verified successfully');

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully!',
  });
});
