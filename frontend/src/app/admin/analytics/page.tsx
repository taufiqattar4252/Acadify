'use client';

import React from 'react';
import { useGetAdminAnalytics } from '@/services/resultApi';
import { Spinner } from '@/components/ui/Spinner';
import { Users, Target, TrendingUp, Clock } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { data: analytics, isLoading, isError } = useGetAdminAnalytics();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (isError || !analytics) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Failed to load analytics data.
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Platform Analytics</h1>
      <p className="text-slate-500">High-level overview of student performance across all mock tests.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase">Total Attempts</p>
            <p className="text-2xl font-bold text-slate-900">{analytics.totalAttempts}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase">Average Score</p>
            <p className="text-2xl font-bold text-slate-900">{analytics.averageScore.toFixed(1)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase">Highest Score</p>
            <p className="text-2xl font-bold text-slate-900">{analytics.highestScore}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 uppercase">Avg Time Taken</p>
            <p className="text-2xl font-bold text-slate-900">{formatTime(analytics.averageTimeTaken)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center text-slate-500">
        <BarChart2 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-700 mb-2">Detailed Reports Coming Soon</h3>
        <p>Mock-specific and Question-specific analytics are being actively developed.</p>
      </div>
    </div>
  );
}

// Need to import BarChart icon
import { BarChart2 } from 'lucide-react';
