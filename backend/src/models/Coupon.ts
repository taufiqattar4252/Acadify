import mongoose, { Document, Schema, Model } from 'mongoose';

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FLAT = 'flat',
}

export interface ICoupon extends Document {
  code: string;
  discountType: DiscountType;
  discountValue: number; // percentage value (e.g., 20) or flat amount (e.g., 500)
  minOrderValue: number;
  maxDiscount?: number; // only applicable for percentage discounts
  expiryDate: Date;
  isActive: boolean;
  partner?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema: Schema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    discountType: {
      type: String,
      enum: Object.values(DiscountType),
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },
    minOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxDiscount: {
      type: Number,
      min: 0,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    partner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Partner',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1, expiryDate: 1 });

const Coupon: Model<ICoupon> = mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);

export default Coupon;
