import mongoose, { Document, Schema, Model } from 'mongoose';
import { IPartner } from './Partner';
import { IUser } from './User';
import { IPurchase } from './Purchase';
import { IMockTest } from './MockTest';

export enum CommissionStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  PAID = 'Paid',
  REJECTED = 'Rejected',
}

export interface ICommission extends Document {
  partner: mongoose.Types.ObjectId | IPartner;
  student: mongoose.Types.ObjectId | IUser;
  purchase: mongoose.Types.ObjectId | IPurchase;
  mockTest: mongoose.Types.ObjectId | IMockTest;
  saleAmount: number;
  commissionAmount: number;
  couponUsed: string;
  status: CommissionStatus;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionSchema: Schema = new Schema(
  {
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Purchase',
      required: true,
    },
    mockTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockTest',
      required: true,
    },
    saleAmount: {
      type: Number,
      required: true,
    },
    commissionAmount: {
      type: Number,
      required: true,
    },
    couponUsed: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(CommissionStatus),
      default: CommissionStatus.PENDING,
    },
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

CommissionSchema.index({ partner: 1 });
CommissionSchema.index({ student: 1 });
CommissionSchema.index({ purchase: 1 });
CommissionSchema.index({ status: 1 });

const Commission: Model<ICommission> = mongoose.models.Commission || mongoose.model<ICommission>('Commission', CommissionSchema);

export default Commission;
