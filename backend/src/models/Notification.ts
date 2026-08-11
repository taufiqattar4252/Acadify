import mongoose, { Schema, Document, Model } from 'mongoose';

export enum NotificationType {
  WELCOME = 'Welcome',
  SUPPORT = 'Support',
  PAYMENT_SUCCESS = 'Payment Successful',
  PAYMENT_FAILED = 'Payment Failed',
  MOCK_PURCHASED = 'Mock Purchased',
  MOCK_PUBLISHED = 'Mock Published',
  EXAM_REMINDER = 'Exam Reminder',
  EXAM_SUBMITTED = 'Exam Submitted',
  RESULT_PUBLISHED = 'Result Published',
  PROFILE_UPDATED = 'Profile Updated',
  ADMIN_ANNOUNCEMENT = 'Admin Announcement',
  PROMOTIONAL_OFFER = 'Promotional Offer',
  SYSTEM_MAINTENANCE = 'System Maintenance',
}

export enum NotificationPriority {
  LOW = 'Low',
  NORMAL = 'Normal',
  HIGH = 'High',
}
export enum NotificationStatus {
  SENT = 'Sent',
  DELIVERED = 'Delivered',
  READ = 'Read',
}

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  notificationLogId?: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  status: NotificationStatus;
  isRead: boolean;
  readAt?: Date;
  clickedAt?: Date;
  actionUrl?: string;
  image?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    notificationLogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'NotificationLog',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.NORMAL,
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.SENT,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },
    clickedAt: {
      type: Date,
    },
    actionUrl: {
      type: String,
    },
    image: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for getting user's unread notifications efficiently
NotificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

const Notification: Model<INotification> = mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
