import mongoose from 'mongoose';
import Partner, { CommissionType } from '../models/Partner';
import Coupon from '../models/Coupon';
import Commission, { CommissionStatus } from '../models/Commission';
import Purchase from '../models/Purchase';
import logger from '../config/logger';

export const processCommission = async (purchaseId: mongoose.Types.ObjectId, couponId: mongoose.Types.ObjectId) => {
  try {
    const coupon = await Coupon.findById(couponId).populate('partner');
    if (!coupon || !coupon.partner) return; // No partner associated with coupon

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) return;

    const partnerId = (coupon.partner as any)._id || coupon.partner;
    const partner = await Partner.findById(partnerId);
    if (!partner || !partner.status) return; // Partner not found or inactive

    // Calculate commission
    let commissionAmount = 0;
    if (partner.commissionType === CommissionType.PERCENTAGE) {
      commissionAmount = (purchase.amountPaid * partner.commissionValue) / 100;
    } else {
      commissionAmount = partner.commissionValue;
    }

    if (commissionAmount <= 0) return;

    // Create Commission Record
    const commission = await Commission.create({
      partner: partner._id,
      student: purchase.user,
      purchase: purchase._id,
      mockTest: purchase.mockTest,
      saleAmount: purchase.amountPaid,
      commissionAmount,
      couponUsed: coupon.code,
      status: CommissionStatus.PENDING,
    });

    // Update Partner Stats
    partner.studentsReferred += 1;
    partner.revenueGenerated += purchase.amountPaid;
    partner.commissionEarned += commissionAmount;
    await partner.save();
    
    // Update Purchase Record to link coupon code for history
    purchase.coupon = coupon.code;
    await purchase.save();

  } catch (error) {
    logger.error({ event: 'commission.process.failed', err: error }, 'Error processing commission');
  }
};
