'use client';

import React, { useState, useRef, useEffect } from 'react';
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
  const [pageIndex, setPageIndex] = useState(0);
  const [subjectFilter, setSubjectFilter] = useState('Overall');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: any) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  if (!data) return <div className="text-center py-20 text-muted-foreground">Failed to load dashboard data.</div>;

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

  let startIndex = baseTrend.length - (pageIndex + 1) * 10;
  let endIndex = baseTrend.length - pageIndex * 10;

  // Always show exactly 10 if we have at least 10 tests
  if (startIndex < 0) {
    startIndex = 0;
    endIndex = Math.min(10, baseTrend.length);
  }

  const filteredTrend = baseTrend.slice(startIndex, endIndex);

  const displayScoreTrend = filteredTrend.map((item: any) => ({
    name: item.name,
    fullTestName: item.fullTestName,
    score: item.score !== undefined ? item.score : item.percentage,
    totalMarks: item.totalMarks || 100, // fallback to 100 if missing
    correct: item.correct || 0,
    wrong: item.wrong || 0,
    skipped: item.skipped || 0,
    remaining: 100 - (item.score || item.percentage || 0)
  }));

  // Donut Chart Data (Exam style)
  const displaySubject = isNewUser ? {
    physics: { accuracy: 70, correct: 10, wrong: 2, skipped: 3 },
    chemistry: { accuracy: 85, correct: 15, wrong: 1, skipped: 1 },
    mathematics: { accuracy: 80, correct: 12, wrong: 2, skipped: 2 }
  } : subjectPerformance;

  let subjectData = [];
  let currentSubjectAccuracy = 0;

  if (subjectFilter === 'Overall') {
    subjectData = [
      { name: 'Physics', value: displaySubject?.physics?.accuracy || 1, color: '#10b981' }, // Green
      { name: 'Chemistry', value: displaySubject?.chemistry?.accuracy || 1, color: '#8b5cf6' }, // Purple
      { name: 'Mathematics', value: displaySubject?.mathematics?.accuracy || 1, color: '#3b82f6' }, // Blue
    ];
  } else {
    const selectedSubject: any = subjectFilter === 'Physics' ? displaySubject?.physics :
      subjectFilter === 'Chemistry' ? displaySubject?.chemistry :
        displaySubject?.mathematics;

    const c = selectedSubject?.correct || 0;
    const w = selectedSubject?.wrong || 0;
    const s = selectedSubject?.skipped || 0;
    const total = c + w + s;
    currentSubjectAccuracy = total > 0 ? Math.round((c / total) * 100) : 0;

    subjectData = [
      { name: 'Correct', value: c, color: '#10b981' },
      { name: 'Wrong', value: w, color: '#ef4444' },
      { name: 'Unattempted', value: s, color: '#cbd5e1' },
    ].filter(item => item.value > 0); // Hide empty slices

    if (subjectData.length === 0) {
      subjectData = [{ name: 'No Data', value: 1, color: '#f1f5f9' }];
    }
  }

  // Question Stats
  const displayQuestions = isNewUser ? { correct: 85, wrong: 40, skipped: 12 } : questionStats;
  const totalQuestions = (displayQuestions.correct + displayQuestions.wrong + displayQuestions.skipped) || 1;

  const strongChaptersList = isNewUser ? ['Kinematics', 'Laws of Motion', 'Work Energy & Power'] : data?.studyProgress?.strongChapters || [];
  const weakChaptersList = isNewUser ? ['Thermodynamics', 'Optics', 'Electrostatics', 'Magnetism'] : data?.studyProgress?.weakChapters || [];

  // Custom Card Component
  const MetricCard = ({ value, label, icon: Icon, iconColor, iconBg, bottomText, bottomLabel, onClick }: any) => (
    <div
      onClick={onClick}
      className={`bg-white rounded-[24px] p-6 shadow-sm border border-border flex flex-col justify-between h-full ${onClick ? 'cursor-pointer hover:shadow-md hover:border-border transition-all hover:-translate-y-1' : ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-[28px] font-bold text-foreground leading-none">{value}</h3>
          <p className="text-xs font-medium text-muted-foreground mt-2">{label}</p>
        </div>
        <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div className="flex items-center gap-2 mt-auto pt-2">
        {bottomText && <span className="text-xs font-bold text-muted-foreground">{bottomText}</span>}
        {bottomLabel && <span className="text-xs font-medium text-muted-foreground">{bottomLabel}</span>}
      </div>
    </div>
  );

  return (
    <div className="font-sans text-foreground">

      {/* 1. WELCOME HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-normal text-foreground">
          Welcome <span className="font-semibold text-foreground">{overview.studentName}!</span>
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
            You are viewing <strong className="text-primary">Sample Analytics</strong>.
            Complete a mock test to see your personalized performance data here!
          </p>
        </div>
      )}

      {/* 2. TOP METRICS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">

        {/* Supervisor Group (Mocks Overview) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <h2 className="text-lg font-medium text-muted-foreground ml-1">Mocks Overview</h2>
          <div className="grid grid-cols-2 gap-4 h-full">
            <MetricCard
              value={displayOverview.purchasedMocks} label="Total Purchased"
              icon={BookOpen} iconColor="text-success" iconBg="bg-success-light"
              bottomText={`${displayOverview.purchasedMocks} Tests`} bottomLabel="Available"
              onClick={() => router.push('/dashboard/mock-tests')}
            />
            <MetricCard
              value={displayOverview.attemptedMocks} label="Tests Attempted"
              icon={Users} iconColor="text-primary" iconBg="bg-primary-light"
              bottomText={`${displayOverview.attemptedMocks} Attended`} bottomLabel=""
              onClick={() => router.push('/dashboard/results#test-attempts')}
            />
          </div>
        </div>

        {/* Student Overview Group (Performance) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <h2 className="text-lg font-medium text-muted-foreground ml-1">Performance Overview</h2>
          <div className="grid grid-cols-3 gap-4 h-full">
            <MetricCard
              value={displayOverview.averageScore} label="Average Score"
              icon={BookMarked} iconColor="text-success" iconBg="bg-success-light"
              bottomText="" bottomLabel=""
              onClick={() => router.push('/dashboard/results')}
            />
            <MetricCard
              value={`${displayOverview.accuracy}%`} label="Overall Accuracy"
              icon={GraduationCap} iconColor="text-primary" iconBg="bg-primary-light"
              bottomText="" bottomLabel=""
              onClick={() => router.push('/dashboard/results')}
            />
            <MetricCard
              value={displayOverview.bestScore} label="Best Score"
              icon={GraduationCap} iconColor="text-warning" iconBg="bg-warning-light"
              bottomText={`${displayOverview.percentile}th`} bottomLabel="Percentile"
              onClick={() => router.push('/dashboard/results')}
            />
          </div>
        </div>
      </div>

      {/* 3. CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Course (Score Trend) Chart */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-6 pb-2 shadow-sm border border-border flex flex-col">
          <div className="flex justify-between items-center mb-6 px-2">
            <h3 className="text-lg font-medium text-muted-foreground">Score Trend</h3>

            {baseTrend.length > 10 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPageIndex(p => p + 1)}
                  disabled={startIndex <= 0}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold"
                >
                  &lt;
                </button>
                <span className="text-[10px] font-medium text-muted-foreground w-12 text-center">
                  {startIndex + 1}-{endIndex}
                </span>
                <button
                  onClick={() => setPageIndex(p => p - 1)}
                  disabled={pageIndex === 0}
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-muted-hover disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-xs font-bold"
                >
                  &gt;
                </button>
              </div>
            )}
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
                <RechartsTooltip
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-border min-w-[150px]">
                          <p className="font-bold text-foreground text-sm mb-2">{data.fullTestName || label}</p>
                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-xs">
                              <span className="text-muted-foreground font-medium">Score</span>
                              <span className="text-[#10b981] font-bold">{data.score}/{data.totalMarks}</span>
                            </div>
                            <div className="h-px w-full bg-muted my-1"></div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span> Correct</span>
                              <span className="font-semibold text-muted-foreground">{data.correct}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]"></span> Wrong</span>
                              <span className="font-semibold text-muted-foreground">{data.wrong}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                              <span className="flex items-center gap-1.5 text-muted-foreground"><span className="w-1.5 h-1.5 rounded-full bg-muted-hover"></span> Unattempted</span>
                              <span className="font-semibold text-muted-foreground">{data.skipped}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="score" stackId="a" fill="#10b981" radius={[0, 0, 8, 8]} />
                <Bar dataKey="remaining" stackId="a" fill="url(#diagonalHatch)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Exam (Subject Donut) Chart */}
        <div className="lg:col-span-1 bg-white rounded-[32px] p-6 shadow-sm border border-border flex flex-col">
          <div className="flex justify-between items-center mb-2 px-2">
            <h3 className="text-lg font-medium text-muted-foreground">Subject Accuracy</h3>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center justify-between min-w-[130px] text-[13px] font-medium px-4 py-2 rounded-full border transition-all ${dropdownOpen ? 'border-[#10b981] text-[#10b981] bg-white shadow-sm' : 'border-border text-muted-foreground bg-white hover:bg-muted'}`}
              >
                {subjectFilter}
                <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-200 ${dropdownOpen ? 'rotate-180 text-[#10b981]' : 'text-muted-foreground'}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute top-full mt-2 right-0 w-[150px] bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-border overflow-hidden z-20 py-1.5 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  {['Overall', 'Physics', 'Chemistry', 'Mathematics'].map((option) => (
                    <div
                      key={option}
                      onClick={() => {
                        setSubjectFilter(option);
                        setDropdownOpen(false);
                      }}
                      className={`px-4 py-2.5 text-[13px] font-medium cursor-pointer transition-colors ${subjectFilter === option ? 'text-[#10b981] bg-[#ecfdf5]' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
                    >
                      {option}
                    </div>
                  ))}
                </div>
              )}
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
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} 
                    wrapperStyle={{ zIndex: 50 }} 
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute bottom-2 flex flex-col items-center pointer-events-none z-0">
                <span className="text-3xl font-bold text-foreground">
                  {subjectFilter === 'Overall' ? displayOverview.accuracy : currentSubjectAccuracy}%
                </span>
                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
                  {subjectFilter}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-2 mt-6 px-4">
            {subjectData.map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }}></span>
                {s.name} {subjectFilter === 'Overall' ? `(${s.value}%)` : `(${s.value})`}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. BOTTOM WIDGETS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Question Stats (Subscriptions style) */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-border flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-medium text-muted-foreground mb-6">Question Stats</h3>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-bold text-foreground">{totalQuestions}</span>
              <span className="text-xs text-muted-foreground font-medium">Total Attempted</span>
            </div>

            {/* Progress Bar Segmented */}
            <div className="h-3 w-full bg-muted rounded-full flex overflow-hidden mb-6">
              <div style={{ width: `${(displayQuestions.correct / totalQuestions) * 100}%` }} className="bg-[#10b981] h-full border-r-2 border-white"></div>
              <div style={{ width: `${(displayQuestions.wrong / totalQuestions) * 100}%` }} className="bg-[#f59e0b] h-full border-r-2 border-white"></div>
              <div style={{ width: `${(displayQuestions.skipped / totalQuestions) * 100}%` }} className="bg-[#ef4444] h-full"></div>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs font-medium">
            <div className="flex items-center gap-1.5 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-[#10b981]"></span> Correct <span className="font-bold text-foreground ml-0.5">{displayQuestions.correct}</span></div>
            <div className="flex items-center gap-1.5 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span> Wrong <span className="font-bold text-foreground ml-0.5">{displayQuestions.wrong}</span></div>
            <div className="flex items-center gap-1.5 text-muted-foreground"><span className="w-2 h-2 rounded-full bg-[#ef4444]"></span> Skipped <span className="font-bold text-foreground ml-0.5">{displayQuestions.skipped}</span></div>
          </div>
        </div>

        {/* Study Progress (Video Lessons style) */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-border flex flex-col justify-between">
          <h3 className="text-lg font-medium text-muted-foreground mb-6">Study Progress</h3>
          <div className="flex justify-between gap-4 h-full items-end">
            <div 
              onClick={() => router.push('/dashboard/study-progress?tab=strong')}
              className="border border-border rounded-[16px] p-4 flex-1 flex flex-col justify-between h-24 cursor-pointer hover:bg-muted transition-colors"
            >
              <span className="text-xl font-bold text-foreground">{strongChaptersList.length}</span>
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-medium text-muted-foreground">Chapters Strong</span>
                <div className="w-1.5 h-4 bg-[#10b981] rounded-full"></div>
              </div>
            </div>

            <div 
              onClick={() => router.push('/dashboard/study-progress?tab=weak')}
              className="border border-border rounded-[16px] p-4 flex-1 flex flex-col justify-between h-24 cursor-pointer hover:bg-muted transition-colors"
            >
              <span className="text-xl font-bold text-foreground">{weakChaptersList.length}</span>
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-medium text-muted-foreground">Needs Practice</span>
                <div className="w-1.5 h-4 bg-[#8b5cf6] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity (Questions style) */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-border flex flex-col justify-between">
          <h3 className="text-lg font-medium text-muted-foreground mb-6">Activity</h3>
          <div className="flex justify-between gap-4 h-full items-end">
            <div
              onClick={() => router.push('/dashboard/mock-tests')}
              className="border border-border rounded-[16px] p-4 flex-1 flex items-center justify-between h-24 cursor-pointer hover:shadow-md hover:border-border transition-all hover:-translate-y-1"
            >
              <div>
                <div className="text-xl font-bold text-foreground mb-1">{displayOverview.purchasedMocks}</div>
                <div className="text-[10px] font-medium text-muted-foreground">Total Mocks</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-success-light text-success flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div
              onClick={() => router.push('/dashboard/results#test-attempts')}
              className="border border-border rounded-[16px] p-4 flex-1 flex items-center justify-between h-24 cursor-pointer hover:shadow-md hover:border-border transition-all hover:-translate-y-1"
            >
              <div>
                <div className="text-xl font-bold text-foreground mb-1">{displayOverview.attemptedMocks}</div>
                <div className="text-[10px] font-medium text-muted-foreground">Completed</div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
