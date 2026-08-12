'use client';

import React from 'react';
import { useDashboardStats, useRecentActivity, useChartData, Activity } from '@/services/adminApi';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { RevenueChart } from '@/components/admin/charts/RevenueChart';
import { SubjectDistributionChart } from '@/components/admin/charts/SubjectDistributionChart';
import {
  Users,
  HelpCircle,
  FileText,
  IndianRupee,
  History,
  ShoppingCart,
  Plus,
  BookOpen
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useUser } from '@/services/authApi';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const { data: user } = useUser();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: activities, isLoading: activitiesLoading } = useRecentActivity();
  const { data: charts, isLoading: chartsLoading } = useChartData();

  const activityColumns = [
    { key: 'action', header: 'Action', cell: (item: Activity) => <span className="font-medium text-slate-900">{item.action}</span> },
    { key: 'target', header: 'Target', cell: (item: Activity) => <span className="text-slate-600">{item.target}</span> },
    { key: 'user', header: 'User', cell: (item: Activity) => <span className="text-slate-600">{item.user}</span> },
    { key: 'date', header: 'Date', cell: (item: Activity) => <span className="text-slate-500 text-sm">{item.date}</span> },
    {
      key: 'status', header: 'Status', cell: (item: Activity) => {
        const variants: Record<string, 'success' | 'warning' | 'danger'> = {
          completed: 'success',
          pending: 'warning',
          failed: 'danger',
        };
        return <Badge variant={variants[item.status]}>{item.status}</Badge>;
      }
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Welcome <span className="font-normal text-slate-600">{user?.fullName?.split(' ')[0] || 'Admin'}!</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/mock-tests/create">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Create Exam
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid - Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {statsLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-[140px] rounded-[24px]" />)
        ) : stats ? (
          <>
            <StatCard
              title="Total Revenue"
              value={`₹${(stats.revenue / 1000).toFixed(2)}k`}
              icon={IndianRupee}
              trend={{ value: 12.5, label: 'vs last month' }}
            />
            <StatCard
              title="Total Students"
              value={stats.totalStudents.toLocaleString()}
              icon={Users}
              trend={{ value: 5.2, label: 'vs last month' }}
            />
            <StatCard
              title="Total Exams"
              value={stats.totalMockTests}
              icon={FileText}
              trend={{ value: 8.4, label: 'vs last month' }}
            />
            <StatCard
              title="Unregistered/Leads"
              value="12"
              icon={Users}
            />
          </>
        ) : null}
      </div>

      {/* Charts Row - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Revenue & Activity</h3>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#1D293D]"></div> Completed</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#1D293D] opacity-30"></div> In progress</span>
              </div>
            </div>
            {chartsLoading ? (
              <Skeleton className="h-[300px] rounded-xl" />
            ) : charts ? (
              <RevenueChart data={charts.revenue} />
            ) : null}
          </Card>
        </div>
        <div className="lg:col-span-1">
          <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-slate-900">Exam Overview</h3>
              <select className="bg-slate-50 border border-slate-200 rounded-full px-3 py-1 text-sm text-slate-600 outline-none">
                <option>January</option>
                <option>February</option>
              </select>
            </div>

            {/* Custom SVG Half-donut to mimic Lumina */}
            <div className="flex-1 flex flex-col items-center justify-center relative my-4">
              <svg viewBox="0 0 200 100" className="w-full max-w-[250px]">
                <defs>
                  <pattern id="stripes" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(0)">
                    <line x1="0" y1="4" x2="8" y2="4" stroke="#a7f3d0" strokeWidth="3" />
                  </pattern>
                </defs>
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="url(#stripes)" strokeWidth="30" pathLength="100" strokeDasharray="36 100" strokeDashoffset="0" />
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#8b5cf6" strokeWidth="30" pathLength="100" strokeDasharray="26 100" strokeDashoffset="-38" />
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#38bdf8" strokeWidth="30" pathLength="100" strokeDasharray="16 100" strokeDashoffset="-66" />
                <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="#fbbf24" strokeWidth="30" pathLength="100" strokeDasharray="16 100" strokeDashoffset="-84" />
              </svg>
              <div className="absolute bottom-0 text-center">
                <p className="text-4xl font-bold text-slate-900 leading-none">{stats?.totalMockTests || 1200}</p>
                <p className="text-xs font-medium text-slate-400 mt-1">Total Exam</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 text-sm text-slate-600">
              <div className="flex items-center gap-2 font-medium">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-300"></div>
                Exams Active ({stats?.totalMockTests || 0})
              </div>
              <div className="flex items-center gap-2 font-medium">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
                Exams Inactive (0)
              </div>
              <div className="flex items-center gap-2 font-medium">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-400"></div>
                Used in courses (0)
              </div>
              <div className="flex items-center gap-2 font-medium">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                Exams added (12)
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-slate-900 mb-6">Subject Distribution</h3>
          {chartsLoading ? (
            <Skeleton className="h-[200px]" />
          ) : charts ? (
            <SubjectDistributionChart data={charts.subjects} />
          ) : null}
        </Card>

        <Card className="flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Mock Tests Breakdown</h3>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center">
              <p className="text-xs font-medium text-slate-500 mb-1">Full Mock Tests</p>
              <p className="text-xl font-bold text-slate-900">{stats?.totalFullMockTests}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center">
              <p className="text-xs font-medium text-slate-500 mb-1">Chapter-wise</p>
              <p className="text-xl font-bold text-slate-900">{stats?.totalChapterWiseTests}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-center">
              <p className="text-xs font-medium text-slate-500 mb-1">PYQ Papers</p>
              <p className="text-xl font-bold text-slate-900">{stats?.totalPyqPapers}</p>
            </div>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Questions</h3>
          <div className="flex gap-4">
            <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats?.totalQuestions}</p>
                <p className="text-xs font-medium text-slate-400">Total QS</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-500 flex items-center justify-center">
                <HelpCircle className="w-5 h-5" />
              </div>
            </div>
            <div className="flex-1 bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900">24</p>
                <p className="text-xs font-medium text-slate-400">Questions Added</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-500 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
        </div>
        <div className="px-6 pb-6">
          <DataTable
            data={activities || []}
            columns={activityColumns}
            keyExtractor={(item) => item.id}
            isLoading={activitiesLoading}
          />
        </div>
      </Card>
    </div>
  );
}
