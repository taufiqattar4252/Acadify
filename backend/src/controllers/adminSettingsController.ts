import { Request, Response, NextFunction } from 'express';
import Setting from '../models/Setting';
import Admin from '../models/Admin';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';
import sendEmail from '../services/emailService';

// Helper to get or create the singleton settings document
const getSettingsDocument = async () => {
  let settings = await Setting.findOne();
  if (!settings) {
    settings = await Setting.create({});
  }
  return settings;
};

// ============================================================================
// GET ALL SETTINGS
// ============================================================================
export const getSettings = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  let settings;
  try {
    settings = await getSettingsDocument();
  } catch (err) {
    if ((req as any).log) (req as any).log.error({ event: 'admin.settings.get.failed', err }, 'Error in getSettingsDocument');
    return next(err);
  }
  
  // Convert to lean object so we can mask sensitive fields if necessary
  const settingsObj = settings.toObject();

  // If user is not Super Admin, mask sensitive keys
  const admin = req.user as any;
  if (admin.role !== 'Super Admin') {
    if (settingsObj.payment) {
      settingsObj.payment.razorpaySecret = '********';
      settingsObj.payment.webhookSecret = '********';
    }
    if (settingsObj.email) {
      settingsObj.email.apiKey = '********';
    }
  }

  res.status(200).json({
    success: true,
    data: settingsObj,
  });
});

// ============================================================================
// PROFILE
// ============================================================================
export const updateProfile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const adminId = (req as any).user._id;
  const { fullName, email, phoneNumber, profilePicture, password } = req.body;

  const admin = await Admin.findById(adminId);
  if (!admin) return next(new AppError('Admin not found', 404));

  if (fullName) admin.fullName = fullName;
  if (email) admin.email = email;
  if (phoneNumber !== undefined) admin.phoneNumber = phoneNumber;
  if (profilePicture !== undefined) admin.profilePicture = profilePicture;
  if (password) admin.password = password;

  await admin.save(); // using save to trigger pre-save password hash

  res.status(200).json({
    success: true,
    data: {
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
      phoneNumber: admin.phoneNumber,
      profilePicture: admin.profilePicture,
    }
  });
});

// ============================================================================
// PARTIAL UPDATES
// ============================================================================

export const updateGeneral = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const settings = await getSettingsDocument();
  settings.general = { ...settings.general, ...req.body };
  await settings.save();
  res.status(200).json({ success: true, data: settings.general });
});

export const updateExam = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const settings = await getSettingsDocument();
  settings.exam = { ...settings.exam, ...req.body };
  await settings.save();
  res.status(200).json({ success: true, data: settings.exam });
});

export const updatePayment = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const settings = await getSettingsDocument();
  settings.payment = { ...settings.payment, ...req.body };
  await settings.save();
  res.status(200).json({ success: true, data: settings.payment });
});

export const updateEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const settings = await getSettingsDocument();
  settings.email = { ...settings.email, ...req.body };
  await settings.save();
  res.status(200).json({ success: true, data: settings.email });
});

export const updateNotifications = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const settings = await getSettingsDocument();
  settings.notifications = { ...settings.notifications, ...req.body };
  await settings.save();
  res.status(200).json({ success: true, data: settings.notifications });
});

export const updateRoles = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const settings = await getSettingsDocument();
  settings.roles = { ...settings.roles, ...req.body };
  await settings.save();
  res.status(200).json({ success: true, data: settings.roles });
});

export const updateBranding = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const settings = await getSettingsDocument();
  settings.branding = { ...settings.branding, ...req.body };
  await settings.save();
  res.status(200).json({ success: true, data: settings.branding });
});

export const updateSecurity = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const settings = await getSettingsDocument();
  settings.security = { ...settings.security, ...req.body };
  await settings.save();
  res.status(200).json({ success: true, data: settings.security });
});

// ============================================================================
// SYSTEM / UTILS
// ============================================================================

export const testEmail = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { to, message } = req.body;
  if (!to) return next(new AppError('Please provide an email to test', 400));
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return next(new AppError('Please provide a valid email address', 400));
  }
  
  await sendEmail({
    email: to,
    subject: 'Acadify SMTP Test',
    message: message || 'This is a test email to verify your SMTP configuration is working correctly.',
  });

  res.status(200).json({ success: true, message: 'Test email sent successfully!' });
});
