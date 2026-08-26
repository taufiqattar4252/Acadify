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
      <div className="bg-destructive-light text-destructive p-4 rounded-lg">
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
      <h1 className="text-2xl font-bold text-foreground">Platform Analytics</h1>
      <p className="text-muted-foreground">High-level overview of student performance across all mock tests.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase">Total Attempts</p>
            <p className="text-2xl font-bold text-foreground">{analytics.totalAttempts}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-success-light text-success flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase">Average Score</p>
            <p className="text-2xl font-bold text-foreground">{(analytics.averageScore || 0).toFixed(1)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase">Highest Score</p>
            <p className="text-2xl font-bold text-foreground">{analytics.highestScore}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-border shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-warning-light text-warning flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground uppercase">Avg Time Taken</p>
            <p className="text-2xl font-bold text-foreground">{formatTime(analytics.averageTimeTaken)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border shadow-sm p-12 text-center text-muted-foreground">
        <BarChart2 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-muted-foreground mb-2">Detailed Reports Coming Soon</h3>
        <p>Mock-specific and Question-specific analytics are being actively developed.</p>
      </div>
    </div>
  );
}

// Need to import BarChart icon
import { BarChart2 } from 'lucide-react';
