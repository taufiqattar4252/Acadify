'use client';

import React, { useState } from 'react';
import { useGetAllAttempts } from '@/services/resultApi';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

export default function AdminAttemptsPage() {
  const [page, setPage] = useState(1);
  const limit = 10;
  const { data, isLoading, isError } = useGetAllAttempts(page, limit);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        Failed to load attempts data.
      </div>
    );
  }

  const { data: attempts, pagination } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Attempts</h1>
          <p className="text-slate-500">View and analyze all mock test submissions.</p>
        </div>
        
        {/* Simple mock search bar (UI only for now) */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search student or mock..." 
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-600 font-medium">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Mock Test</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Accuracy</th>
                <th className="px-6 py-4">Submitted At</th>
                <th className="px-6 py-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {attempts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No attempts found.
                  </td>
                </tr>
              ) : (
                attempts.map((attempt: any) => {
                  const accuracy = (attempt.correct + attempt.wrong) > 0 
                    ? (attempt.correct / (attempt.correct + attempt.wrong)) * 100 
                    : 0;

                  return (
                    <tr key={attempt._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{attempt.user?.fullName || 'Unknown User'}</div>
                        <div className="text-xs text-slate-500">{attempt.user?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {attempt.mockTest?.title || 'Unknown Test'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-indigo-600">{attempt.score}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">
                        {accuracy.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {(attempt.submittedAt || attempt.createdAt) ? new Date(attempt.submittedAt || attempt.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs font-mono">
                        {attempt.ipAddress || 'Unknown'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              Showing page {pagination.page} of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="secondary"
                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={page === pagination.totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
