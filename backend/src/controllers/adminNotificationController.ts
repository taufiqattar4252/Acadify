import { Request, Response, NextFunction } from 'express';
import NotificationLog, { NotificationLogStatus } from '../models/NotificationLog';
import NotificationTemplate from '../models/NotificationTemplate';
import { broadcastNotification } from '../services/notificationService';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';

// ----------------------------------------------------------------------
// BROADCAST & SCHEDULING
// ----------------------------------------------------------------------

export const sendBroadcast = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { title, message, type, priority, actionUrl, image, targetAudience, target, filters, sendEmail, sendInApp, scheduledAt, html } = req.body;
  const audience = targetAudience || target || 'All Students';

  let userFilter: any = {};
  
  if (audience === 'All Students') {
    userFilter = { role: 'student' };
  } else if (audience === 'Specific Students' && filters?.userIds) {
    userFilter = { _id: { $in: filters.userIds }, role: 'student' };
  } else if (audience === 'Purchased Students') {
    // Need to handle purchase join or simply let it pass if not fully implemented in DB
    userFilter = { role: 'student' }; 
  } else if (audience === 'Inactive Students') {
    userFilter = { role: 'student', isActive: false };
  }

  const isScheduled = scheduledAt && new Date(scheduledAt) > new Date();

  const log = await NotificationLog.create({
    title,
    message,
    type,
    priority,
    targetAudience: audience,
    filters: userFilter,
    sendEmail: sendEmail || false,
    sendInApp: sendInApp !== false,
    actionUrl,
    image,
    status: isScheduled ? NotificationLogStatus.PENDING : NotificationLogStatus.IN_PROGRESS,
    scheduledAt: isScheduled ? scheduledAt : undefined,
    createdBy: (req as any).user._id,
  });

  if (!isScheduled) {
    // Process asynchronously without blocking
    broadcastNotification({
      title,
      message,
      type,
      priority,
      actionUrl,
      image,
      sendEmail,
      notificationLogId: log._id as any,
      metadata: { html }
    }, userFilter).then(async ({ successCount, failureCount }) => {
      log.status = NotificationLogStatus.COMPLETED;
      log.successCount = successCount;
      log.failureCount = failureCount;
      log.sentAt = new Date();
      await log.save();
    }).catch(async (err) => {
      if ((req as any).log) (req as any).log.error({ event: 'admin.notification.broadcast.failed', err }, 'Broadcast failed');
      log.status = NotificationLogStatus.FAILED;
      await log.save();
    });
  }

  res.status(200).json({
    success: true,
    message: isScheduled ? 'Broadcast scheduled successfully' : 'Broadcast initiated successfully',
    data: log
  });
});

export const getNotificationHistory = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const logs = await NotificationLog.find()
    .populate('createdBy', 'fullName email')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await NotificationLog.countDocuments();

  res.status(200).json({
    success: true,
    data: logs,
    meta: { total, page, pages: Math.ceil(total / limit) }
  });
});

export const getDashboardStats = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const totalLogs = await NotificationLog.countDocuments();
  const pendingLogs = await NotificationLog.countDocuments({ status: NotificationLogStatus.PENDING });
  
  // Get aggregated stats
  const aggregateStats = await NotificationLog.aggregate([
    {
      $group: {
        _id: null,
        totalSuccess: { $sum: '$successCount' },
        totalFailures: { $sum: '$failureCount' },
        totalReads: { $sum: '$readCount' },
        totalClicks: { $sum: '$clickCount' },
      }
    }
  ]);

  const stats = aggregateStats[0] || {
    totalSuccess: 0,
    totalFailures: 0,
    totalReads: 0,
    totalClicks: 0
  };

  res.status(200).json({
    success: true,
    data: {
      totalBroadcasts: totalLogs,
      scheduledBroadcasts: pendingLogs,
      totalSent: stats.totalSuccess,
      totalReads: stats.totalReads,
      totalClicks: stats.totalClicks,
      deliveryRate: stats.totalSuccess > 0 ? ((stats.totalSuccess / (stats.totalSuccess + stats.totalFailures)) * 100).toFixed(2) : 0,
      readRate: stats.totalSuccess > 0 ? ((stats.totalReads / stats.totalSuccess) * 100).toFixed(2) : 0,
    }
  });
});

// ----------------------------------------------------------------------
// TEMPLATES
// ----------------------------------------------------------------------

export const getTemplates = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const templates = await NotificationTemplate.find().populate('createdBy', 'fullName email').sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: templates });
});

export const createTemplate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const template = await NotificationTemplate.create({
    ...req.body,
    createdBy: (req as any).user._id
  });
  res.status(201).json({ success: true, data: template });
});

export const updateTemplate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const template = await NotificationTemplate.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!template) return next(new AppError('Template not found', 404));
  res.status(200).json({ success: true, data: template });
});

export const deleteTemplate = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const template = await NotificationTemplate.findByIdAndDelete(req.params.id);
  if (!template) return next(new AppError('Template not found', 404));
  res.status(200).json({ success: true, data: {} });
});
