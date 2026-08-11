import mongoose, { Schema, Document, Model } from 'mongoose';
import { NotificationType } from './Notification';

export interface INotificationTemplate extends Document {
  name: string;
  type: NotificationType;
  subject?: string;
  bodyHtml?: string;
  inAppMessage?: string;
  variables: string[]; // e.g. ['{{userName}}', '{{mockTestName}}']
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationTemplateSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    subject: {
      type: String,
      trim: true,
    },
    bodyHtml: {
      type: String,
    },
    inAppMessage: {
      type: String,
    },
    variables: {
      type: [String],
      default: [],
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

const NotificationTemplate: Model<INotificationTemplate> = mongoose.models.NotificationTemplate || mongoose.model<INotificationTemplate>('NotificationTemplate', NotificationTemplateSchema);

export default NotificationTemplate;
