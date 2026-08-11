import { Request, Response, NextFunction } from 'express';
import Notification from '../models/Notification';
import User from '../models/User';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';

// @desc    Get user notifications
// @route   GET /api/student/notifications
// @access  Private/Student
export const getNotifications = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  // Filters
  const query: any = { user: userId };
  if (req.query.isRead !== undefined) {
    query.isRead = req.query.isRead === 'true';
  }
  if (req.query.type) {
    query.type = req.query.type;
  }
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { message: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(query);

  res.status(200).json({
    success: true,
    data: notifications,
    meta: {
      total,
      page,
      pages: Math.ceil(total / limit)
    }
  });
});

// @desc    Get unread count
// @route   GET /api/student/notifications/unread-count
// @access  Private/Student
export const getUnreadCount = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  
  const count = await Notification.countDocuments({ user: userId, isRead: false });

  res.status(200).json({
    success: true,
    count
  });
});

// @desc    Mark notification as read
// @route   PATCH /api/student/notifications/:id/read
// @access  Private/Student
export const markAsRead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  
  const notification = await (Notification as any).findOneAndUpdate(
    { _id: req.params.id, user: userId } as any,
    { isRead: true, readAt: new Date() } as any,
    { new: true }
  );

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc    Mark all as read
// @route   PATCH /api/student/notifications/read-all
// @access  Private/Student
export const markAllAsRead = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  
  await (Notification as any).updateMany(
    { user: userId, isRead: false } as any,
    { isRead: true, readAt: new Date() } as any
  );

  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc    Delete notification
// @route   DELETE /api/student/notifications/:id
// @access  Private/Student
export const deleteNotification = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  
  const notification = await (Notification as any).findOneAndDelete({ _id: req.params.id, user: userId } as any);

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Update notification preferences
// @route   PATCH /api/student/notification-preferences
// @access  Private/Student
export const updatePreferences = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user?._id;
  const { preferences } = req.body;
  
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.notificationPreferences = {
    ...user.notificationPreferences,
    ...preferences
  };

  await user.save();

  res.status(200).json({
    success: true,
    data: user.notificationPreferences
  });
});
