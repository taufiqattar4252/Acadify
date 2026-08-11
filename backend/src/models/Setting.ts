import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISetting extends Document {
  general: {
    platformName: string;
    platformLogo: string;
    favicon: string;
    supportEmail: string;
    supportPhone: string;
    maintenanceMode: boolean;
  };
  exam: {
    defaultDuration: number;
    defaultNegativeMarking: number;
    autoSubmit: boolean;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;
    passingPercentage: number;
  };
  payment: {
    razorpayKeyId: string;
    razorpaySecret: string;
    webhookSecret: string;
    currency: string;
    taxPercentage: number;
    refundPolicy: boolean;
  };
  email: {
    provider: string;
    senderName: string;
    senderEmail: string;
    apiKey: string;
  };
  notifications: {
    emailEnabled: boolean;
    inAppEnabled: boolean;
    examReminders: boolean;
    resultNotifications: boolean;
    marketingEmails: boolean;
  };
  roles: {
    // Basic structure for any role settings if needed, often just managed in the Admin schema but good to have a placeholder
  };
  branding: {
    websiteLogo: string;
    darkLogo: string;
    favicon: string;
    primaryColor: string;
    secondaryColor: string;
    footerText: string;
    socialLinks: {
      facebook: string;
      twitter: string;
      instagram: string;
      linkedin: string;
    };
    seoTitle: string;
    seoDescription: string;
  };
  security: {
    sessionTimeout: number; // in minutes
    jwtExpiry: string; // e.g., '1d', '7d'
    passwordPolicy: string; // e.g., 'strong', 'medium'
    maxLoginAttempts: number;
    twoFactorEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema: Schema = new Schema(
  {
    general: {
      platformName: { type: String, default: 'Acadify' },
      platformLogo: { type: String, default: '' },
      favicon: { type: String, default: '' },
      supportEmail: { type: String, default: 'support@acadify.com' },
      supportPhone: { type: String, default: '' },
      maintenanceMode: { type: Boolean, default: false },
    },
    exam: {
      defaultDuration: { type: Number, default: 60 },
      defaultNegativeMarking: { type: Number, default: 0 },
      autoSubmit: { type: Boolean, default: true },
      shuffleQuestions: { type: Boolean, default: false },
      shuffleOptions: { type: Boolean, default: false },
      passingPercentage: { type: Number, default: 35 },
    },
    payment: {
      razorpayKeyId: { type: String, default: '' },
      razorpaySecret: { type: String, default: '' },
      webhookSecret: { type: String, default: '' },
      currency: { type: String, default: 'INR' },
      taxPercentage: { type: Number, default: 18 },
      refundPolicy: { type: Boolean, default: false },
    },
    email: {
      provider: { type: String, default: 'smtp' },
      senderName: { type: String, default: 'Acadify Support' },
      senderEmail: { type: String, default: 'noreply@acadify.com' },
      apiKey: { type: String, default: '' },
    },
    notifications: {
      emailEnabled: { type: Boolean, default: true },
      inAppEnabled: { type: Boolean, default: true },
      examReminders: { type: Boolean, default: true },
      resultNotifications: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
    },
    roles: {
      type: Schema.Types.Mixed,
      default: {},
    },
    branding: {
      websiteLogo: { type: String, default: '' },
      darkLogo: { type: String, default: '' },
      favicon: { type: String, default: '' },
      primaryColor: { type: String, default: '#10B981' },
      secondaryColor: { type: String, default: '#6366F1' },
      footerText: { type: String, default: '© 2026 Acadify. All rights reserved.' },
      socialLinks: {
        facebook: { type: String, default: '' },
        twitter: { type: String, default: '' },
        instagram: { type: String, default: '' },
        linkedin: { type: String, default: '' },
      },
      seoTitle: { type: String, default: 'Acadify - MHT-CET Mock Tests' },
      seoDescription: { type: String, default: 'Best platform for MHT-CET preparation.' },
    },
    security: {
      sessionTimeout: { type: Number, default: 120 },
      jwtExpiry: { type: String, default: '1d' },
      passwordPolicy: { type: String, default: 'medium' },
      maxLoginAttempts: { type: Number, default: 5 },
      twoFactorEnabled: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Ensure only one document exists (Singleton pattern)
SettingSchema.pre('save', async function () {
  if (this.isNew) {
    const count = await mongoose.model('Setting').countDocuments();
    if (count > 0) {
      throw new Error('Only one settings document can be created.');
    }
  }
});

const Setting: Model<ISetting> = mongoose.models.Setting || mongoose.model<ISetting>('Setting', SettingSchema);

export default Setting;
