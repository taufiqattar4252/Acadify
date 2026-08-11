import mongoose, { Schema, Document, Model } from 'mongoose';
import { NotificationType, NotificationPriority } from './Notification';

export enum NotificationLogStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  FAILED = 'Failed',
  CANCELLED = 'Cancelled',
}

export interface INotificationLog extends Document {
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  targetAudience: string;
  filters?: any;
  sendEmail: boolean;
  sendInApp: boolean;
  actionUrl?: string;
  image?: string;
  status: NotificationLogStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  successCount: number;
  failureCount: number;
  readCount: number;
  clickCount: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationLogSchema: Schema = new Schema(
  {
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
    },
    priority: {
      type: String,
      enum: Object.values(NotificationPriority),
      default: NotificationPriority.NORMAL,
    },
    targetAudience: {
      type: String,
      required: true,
    },
    filters: {
      type: Schema.Types.Mixed,
    },
    sendEmail: {
      type: Boolean,
      default: false,
    },
    sendInApp: {
      type: Boolean,
      default: true,
    },
    actionUrl: {
      type: String,
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      enum: Object.values(NotificationLogStatus),
      default: NotificationLogStatus.COMPLETED,
    },
    scheduledAt: {
      type: Date,
    },
    sentAt: {
      type: Date,
    },
    successCount: {
      type: Number,
      default: 0,
    },
    failureCount: {
      type: Number,
      default: 0,
    },
    readCount: {
      type: Number,
      default: 0,
    },
    clickCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const NotificationLog: Model<INotificationLog> = mongoose.models.NotificationLog || mongoose.model<INotificationLog>('NotificationLog', NotificationLogSchema);

export default NotificationLog;
