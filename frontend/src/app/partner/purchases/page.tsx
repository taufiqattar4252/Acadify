'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPartnerPurchases } from '@/services/partnerApi';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';

export default function PartnerPurchasesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['partnerPurchases'],
    queryFn: getPartnerPurchases,
  });

  const purchases = data?.purchases || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground dark:text-white">Purchase History</h1>
      <p className="text-muted-foreground dark:text-muted-foreground">View all mock tests purchased using your coupon code.</p>

      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border dark:border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted dark:bg-muted/50 text-muted-foreground dark:text-muted-foreground text-sm">
                <th className="p-4 font-medium">Date</th>
                <th className="p-4 font-medium">Student</th>
                <th className="p-4 font-medium">Mock Test</th>
                <th className="p-4 font-medium">Coupon Used</th>
                <th className="p-4 font-medium text-right">Purchase Amount</th>
                <th className="p-4 font-medium text-right">Your Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">Loading purchases...</td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-muted-foreground">No purchases have been made with your coupon yet.</td>
                </tr>
              ) : (
                purchases.map((purchase: any) => (
                  <tr key={purchase._id} className="hover:bg-muted dark:hover:bg-muted/50 transition text-sm">
                    <td className="p-4 text-muted-foreground dark:text-gray-300">
                      {format(new Date(purchase.date), 'dd MMM yyyy HH:mm')}
                    </td>
                    <td className="p-4 font-medium text-foreground dark:text-gray-200">
                      {purchase.studentName}
                    </td>
                    <td className="p-4 text-muted-foreground dark:text-gray-300">
                      {purchase.mockPurchased}
                    </td>
                    <td className="p-4 font-medium text-primary dark:text-indigo-400">
                      {purchase.couponUsed}
                    </td>
                    <td className="p-4 text-right text-foreground dark:text-gray-200">
                      {formatCurrency(purchase.purchaseAmount)}
                    </td>
                    <td className="p-4 text-right font-bold text-success">
                      {formatCurrency(purchase.commission)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
