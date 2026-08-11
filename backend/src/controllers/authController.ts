import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import Admin from '../models/Admin';
import Partner from '../models/Partner';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import { createSendToken, createVerificationToken } from '../services/authService';
import sendEmail from '../services/emailService';

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { fullName, email, password, phone } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if ((req as any).log) (req as any).log.warn({ event: 'auth.register.failed', email }, 'Registration failed: Email already in use');
    return next(new AppError('Email already in use', 400));
  }

  const { token, hashedToken } = createVerificationToken();

  const newUser = await User.create({
    fullName,
    email,
    password,
    phone,
    verificationToken: hashedToken,
    // Expire in 24 hours
    verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const verifyURL = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${token}`;
  // For frontend, we should ideally point to a frontend route instead of API directly:
  const frontendVerifyURL = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

  const message = `Welcome to MHT-CET Platform!\nPlease verify your email by clicking on the link below:\n\n${frontendVerifyURL}\n\nIf you did not register, please ignore this email.`;

  // Fire email asynchronously to prevent blocking the registration response
  sendEmail({
    email: newUser.email,
    subject: 'Verify your email address',
    message,
  }).catch((err) => {
    if ((req as any).log) (req as any).log.error({ event: 'auth.email.failed', err }, 'Failed to send verification email asynchronously');
    // We don't delete the user; they can request a new verification link later.
  });

  if ((req as any).log) (req as any).log.info({ event: 'auth.register.success', userId: newUser._id }, 'User registration successful');

  res.status(201).json({
    status: 'success',
    message: 'Registration successful. Please check your email to verify your account.',
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
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
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
