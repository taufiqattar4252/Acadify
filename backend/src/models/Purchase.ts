import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './User';
import { IMockTest } from './MockTest';
import { IPayment } from './Payment';

export enum PurchaseStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  REVOKED = 'revoked',
}

export interface IPurchase extends Document {
  user: mongoose.Types.ObjectId | IUser;
  mockTest: mongoose.Types.ObjectId | IMockTest;
  payment?: mongoose.Types.ObjectId | IPayment;
  coupon?: string;
  purchaseDate: Date;
  status: PurchaseStatus;
  amountPaid: number;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    mockTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockTest',
      required: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },
    coupon: {
      type: String,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(PurchaseStatus),
      default: PurchaseStatus.PENDING,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

PurchaseSchema.index({ user: 1, mockTest: 1 }, { unique: true }); // Prevent double buying the same test
PurchaseSchema.index({ user: 1 });
PurchaseSchema.index({ status: 1 });

const Purchase: Model<IPurchase> = mongoose.models.Purchase || mongoose.model<IPurchase>('Purchase', PurchaseSchema);

export default Purchase;
