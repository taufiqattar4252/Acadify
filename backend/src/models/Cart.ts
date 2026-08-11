import mongoose, { Document, Schema, Model } from 'mongoose';
import { IUser } from './User';
import { IMockTest } from './MockTest';
import { ICoupon } from './Coupon';

export interface ICartItem {
  mockTest: mongoose.Types.ObjectId | IMockTest;
  price: number;
  addedAt: Date;
}

export interface ICart extends Document {
  user: mongoose.Types.ObjectId | IUser;
  items: ICartItem[];
  coupon?: mongoose.Types.ObjectId | ICoupon;
  subtotal: number;
  discount: number;
  finalTotal: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema(
  {
    mockTest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MockTest',
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const CartSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [CartItemSchema],
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    finalTotal: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Cart: Model<ICart> = mongoose.models.Cart || mongoose.model<ICart>('Cart', CartSchema);

export default Cart;
