'use client';

import React from 'react';
import { useGetStudentAttempts } from '@/services/resultApi';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, Clock, Trophy, ChevronRight } from 'lucide-react';

export default function ResultsHistoryPage() {
  const { data: attempts, isLoading, isError } = useGetStudentAttempts();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
        Failed to load result history. Please try again later.
      </div>
    );
  }

  if (!attempts || attempts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trophy className="w-8 h-8 text-slate-400" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">No Results Found</h2>
        <p className="text-slate-500 mb-6">You haven't completed any mock tests yet.</p>
        <Link href="/dashboard/mock-tests">
          <Button variant="secondary" className="mx-auto rounded-full px-6">Browse Mock Tests</Button>
        </Link>
      </div>
    );
  }

  // Prepare chart data
  const chartData = [...attempts].reverse().map((attempt, index) => ({
    name: `Attempt ${index + 1}`,
    score: attempt.score,
    percentage: attempt.percentage,
    date: new Date(attempt.submittedAt).toLocaleDateString(),
  }));

  const bestScore = Math.max(...attempts.map((a: any) => a.score));
  const avgScore = Math.round(attempts.reduce((acc: number, a: any) => acc + a.score, 0) / attempts.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-normal text-slate-800">
            Performance <span className="font-semibold text-slate-900">History</span>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Track your progress across all mock tests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl shadow-lumina border-transparent p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[28px] font-bold text-slate-900 leading-none">{bestScore}</h3>
            <p className="text-xs font-medium text-slate-400 mt-2">Best Score</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-lumina border-transparent p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[28px] font-bold text-slate-900 leading-none">{avgScore}</h3>
            <p className="text-xs font-medium text-slate-400 mt-2">Average Score</p>
          </div>
        </div>
        <div className="bg-white rounded-3xl shadow-lumina border-transparent p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-[28px] font-bold text-slate-900 leading-none">{attempts.length}</h3>
            <p className="text-xs font-medium text-slate-400 mt-2">Total Attempts</p>
          </div>
        </div>
      </div>

      {/* Progress Chart */}
      {attempts.length > 1 && (
        <div className="bg-white rounded-3xl shadow-lumina border-transparent p-6 mt-6">
          <h3 className="font-bold text-slate-900 mb-6">Score Trend</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#10b981"
                  strokeWidth={4}
                  activeDot={{ r: 8, fill: '#10b981', stroke: '#fff', strokeWidth: 3 }}
                  dot={{ r: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Attempts List */}
      <div className="bg-white rounded-3xl shadow-lumina border-transparent overflow-hidden mt-6">
        <div className="px-6 py-6 border-b border-slate-50">
          <h3 className="font-bold text-slate-900">All Attempts</h3>
        </div>
        <div className="divide-y divide-slate-50">
          {attempts.map((attempt: any) => (
            <div key={attempt._id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-medium text-slate-700 mb-2">{attempt.mockTestTitle || 'Unknown Test'}</h4>
                <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {new Date(attempt.submittedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Score</p>
                  <p className="font-bold text-xl text-indigo-600">
                    {attempt.score} <span className="text-sm text-slate-400 font-normal">/ {attempt.totalMarks}</span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Accuracy</p>
                  <p className="font-bold text-xl text-slate-700">
                    {((attempt.correct / (attempt.correct + attempt.wrong)) * 100 || 0).toFixed(1)}%
                  </p>
                </div>
                <Link href={`/dashboard/results/${attempt._id}`}>
                  <Button variant="secondary" className="gap-2 rounded-full px-5 py-2">
                    View Details <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
