import Notification, { NotificationType, NotificationPriority, INotification } from '../models/Notification';
import NotificationLog from '../models/NotificationLog';
import User from '../models/User';
import sendEmail from './emailService';
import logger from '../config/logger';

interface NotificationPayload {
  user: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  actionUrl?: string;
  image?: string;
  metadata?: any;
  sendEmail?: boolean;
}

export const createNotification = async (payload: NotificationPayload): Promise<INotification | null> => {
  try {
    const user = await User.findById(payload.user);
    if (!user) return null;

    // Check user preferences
    const prefs = user.notificationPreferences;
    
    // Determine if in-app notification is allowed based on preference
    let shouldCreateInApp = prefs?.inApp ?? true;
    
    if (payload.type === NotificationType.EXAM_REMINDER && prefs?.examReminders === false) shouldCreateInApp = false;
    if (payload.type === NotificationType.RESULT_PUBLISHED && prefs?.resultNotifications === false) shouldCreateInApp = false;
    if (payload.type === NotificationType.PROMOTIONAL_OFFER && prefs?.marketingEmails === false) shouldCreateInApp = false;
    if (payload.type === NotificationType.ADMIN_ANNOUNCEMENT && prefs?.systemAnnouncements === false) shouldCreateInApp = false;

    let notification = null;

    if (shouldCreateInApp) {
      const notifData: any = {
        user: payload.user,
        title: payload.title,
        message: payload.message,
        type: payload.type,
        priority: payload.priority || NotificationPriority.NORMAL,
        metadata: payload.metadata,
      };
      if (payload.actionUrl) notifData.actionUrl = payload.actionUrl;
      if (payload.image) notifData.image = payload.image;
      
      notification = await Notification.create(notifData);
    }

    // Determine if email notification should be sent
    const shouldSendEmail = payload.sendEmail && (prefs?.email ?? true);
    let allowedByPref = true;
    
    if (payload.type === NotificationType.EXAM_REMINDER && prefs?.examReminders === false) allowedByPref = false;
    if (payload.type === NotificationType.RESULT_PUBLISHED && prefs?.resultNotifications === false) allowedByPref = false;
    if (payload.type === NotificationType.PROMOTIONAL_OFFER && prefs?.marketingEmails === false) allowedByPref = false;

    if (shouldSendEmail && allowedByPref) {
      await sendEmail({
        email: user.email,
        subject: payload.title,
        message: payload.message + (payload.actionUrl ? `\n\nLink: ${process.env.FRONTEND_URL}${payload.actionUrl}` : ''),
      });
    }

    // TODO: Push notifications (FCM/WebPush) could be triggered here if user.deviceTokens.length > 0

    return notification;
  } catch (error) {
    logger.error({ event: 'notification.create.failed', err: error }, 'Error creating notification');
    return null;
  }
};

export const broadcastNotification = async (payload: Omit<NotificationPayload, 'user'> & { notificationLogId?: string }, filter: any = {}): Promise<{ successCount: number; failureCount: number }> => {
  let successCount = 0;
  let failureCount = 0;
  
  try {
    const users = await User.find(filter).select('_id email notificationPreferences fullName');
    const BATCH_SIZE = 500;
    
    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE);
      const notificationsToInsert = [];
      const emailPromises = [];

      for (const user of batch) {
        let sentToUser = false;
        const prefs = user.notificationPreferences;
        let shouldCreateInApp = prefs?.inApp ?? true;
        if (payload.type === NotificationType.PROMOTIONAL_OFFER && prefs?.marketingEmails === false) shouldCreateInApp = false;
        if (payload.type === NotificationType.ADMIN_ANNOUNCEMENT && prefs?.systemAnnouncements === false) shouldCreateInApp = false;

        // Replace template variables
        let finalTitle = payload.title.replace(/{{userName}}/g, user.fullName);
        let finalMessage = payload.message.replace(/{{userName}}/g, user.fullName);

        if (shouldCreateInApp) {
          const notifData: any = {
            user: user._id,
            notificationLogId: payload.notificationLogId,
            title: finalTitle,
            message: finalMessage,
            type: payload.type,
            priority: payload.priority || NotificationPriority.NORMAL,
            metadata: payload.metadata,
          };
          if (payload.actionUrl) notifData.actionUrl = payload.actionUrl;
          if (payload.image) notifData.image = payload.image;
          notificationsToInsert.push(notifData);
          sentToUser = true;
        }

        const shouldSendEmail = payload.sendEmail && (prefs?.email ?? true);
        let allowedByPref = true;
        if (payload.type === NotificationType.PROMOTIONAL_OFFER && prefs?.marketingEmails === false) allowedByPref = false;

        if (shouldSendEmail && allowedByPref) {
          emailPromises.push(
            sendEmail({
              email: user.email,
              subject: finalTitle,
              message: finalMessage,
              html: payload.metadata?.html?.replace(/{{userName}}/g, user.fullName)
            }).then(() => true).catch((err) => {
              logger.error({ event: 'notification.broadcast.email.failed', email: user.email, err }, 'Broadcast email error');
              return false;
            })
          );
          sentToUser = true;
        }

        if (sentToUser) successCount++;
        else failureCount++;
      }

      if (notificationsToInsert.length > 0) {
        await Notification.insertMany(notificationsToInsert);
      }
      
      if (emailPromises.length > 0) {
        await Promise.all(emailPromises);
      }
    }
    
    return { successCount, failureCount };
  } catch (error) {
    logger.error({ event: 'notification.broadcast.failed', err: error }, 'Error broadcasting notification');
    return { successCount, failureCount };
  }
};

export const processScheduledNotifications = async () => {
  try {
    const pendingLogs = await NotificationLog.find({
      status: 'Pending',
      scheduledAt: { $lte: new Date() }
    } as any);

    for (const log of pendingLogs) {
      log.status = 'In Progress' as any;
      await log.save();

      const payload: any = {
        title: log.title,
        message: log.message,
        type: log.type,
        priority: log.priority,
        sendEmail: log.sendEmail,
        notificationLogId: log._id as any,
      };

      if (log.actionUrl) payload.actionUrl = log.actionUrl;
      if (log.image) payload.image = log.image;

      const { successCount, failureCount } = await broadcastNotification(payload, log.filters || {});

      log.status = 'Completed' as any;
      log.successCount = successCount;
      log.failureCount = failureCount;
      log.sentAt = new Date();
      await log.save();
    }
  } catch (error) {
    logger.error({ event: 'notification.scheduled.process.failed', err: error }, 'Error processing scheduled notifications');
  }
};
