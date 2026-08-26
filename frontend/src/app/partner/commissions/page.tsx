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
      <h1 className="text-2xl font-bold text-foreground dark:text-white">Commission History</h1>
      <p className="text-muted-foreground dark:text-muted-foreground">Track your earnings and payout statuses.</p>

      <div className="bg-white dark:bg-card rounded-xl shadow-sm border border-border dark:border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted dark:bg-muted/50 text-muted-foreground dark:text-muted-foreground text-sm">
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
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">Loading commissions...</td>
                </tr>
              ) : commissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">No commissions earned yet.</td>
                </tr>
              ) : (
                commissions.map((commission: any) => (
                  <tr key={commission._id} className="hover:bg-muted dark:hover:bg-muted/50 transition text-sm">
                    <td className="p-4 text-muted-foreground dark:text-gray-300">
                      {format(new Date(commission.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="p-4 text-muted-foreground dark:text-gray-300">
                       Purchase on {format(new Date(commission.purchase?.purchaseDate || commission.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="p-4 font-bold text-foreground dark:text-gray-200">
                      {formatCurrency(commission.commissionAmount)}
                    </td>
                    <td className="p-4">
                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            commission.status === 'Paid' ? 'bg-success-light text-success' :
                            commission.status === 'Pending' ? 'bg-warning-light text-warning' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {commission.status}
                       </span>
                    </td>
                    <td className="p-4 text-right text-muted-foreground dark:text-muted-foreground">
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
