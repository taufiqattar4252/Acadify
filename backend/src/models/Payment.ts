import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './User';
import { IMockTest } from './MockTest';

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  CANCELLED = 'cancelled',
}

export interface IPayment extends Document {
  user: mongoose.Types.ObjectId | IUser;
  mockTest?: mongoose.Types.ObjectId | IMockTest;
  cart?: mongoose.Types.ObjectId;
  paymentGateway: string; // e.g., 'razorpay'
  orderId: string;
  paymentId?: string;
  signature?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  transactionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mockTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockTest',
    },
    cart: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Cart',
    },
    paymentGateway: {
      type: String,
      required: true,
      default: 'razorpay',
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentId: {
      type: String,
      sparse: true,
      unique: true, // Only when payment is completed
    },
    signature: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: 'INR',
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    transactionDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

PaymentSchema.index({ user: 1 });
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ paymentId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ mockTest: 1 });

const Payment: Model<IPayment> = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
