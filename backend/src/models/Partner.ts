import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export enum CommissionType {
  PERCENTAGE = 'percentage',
  FLAT = 'flat',
}

export interface IPartner extends Document {
  fullName: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  password?: string;
  role: string;
  status: boolean; // true = Active, false = Inactive
  commissionType: CommissionType;
  commissionValue: number;
  studentsReferred: number;
  revenueGenerated: number;
  commissionEarned: number;
  commissionPaid: number;
  resetPasswordToken?: string | undefined;
  resetPasswordExpires?: Date | undefined;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const PartnerSchema: Schema = new Schema(
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
    phone: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    profilePhoto: {
      type: String,
      default: '',
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
    role: {
      type: String,
      default: 'Partner',
    },
    commissionType: {
      type: String,
      enum: Object.values(CommissionType),
      default: CommissionType.PERCENTAGE,
    },
    commissionValue: {
      type: Number,
      required: true,
      default: 15,
      min: 0,
    },
    studentsReferred: {
      type: Number,
      default: 0,
    },
    revenueGenerated: {
      type: Number,
      default: 0,
    },
    commissionEarned: {
      type: Number,
      default: 0,
    },
    commissionPaid: {
      type: Number,
      default: 0,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

PartnerSchema.pre<IPartner>('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

PartnerSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

PartnerSchema.index({ email: 1 });
PartnerSchema.index({ phone: 1 });

const Partner: Model<IPartner> = mongoose.models.Partner || mongoose.model<IPartner>('Partner', PartnerSchema);

export default Partner;
