'use client';

import React, { useState } from 'react';
import { useGetStudentAttempts } from '@/services/resultApi';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Target, Clock, Trophy, ChevronRight, ClipboardList, TrendingUp,
  Award, Activity, Download, Calendar, MoreVertical, Search, BookOpen
} from 'lucide-react';

const COLORS = ['#00BC7D', '#3b82f6', '#8b5cf6', '#f59e0b'];

export default function ResultsHistoryPage() {
  const { data: attempts, isLoading, isError } = useGetStudentAttempts();
  const [filterTab, setFilterTab] = useState('All Tests');
  const [currentPage, setCurrentPage] = useState(1);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-3xl border border-red-200">
        Failed to load result history. Please try again later.
      </div>
    );
  }

  if (!attempts || attempts.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 p-12 text-center">
        <div className="w-16 h-16 bg-[#f4fbf8] rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-[#00BC7D]" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Results Found</h2>
        <p className="text-slate-500 mb-6 text-sm">You haven't completed any mock tests yet.</p>
        <Link href="/dashboard/mock-tests">
          <button className="mx-auto rounded-full px-6 py-3 bg-[#00BC7D] text-white font-bold shadow-lg shadow-[#00BC7D]/30 hover:bg-[#00a870] transition-colors">
            Browse Mock Tests
          </button>
        </Link>
      </div>
    );
  }

  // Calculate KPIs
  const bestScoreObj = [...attempts].sort((a, b) => b.score - a.score)[0];
  const bestScore = bestScoreObj?.score || 0;
  const bestScorePercentage = bestScoreObj ? (bestScoreObj.score / bestScoreObj.totalMarks) * 100 : 0;

  const avgScore = attempts.length > 0 ? Math.round(attempts.reduce((acc: number, a: any) => acc + a.score, 0) / attempts.length) : 0;
  const avgScorePercentage = attempts.length > 0 ? (attempts.reduce((acc: number, a: any) => acc + (a.score / a.totalMarks), 0) / attempts.length) * 100 : 0;

  const avgAccuracy = attempts.length > 0 ?
    attempts.reduce((acc: number, a: any) => acc + (a.correct / ((a.correct + a.wrong) || 1)), 0) / attempts.length * 100
    : 0;

  // Prepare chart data
  const chartData = [...attempts].reverse().map((attempt, index) => ({
    name: new Date(attempt.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    score: attempt.percentage || (attempt.score / attempt.totalMarks) * 100,
  }));

  const pieData = [
    { name: 'Physics', value: 74.20 },
    { name: 'Chemistry', value: 68.10 },
    { name: 'Mathematics', value: 74.05 },
  ];

  const rankData = [
    { name: '5 Jan', rank: 421 },
    { name: '26 Jan', rank: 356 },
    { name: '16 Feb', rank: 289 },
    { name: '2 Mar', rank: 225 },
    { name: '20 Mar', rank: 180 },
    { name: '16 Apr', rank: 145 },
    { name: '5 May', rank: 128 },
  ];

  return (
    <div className="space-y-10 pb-12 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-normal text-slate-800">
          Performance <span className="font-semibold text-slate-900">History</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Track your progress over time and compare your performance.</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 w-full sm:w-auto">
          <select className="flex-1 sm:flex-none min-w-[160px] bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-full px-4 py-3 outline-none focus:border-[#00BC7D] focus:ring-1 focus:ring-[#00BC7D] transition-all">
            <option>All Tests</option>
            <option>Full Mock Test</option>
            <option>Chapter-wise</option>
          </select>
          <div className="flex-1 sm:flex-none flex items-center bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-full px-4 py-3 focus-within:border-[#00BC7D] focus-within:ring-1 focus-within:ring-[#00BC7D] transition-all">
            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
            <span>01 Jan 2025 - 06 May 2025</span>
          </div>
        </div>
        <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 text-slate-700 rounded-full px-5 py-3 text-sm font-medium transition-colors">
          <Download className="w-4 h-4 text-[#00BC7D]" /> Export Report
        </button>
      </div>

      {/* 5 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Tests Attempted</p>
              <h3 className="text-2xl font-bold text-slate-900">{attempts.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-[#00BC7D] flex items-center mt-3">
            <TrendingUp className="w-3 h-3 mr-1.5" /> 12% vs last 30 days
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Average Score</p>
              <h3 className="text-2xl font-bold text-slate-900">{avgScorePercentage.toFixed(2)}%</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#f4fbf8] text-[#00BC7D] flex items-center justify-center shrink-0">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-[#00BC7D] flex items-center mt-3">
            <TrendingUp className="w-3 h-3 mr-1.5" /> 8.6% vs last 30 days
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Best Score</p>
              <h3 className="text-2xl font-bold text-slate-900">{bestScorePercentage.toFixed(2)}%</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500 truncate mt-3" title={bestScoreObj?.mockTestTitle}>
            {bestScoreObj?.mockTestTitle || 'N/A'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Average Accuracy</p>
              <h3 className="text-2xl font-bold text-slate-900">{avgAccuracy.toFixed(2)}%</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-[#00BC7D] flex items-center mt-3">
            <TrendingUp className="w-3 h-3 mr-1.5" /> 6.3% vs last 30 days
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-medium text-slate-400 mb-1">Total Time</p>
              <h3 className="text-2xl font-bold text-slate-900">28h 45m</h3>
            </div>
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-slate-500 mt-3">
            Total time spent
          </p>
        </div>
      </div>

      {/* Middle Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Score Trend */}
        <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-medium text-slate-900 text-lg">Score Trend</h3>
            <select className="bg-slate-50 border border-slate-100 text-slate-600 text-xs rounded-full px-3 py-1.5 outline-none font-medium">
              <option>All Tests</option>
            </select>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}%`} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', fontSize: '12px' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#00BC7D"
                  strokeWidth={3}
                  activeDot={{ r: 6, fill: '#00BC7D', stroke: '#fff', strokeWidth: 2 }}
                  dot={{ r: 4, fill: '#00BC7D', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Wise Average */}
        <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 p-6 lg:col-span-1 flex flex-col">
          <h3 className="font-medium text-slate-900 text-lg mb-4">Subject Wise Average</h3>
          <div className="flex-1 flex items-center justify-center relative min-h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900">{avgScorePercentage.toFixed(2)}%</span>
              <span className="text-xs font-medium text-slate-400">Overall</span>
            </div>
          </div>

          <div className="flex justify-center gap-4 mt-4 mb-5">
            {pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-xs font-medium text-slate-600">{entry.name} <span className="text-slate-900 ml-1 font-bold">{entry.value}%</span></span>
              </div>
            ))}
          </div>

          <button className="w-full text-[#00BC7D] border border-slate-100 bg-slate-50 hover:bg-slate-100 text-sm font-medium py-3 rounded-full flex items-center justify-center transition-colors">
            <TrendingUp className="w-4 h-4 mr-2" /> View Detailed Analysis
          </button>
        </div>

        {/* Ranking Among Competitors */}
        <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 p-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="font-medium text-slate-900 text-lg">Ranking Among Competitors</h3>
            <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] cursor-help">i</div>
          </div>

          <div className="flex justify-between mb-5">
            <div>
              <p className="text-xs font-medium text-slate-400">Your Rank</p>
              <p className="text-2xl font-bold text-slate-900">128 <span className="text-sm font-medium text-slate-400 font-normal">/ 5,842</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-slate-400">Percentile</p>
              <p className="text-xl font-bold text-[#00BC7D]">97.81%</p>
            </div>
          </div>

          <div className="h-[120px] w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rankData} margin={{ top: 20, right: 10, bottom: 0, left: 10 }}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }} />
                <Line
                  type="monotone"
                  dataKey="rank"
                  stroke="#00BC7D"
                  strokeWidth={2}
                  activeDot={{ r: 4 }}
                  dot={{ r: 3, fill: '#00BC7D', strokeWidth: 0 }}
                  label={{ position: 'top', fill: '#64748b', fontSize: 11, dy: -5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            You are ahead of <span className="font-semibold text-slate-700">97.81%</span> of students who have attempted tests in this period.
          </p>
        </div>

      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Test Attempts Table */}
        <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 p-6 lg:col-span-2 overflow-x-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h3 className="font-medium text-slate-900 text-lg">Test Attempts</h3>
            <div className="flex items-center gap-2">
              {['All Tests', 'Full Syllabus', 'Subject Wise', 'Chapter Wise'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-4 py-2 text-xs font-bold rounded-full transition-colors ${filterTab === tab
                    ? 'bg-[#f4fbf8] text-[#00BC7D]'
                    : 'text-slate-500 hover:bg-slate-50 bg-white'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <table className="w-full text-left border-collapse min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Test Name</th>
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Type</th>
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Score</th>
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Accuracy</th>
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Correct</th>
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Incorrect</th>
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Time Taken</th>
                {/* <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Attempt Date</th> */}
                <th className="pb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {attempts.slice((currentPage - 1) * 5, currentPage * 5).map((attempt: any) => (
                <tr key={attempt._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      {/* <div className="w-10 h-10 rounded-full bg-[#f4fbf8] text-[#00BC7D] flex items-center justify-center shrink-0"> */}
                      {/* <BookOpen className="w-4 h-4" /> */}
                      {/* </div> */}
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{attempt.mockTestTitle || 'Unknown Test'}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{attempt.totalMarks} Questions</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className="text-[11px] font-bold text-[#00BC7D] bg-[#f4fbf8] px-3 py-1.5 rounded-full whitespace-nowrap">Full Syllabus</span>
                  </td>
                  <td className="py-4 text-right">
                    <p className="text-sm font-bold text-slate-900">{((attempt.score / attempt.totalMarks) * 100).toFixed(2)}%</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{attempt.score} / {attempt.totalMarks}</p>
                  </td>
                  <td className="py-4 text-right">
                    <p className="text-sm font-semibold text-slate-700">
                      {((attempt.correct / ((attempt.correct + attempt.wrong) || 1)) * 100).toFixed(2)}%
                    </p>
                  </td>
                  <td className="py-4 text-right">
                    <p className="text-sm font-semibold text-[#00BC7D]">{attempt.correct}</p>
                  </td>
                  <td className="py-4 text-right">
                    <p className="text-sm font-semibold text-red-500">{attempt.wrong}</p>
                  </td>
                  <td className="py-4 text-right">
                    <p className="text-sm font-medium text-slate-700">3h 12m</p>
                  </td>
                  {/* <td className="py-4 text-right">
                    <p className="text-xs font-medium text-slate-900">{new Date(attempt.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{new Date(attempt.submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</p>
                  </td> */}
                  <td className="py-4 text-center pl-2">
                    <Link href={`/dashboard/results/${attempt._id}`}>
                      <button className="text-slate-400 hover:text-[#00BC7D] p-2 rounded-full hover:bg-[#f4fbf8] transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {/* Empty rows to maintain table height */}
              {Array.from({ length: Math.max(0, 5 - attempts.slice((currentPage - 1) * 5, currentPage * 5).length) }).map((_, idx) => (
                <tr key={`empty-${idx}`} className="opacity-0 pointer-events-none" aria-hidden="true">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm">_</p>
                        <p className="text-xs mt-0.5">_</p>
                      </div>
                    </div>
                  </td>
                  <td colSpan={7}></td>
                </tr>
              ))}
            </tbody>
          </table>
          {attempts.length > 5 && (
            <div className="flex justify-center mt-6 pt-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-100 text-slate-400 hover:bg-slate-50 disabled:opacity-50 text-xs font-medium"
                >
                  {"<"}
                </button>

                {Array.from({ length: Math.ceil(attempts.length / 5) }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full border ${currentPage === idx + 1 ? 'bg-[#00BC7D] text-white font-bold border-transparent shadow-md shadow-[#00BC7D]/20' : 'border-slate-100 text-slate-600 hover:bg-slate-50 font-medium'} text-xs`}
                  >
                    {idx + 1}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(attempts.length / 5)))}
                  disabled={currentPage === Math.ceil(attempts.length / 5)}
                  className="w-8 h-8 flex items-center justify-center rounded-full border border-slate-100 text-slate-400 hover:bg-slate-50 disabled:opacity-50 text-xs font-medium"
                >
                  {">"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Competitor Comparison */}
        <div className="bg-white rounded-3xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 p-6 lg:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <h3 className="font-medium text-slate-900 text-lg">Competitor Comparison</h3>
            <div className="w-4 h-4 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-[10px] cursor-help">i</div>
          </div>

          <div className="flex flex-col">
            {/* Score */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pb-5 mb-5 border-b border-slate-100 last:border-0 last:pb-0 last:mb-0">
              <div className="flex items-center gap-4 w-full sm:w-[35%]">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Score</p>
              </div>

              <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-500">You</span>
                  <span className="text-xs font-semibold text-slate-500">Top 10%</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-800 w-12">{avgScorePercentage.toFixed(2)}%</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-gradient-to-r from-[#00BC7D] to-[#009c68] h-full rounded-full" style={{ width: `${avgScorePercentage}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-slate-500 w-12 text-right">80.92%</span>
                </div>
              </div>
            </div>

            {/* Accuracy */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pb-5 mb-5 border-b border-slate-100 last:border-0 last:pb-0 last:mb-0">
              <div className="flex items-center gap-4 w-full sm:w-[35%]">
                <div className="w-10 h-10 rounded-full bg-[#f4fbf8] text-[#00BC7D] flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Accuracy</p>
              </div>
              <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-500">You</span>
                  <span className="text-xs font-semibold text-slate-500">Top 10%</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-[#00BC7D] w-12">{avgAccuracy.toFixed(2)}%</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-gradient-to-r from-[#00BC7D] to-[#009c68] h-full rounded-full" style={{ width: `${avgAccuracy}%` }}></div>
                  </div>
                  <span className="text-sm font-medium text-slate-500 w-12 text-right">75.40%</span>
                </div>
              </div>
            </div>

            {/* Time per Question */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pb-5 mb-5 border-b border-slate-100 last:border-0 last:pb-0 last:mb-0">
              <div className="flex items-center gap-4 w-full sm:w-[35%]">
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Time per Question</p>
              </div>
              <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-500">You</span>
                  <span className="text-xs font-semibold text-slate-500">Top 10%</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-[#00BC7D] w-12">52s</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-gradient-to-r from-[#00BC7D] to-[#009c68] h-full rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-slate-500 w-12 text-right">38s</span>
                </div>
              </div>
            </div>

            {/* Tests Attempted */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 pb-5 mb-5 border-b border-slate-100 last:border-0 last:pb-0 last:mb-0">
              <div className="flex items-center gap-4 w-full sm:w-[35%]">
                <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <p className="text-sm font-semibold text-slate-700">Tests Attempted</p>
              </div>
              <div className="flex-1 w-full">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-semibold text-slate-500">You</span>
                  <span className="text-xs font-semibold text-slate-500">Top 10%</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-bold text-slate-800 w-12">{attempts.length}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-gradient-to-r from-[#00BC7D] to-[#009c68] h-full rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-slate-500 w-12 text-right">32</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <p className="text-[11px] text-slate-400 leading-relaxed text-center">
              Top 10% data is based on students who attempted tests in this period.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
