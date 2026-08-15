'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useGetDashboardData } from '@/services/studentDashboardApi';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  BookOpen, Users, BookMarked, GraduationCap, ChevronDown, CheckCircle, AlertCircle
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export default function StudentDashboardPage() {
  const router = useRouter();
  const { data: response, isLoading } = useGetDashboardData();
  const data = response?.data;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-[60px] w-1/3 rounded-[16px]" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-5 h-[200px] rounded-[24px]" />
          <Skeleton className="lg:col-span-7 h-[200px] rounded-[24px]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="lg:col-span-2 h-[400px] rounded-[32px]" />
          <Skeleton className="lg:col-span-1 h-[400px] rounded-[32px]" />
        </div>
      </div>
    );
  }

  if (!data) return <div className="text-center py-20 text-slate-500">Failed to load dashboard data.</div>;

  const { overview, scoreTrend, subjectPerformance, questionStats } = data;
  const isNewUser = overview.attemptedMocks === 0;

  // Use dummy data if new user
  const displayOverview = isNewUser ? { ...overview, averageScore: 85, accuracy: 78, bestScore: 92, percentile: 65, purchasedMocks: 12, attemptedMocks: 45 } : overview;

  // Bar Chart Data (Course style)
  const baseTrend = isNewUser ? [
    { name: 'Jan', score: 20 }, { name: 'Feb', score: 35 }, { name: 'Mar', score: 15 },
    { name: 'Apr', score: 25 }, { name: 'May', score: 32 }, { name: 'Jun', score: 18 },
    { name: 'Jul', score: 28 }, { name: 'Aug', score: 35 }, { name: 'Sep', score: 22 },
    { name: 'Oct', score: 12 }, { name: 'Nov', score: 28 }, { name: 'Dec', score: 25 }
  ] : scoreTrend.length > 0 ? scoreTrend : [
    { name: 'Jan', score: 0 }, { name: 'Feb', score: 0 } // Fallback empty
  ];

  const displayScoreTrend = baseTrend.map((item: any) => ({
    name: item.name,
    score: item.score || item.percentage,
    remaining: 100 - (item.score || item.percentage || 0)
  }));

  // Donut Chart Data (Exam style)
  const displaySubject = isNewUser ? {
    physics: { accuracy: 70 }, chemistry: { accuracy: 85 }, mathematics: { accuracy: 80 }
  } : subjectPerformance;

  const subjectData = [
    { name: 'Physics', value: displaySubject.physics.accuracy || 1, color: '#10b981' }, // Green
    { name: 'Chemistry', value: displaySubject.chemistry.accuracy || 1, color: '#8b5cf6' }, // Purple
    { name: 'Mathematics', value: displaySubject.mathematics.accuracy || 1, color: '#3b82f6' }, // Blue
  ];

  // Question Stats
  const displayQuestions = isNewUser ? { correct: 85, wrong: 40, skipped: 12 } : questionStats;
  const totalQuestions = (displayQuestions.correct + displayQuestions.wrong + displayQuestions.skipped) || 1;

  // Custom Card Component
  const MetricCard = ({ value, label, icon: Icon, iconColor, iconBg, bottomText, bottomLabel, onClick }: any) => (
    <div 
      onClick={onClick}
      className={`bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between h-full ${onClick ? 'cursor-pointer hover:shadow-md hover:border-slate-200 transition-all hover:-translate-y-1' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-[28px] font-bold text-slate-900 leading-none">{value}</h3>
          <p className="text-xs font-medium text-slate-400 mt-2">{label}</p>
        </div>
        <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-auto pt-2">
        {bottomText && <span className="text-xs font-bold text-slate-700">{bottomText}</span>}
        {bottomLabel && <span className="text-xs font-medium text-slate-400">{bottomLabel}</span>}
      </div>
    </div>
  );

  return (
    <div className="font-sans text-slate-800">

      {/* 1. WELCOME HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-normal text-slate-800">
          Welcome <span className="font-semibold text-slate-900">{overview.studentName}!</span>
        </h1>
        <Button className="!bg-[#10B981] hover:!bg-[#059669] focus:!ring-0 focus:outline-none text-white rounded-full px-6 py-2 h-auto gap-2 text-sm font-medium shadow-md transition-transform active:scale-95" onClick={() => router.push('/dashboard/mock-tests')}>
          <span className="text-lg leading-none mb-0.5">+</span> Buy Mocks
        </Button>
      </div>

      {/* SAMPLE DATA BANNER */}
      {isNewUser && (
        <div
          className="rounded-[20px] border border-[#C7D2FE] p-4 mb-8 flex items-center gap-4"
          style={{ backgroundColor: "#EEF2FF" }}
        >
          <AlertCircle className="w-6 h-6 shrink-0 text-indigo-900" />
          <p className="text-sm font-medium text-indigo-900">
            You are viewing <strong className="text-indigo-700">Sample Analytics</strong>.
            Complete a mock test to see your personalized performance data here!
          </p>
        </div>
      )}

      {/* 2. TOP METRICS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">

        {/* Supervisor Group (Mocks Overview) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <h2 className="text-lg font-medium text-slate-700 ml-1">Mocks Overview</h2>
          <div className="grid grid-cols-2 gap-4 h-full">
            <MetricCard
              value={displayOverview.purchasedMocks} label="Total Purchased"
              icon={BookOpen} iconColor="text-emerald-500" iconBg="bg-emerald-50"
              bottomText={`${displayOverview.purchasedMocks} Tests`} bottomLabel="Available"
              onClick={() => router.push('/dashboard/mock-tests')}
            />
            <MetricCard
              value={displayOverview.attemptedMocks} label="Tests Attempted"
              icon={Users} iconColor="text-blue-500" iconBg="bg-blue-50"
              bottomText={`${displayOverview.attemptedMocks} Attended`} bottomLabel=""
              onClick={() => router.push('/dashboard/results#test-attempts')}
            />
          </div>
        </div>

        {/* Student Overview Group (Performance) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <h2 className="text-lg font-medium text-slate-700 ml-1">Performance Overview</h2>
          <div className="grid grid-cols-3 gap-4 h-full">
            <MetricCard
              value={displayOverview.averageScore} label="Average Score"
              icon={BookMarked} iconColor="text-emerald-500" iconBg="bg-emerald-50"
              bottomText="" bottomLabel=""
              onClick={() => router.push('/dashboard/results')}
            />
            <MetricCard
              value={`${displayOverview.accuracy}%`} label="Overall Accuracy"
              icon={GraduationCap} iconColor="text-blue-500" iconBg="bg-blue-50"
              bottomText="" bottomLabel=""
              onClick={() => router.push('/dashboard/results')}
            />
            <MetricCard
              value={displayOverview.bestScore} label="Best Score"
              icon={GraduationCap} iconColor="text-amber-500" iconBg="bg-amber-50"
              bottomText={`${displayOverview.percentile}th`} bottomLabel="Percentile"
              onClick={() => router.push('/dashboard/results')}
            />
          </div>
        </div>
      </div>

      {/* 3. CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Course (Score Trend) Chart */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-6 pb-2 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-lg font-medium text-slate-700">Score Trend</h3>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-700"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span> Completed</span>
              <span className="flex items-center gap-1.5 text-slate-400"><span className="w-2 h-2 rounded-full bg-[#10b981] opacity-30"></span> In progress</span>
            </div>
          </div>

          <div className="flex-1 w-full min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={displayScoreTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barCategoryGap="15%">
                <defs>
                  <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
                    <rect width="6" height="6" fill="#10b981" fillOpacity="0.1" />
                    <line x1="0" y1="0" x2="0" y2="6" stroke="#10b981" strokeWidth="2" strokeOpacity="0.2" />
                  </pattern>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} />
                <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} />
                <Bar dataKey="score" stackId="a" fill="#10b981" radius={[0, 0, 8, 8]} />
                <Bar dataKey="remaining" stackId="a" fill="url(#diagonalHatch)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Exam (Subject Donut) Chart */}
        <div className="lg:col-span-1 bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-2 px-2">
            <h3 className="text-lg font-medium text-slate-700">Subject Accuracy</h3>
            <div className="flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 cursor-pointer">
              Overall <ChevronDown className="w-3 h-3 ml-1" />
            </div>
          </div>

          <div className="flex-1 relative flex flex-col items-center justify-end mt-4">
            <div className="w-full h-[150px] relative overflow-hidden flex justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={8}
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute bottom-2 flex flex-col items-center pointer-events-none">
                <span className="text-3xl font-bold text-slate-900">{displayOverview.accuracy}%</span>
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">Overall</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-6 px-4">
            {subjectData.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] font-medium text-slate-600">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }}></span>
                {s.name} ({s.value}%)
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. BOTTOM WIDGETS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Question Stats (Subscriptions style) */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-medium text-slate-700 mb-6">Question Stats</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold text-slate-900">{totalQuestions}</span>
              <span className="text-xs text-slate-400 font-medium">Total Attempted</span>
            </div>

            {/* Progress Bar Segmented */}
            <div className="h-3 w-full bg-slate-100 rounded-full flex overflow-hidden mb-6">
              <div style={{ width: `${(displayQuestions.correct / totalQuestions) * 100}%` }} className="bg-[#10b981] h-full border-r-2 border-white"></div>
              <div style={{ width: `${(displayQuestions.wrong / totalQuestions) * 100}%` }} className="bg-[#f59e0b] h-full border-r-2 border-white"></div>
              <div style={{ width: `${(displayQuestions.skipped / totalQuestions) * 100}%` }} className="bg-[#ef4444] h-full"></div>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs font-medium">
            <div className="flex items-center gap-1.5 text-slate-600"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span> Correct <span className="font-bold text-slate-900 ml-0.5">{displayQuestions.correct}</span></div>
            <div className="flex items-center gap-1.5 text-slate-600"><span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span> Wrong <span className="font-bold text-slate-900 ml-0.5">{displayQuestions.wrong}</span></div>
            <div className="flex items-center gap-1.5 text-slate-600"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span> Skipped <span className="font-bold text-slate-900 ml-0.5">{displayQuestions.skipped}</span></div>
          </div>
        </div>

        {/* Study Progress (Video Lessons style) */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <h3 className="text-lg font-medium text-slate-700 mb-6">Study Progress</h3>
          <div className="flex justify-between gap-4 h-full items-end">
            <div className="border border-slate-100 rounded-[16px] p-4 flex-1 flex flex-col justify-between h-24">
              <span className="text-xl font-bold text-slate-900">{isNewUser ? 3 : data.studyProgress.strongChapters.length}</span>
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-medium text-slate-400">Chapters Strong</span>
                <div className="w-1 h-6 bg-[#10b981] rounded-full"></div>
              </div>
            </div>
            <div className="border border-slate-100 rounded-[16px] p-4 flex-1 flex flex-col justify-between h-24">
              <span className="text-xl font-bold text-slate-900">{isNewUser ? 5 : data.studyProgress.needsRevision}</span>
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-medium text-slate-400">Needs Practice</span>
                <div className="w-1 h-4 bg-[#8b5cf6] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity (Questions style) */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
          <h3 className="text-lg font-medium text-slate-700 mb-6">Activity</h3>
          <div className="flex justify-between gap-4 h-full items-end">
            <div 
              onClick={() => router.push('/dashboard/mock-tests')}
              className="border border-slate-100 rounded-[16px] p-4 flex-1 flex items-center justify-between h-24 cursor-pointer hover:shadow-md hover:border-slate-200 transition-all hover:-translate-y-1"
            >
              <div>
                <div className="text-xl font-bold text-slate-900 mb-1">{displayOverview.purchasedMocks}</div>
                <div className="text-[10px] font-medium text-slate-400">Total Mocks</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div 
              onClick={() => router.push('/dashboard/results#test-attempts')}
              className="border border-slate-100 rounded-[16px] p-4 flex-1 flex items-center justify-between h-24 cursor-pointer hover:shadow-md hover:border-slate-200 transition-all hover:-translate-y-1"
            >
              <div>
                <div className="text-xl font-bold text-slate-900 mb-1">{displayOverview.attemptedMocks}</div>
                <div className="text-[10px] font-medium text-slate-400">Completed</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
