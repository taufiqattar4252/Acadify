import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import User from '../models/User';
import Admin from '../models/Admin';
import AppError from '../utils/AppError';
import sendEmail from './emailService';

export const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '90d') as any,
  });
};

export const createSendToken = (user: any, statusCode: number, res: Response) => {
  const token = signToken(user._id.toString());

  const expiresInDays = parseInt(process.env.JWT_COOKIE_EXPIRES_IN || '90');
  
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL || !!process.env.VERCEL_ENV;
  const cookieOptions: any = {
    expires: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax'
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  if (user.password) user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const createVerificationToken = (): { token: string; hashedToken: string } => {
  const token = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  return { token, hashedToken };
};
