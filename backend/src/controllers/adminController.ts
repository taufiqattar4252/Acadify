import { Request, Response, NextFunction } from 'express';
import Admin from '../models/Admin';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';

// Get all admins (exclude passwords)
export const getAllAdmins = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const admins = await Admin.find().select('-password').sort('-createdAt');
  
  res.status(200).json({
    status: 'success',
    results: admins.length,
    data: {
      admins
    }
  });
});

// Get single admin
export const getAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const admin = await Admin.findById(req.params.id).select('-password');
  
  if (!admin) {
    return next(new AppError('No admin found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      admin
    }
  });
});

// Create new admin
export const createAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { fullName, email, password, role, isActive } = req.body;

  // Check if email is already in use
  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return next(new AppError('Email already in use by another admin', 400));
  }

  const newAdmin = await Admin.create({
    fullName,
    email,
    password,
    role,
    isActive: isActive !== undefined ? isActive : true
  });

  const adminObj = newAdmin.toObject();
  delete adminObj.password;

  res.status(201).json({
    status: 'success',
    data: {
      admin: adminObj
    }
  });
});

// Update admin
export const updateAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { fullName, email, password, role, isActive } = req.body;
  const admin = await Admin.findById(req.params.id);

  if (!admin) {
    return next(new AppError('No admin found with that ID', 404));
  }

  // If email is changing, ensure it's not taken
  if (email && email !== admin.email) {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return next(new AppError('Email already in use by another admin', 400));
    }
    admin.email = email;
  }

  if (fullName) admin.fullName = fullName;
  if (role) admin.role = role;
  if (isActive !== undefined) admin.isActive = isActive;
  if (password) admin.password = password;

  await admin.save();

  const adminObj = admin.toObject();
  delete adminObj.password;

  res.status(200).json({
    status: 'success',
    data: {
      admin: adminObj
    }
  });
});

// Delete admin
export const deleteAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // Check if they are trying to delete themselves
  if (req.user && req.user.id === req.params.id) {
    return next(new AppError('You cannot delete your own account', 400));
  }

  const admin = await Admin.findByIdAndDelete(req.params.id);

  if (!admin) {
    return next(new AppError('No admin found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
