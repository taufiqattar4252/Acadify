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
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Purchase History</h1>
      <p className="text-gray-600 dark:text-gray-400">View all mock tests purchased using your coupon code.</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm">
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
                  <td colSpan={6} className="p-8 text-center text-gray-500">Loading purchases...</td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">No purchases have been made with your coupon yet.</td>
                </tr>
              ) : (
                purchases.map((purchase: any) => (
                  <tr key={purchase._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-sm">
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {format(new Date(purchase.date), 'dd MMM yyyy HH:mm')}
                    </td>
                    <td className="p-4 font-medium text-gray-800 dark:text-gray-200">
                      {purchase.studentName}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {purchase.mockPurchased}
                    </td>
                    <td className="p-4 font-medium text-indigo-600 dark:text-indigo-400">
                      {purchase.couponUsed}
                    </td>
                    <td className="p-4 text-right text-gray-800 dark:text-gray-200">
                      {formatCurrency(purchase.purchaseAmount)}
                    </td>
                    <td className="p-4 text-right font-bold text-green-600">
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
