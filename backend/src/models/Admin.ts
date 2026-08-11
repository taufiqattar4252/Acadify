import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcrypt';

export enum AdminRole {
  SUPER_ADMIN = 'Super Admin',
  CONTENT_ADMIN = 'Content Admin',
  SUPPORT_ADMIN = 'Support Admin',
}

export interface IAdmin extends Document {
  fullName: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
  password?: string;
  role: AdminRole;
  isActive: boolean;
  resetPasswordToken?: string | undefined;
  resetPasswordExpires?: Date | undefined;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminSchema: Schema = new Schema(
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
    phoneNumber: {
      type: String,
      trim: true,
    },
    profilePicture: {
      type: String,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: Object.values(AdminRole),
      default: AdminRole.CONTENT_ADMIN,
    },
    isActive: {
      type: Boolean,
      default: true,
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

AdminSchema.pre<IAdmin>('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

AdminSchema.index({ email: 1 });

const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
