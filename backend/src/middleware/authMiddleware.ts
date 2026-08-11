import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError';
import User from '../models/User';
import Admin from '../models/Admin';
import Partner from '../models/Partner';
import catchAsync from '../utils/catchAsync';

// Extend Express Request object to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const requireAuth = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  // 1) Get token from cookies or authorization header
  let token;
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  // 2) Verification token
  const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

  // 3) Check if user still exists (could be User or Admin based on the payload or we check both)
  let currentUser = await User.findById(decoded.id);
  
  if (!currentUser) {
    // Check if admin
    currentUser = await Admin.findById(decoded.id) as any;
  }
  
  if (!currentUser) {
    // Check if partner
    currentUser = await Partner.findById(decoded.id) as any;
  }

  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  // 4) Check if user changed password after the token was issued (optional advanced feature, skipped for simplicity here)

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

export const requireAdmin = requireRole('Super Admin', 'Content Admin', 'Support Admin');
