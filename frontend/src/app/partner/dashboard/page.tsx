'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPartnerDashboard } from '@/services/partnerApi';
import { Ticket, Users, Banknote, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

export default function PartnerDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['partnerDashboard'],
    queryFn: getPartnerDashboard,
  });

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
  }

  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-indigo-100 mb-6">Here is what's happening with your affiliate account today.</p>
        
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 inline-block">
          <p className="text-sm font-medium text-indigo-100 uppercase tracking-wider mb-1">Your Primary Coupon Code</p>
          <div className="flex items-center gap-3">
            <Ticket size={24} className="text-yellow-400" />
            <span className="text-2xl font-mono font-bold tracking-widest">{stats.couponCode || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Referrals</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{stats.studentsReferred || 0}</h3>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Users size={20} />
            </div>
          </div>
        </div>


        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Commission</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{formatCurrency(stats.commissionEarned || 0)}</h3>
            </div>
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Banknote size={20} />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Payout</p>
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{formatCurrency(stats.pendingCommission || 0)}</h3>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg">
              <Banknote size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center items-center text-center">
           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Monthly Earnings</h3>
           <p className="text-4xl font-bold text-green-600 mb-2">{formatCurrency(stats.monthlyEarnings || 0)}</p>
           <p className="text-sm text-gray-500 dark:text-gray-400">Earned so far this month</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col justify-center items-center text-center">
           <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">Total Paid Out</h3>
           <p className="text-4xl font-bold text-indigo-600 mb-2">{formatCurrency(stats.paidCommission || 0)}</p>
           <p className="text-sm text-gray-500 dark:text-gray-400">Total amount transferred to your account</p>
        </div>
      </div>
    </div>
  );
}
