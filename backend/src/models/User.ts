import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export enum UserRole {
  STUDENT = 'student',
}

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  avatar?: string;
  phone?: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  verificationToken?: string | undefined;
  verificationTokenExpires?: Date | undefined;
  resetPasswordToken?: string | undefined;
  resetPasswordExpires?: Date | undefined;
  lastLogin?: Date;
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
    examReminders: boolean;
    resultNotifications: boolean;
    marketingEmails: boolean;
    systemAnnouncements: boolean;
  };
  deviceTokens: string[];
  goals: {
    targetScore: number;
    targetPercentile: number;
    targetCollege: string;
    targetExamYear?: number;
    stream?: string;
  };
  referralCode?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    verificationToken: String,
    verificationTokenExpires: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: {
      type: Date,
    },
    notificationPreferences: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
      examReminders: { type: Boolean, default: true },
      resultNotifications: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: true },
      systemAnnouncements: { type: Boolean, default: true },
    },
    deviceTokens: {
      type: [String],
      default: [],
    },
    goals: {
      targetScore: { type: Number, default: 0 },
      targetPercentile: { type: Number, default: 0 },
      targetCollege: { type: String, default: '' },
      targetExamYear: { type: Number },
      stream: { type: String, enum: ['PCM', 'PCB'] },
    },
    referralCode: { type: String },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre<IUser>('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};


UserSchema.index({ phone: 1 }, { unique: true, sparse: true }); // Sparse ensures multiple nulls don't trigger unique violation

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
