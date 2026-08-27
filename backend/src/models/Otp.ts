import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
  email: string;
  otp: string;
  createdAt: Date;
}

const otpSchema = new Schema<IOtp>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: [true, 'OTP is required'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // 10 minutes (600 seconds)
  },
});

const Otp = mongoose.model<IOtp>('Otp', otpSchema);

export default Otp;
