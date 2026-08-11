'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPartnerCommissions } from '@/services/partnerApi';
import { formatCurrency } from '@/utils/currency';
import { format } from 'date-fns';

export default function PartnerCommissionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['partnerCommissions'],
    queryFn: getPartnerCommissions,
  });

  const commissions = data?.commissions || [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Commission History</h1>
      <p className="text-gray-600 dark:text-gray-400">Track your earnings and payout statuses.</p>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 text-sm">
                <th className="p-4 font-medium">Generated On</th>
                <th className="p-4 font-medium">Purchase Reference</th>
                <th className="p-4 font-medium">Amount</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium text-right">Paid On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Loading commissions...</td>
                </tr>
              ) : commissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">No commissions earned yet.</td>
                </tr>
              ) : (
                commissions.map((commission: any) => (
                  <tr key={commission._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition text-sm">
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                      {format(new Date(commission.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="p-4 text-gray-600 dark:text-gray-300">
                       Purchase on {format(new Date(commission.purchase?.purchaseDate || commission.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="p-4 font-bold text-gray-800 dark:text-gray-200">
                      {formatCurrency(commission.commissionAmount)}
                    </td>
                    <td className="p-4">
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            commission.status === 'Paid' ? 'bg-green-100 text-green-700' :
                            commission.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {commission.status}
                       </span>
                    </td>
                    <td className="p-4 text-right text-gray-600 dark:text-gray-400">
                      {commission.paidAt ? format(new Date(commission.paidAt), 'dd MMM yyyy') : '-'}
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
