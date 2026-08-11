'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft, Clock, CheckCircle, XCircle, Loader2, AlertCircle, Eye, MousePointer2 } from 'lucide-react';
import { useGetNotificationHistory } from '@/services/adminNotificationApi';

export default function HistoryPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetNotificationHistory({ page, limit: 20 });

  const getStatusChip = (status: string) => {
    switch(status) {
      case 'Completed': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700"><CheckCircle className="w-3 h-3"/> Completed</span>;
      case 'Pending': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700"><Clock className="w-3 h-3"/> Scheduled</span>;
      case 'In Progress': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><Loader2 className="w-3 h-3 animate-spin"/> Sending</span>;
      case 'Failed': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle className="w-3 h-3"/> Failed</span>;
      default: return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/notifications"
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Broadcast History</h1>
            <p className="text-sm text-slate-500 mt-1">Track delivery status, read rates, and schedules.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Broadcast Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Target</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status & Timing</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading history...
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No broadcast history found.
                  </td>
                </tr>
              ) : (
                data?.data?.map((log: any) => (
                  <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 mb-1 line-clamp-1">{log.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-1 mb-2">{log.message}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                          {log.type}
                        </span>
                        {log.sendEmail && <span className="text-[10px] font-medium px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100">Email</span>}
                        {log.sendInApp && <span className="text-[10px] font-medium px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded border border-emerald-100">In-App</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {log.targetAudience}
                    </td>
                    <td className="px-6 py-4">
                      <div className="mb-2">
                        {getStatusChip(log.status)}
                      </div>
                      {log.status === 'Pending' ? (
                        <p className="text-xs text-orange-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Scheduled for {format(new Date(log.scheduledAt), 'PPp')}
                        </p>
                      ) : log.sentAt ? (
                        <p className="text-xs text-slate-500">
                          Sent on {format(new Date(log.sentAt), 'PPp')}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500">
                          Created on {format(new Date(log.createdAt), 'PPp')}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.status === 'Completed' ? (
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <span className="text-emerald-600 flex items-center gap-1" title="Successful Deliveries"><CheckCircle className="w-3 h-3" /> {log.successCount}</span>
                            {log.failureCount > 0 && <span className="text-red-500 flex items-center gap-1" title="Failed Deliveries"><AlertCircle className="w-3 h-3" /> {log.failureCount}</span>}
                          </div>
                          <div className="flex gap-3 text-xs text-slate-500">
                            <span className="flex items-center gap-1" title="Reads/Opens"><Eye className="w-3 h-3" /> {log.readCount}</span>
                            <span className="flex items-center gap-1" title="Clicks"><MousePointer2 className="w-3 h-3" /> {log.clickCount}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Pagination Controls */}
      {data?.meta && data.meta.pages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50 text-sm font-medium hover:bg-slate-50"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-slate-600 font-medium">Page {page} of {data.meta.pages}</span>
          <button 
            disabled={page === data.meta.pages}
            onClick={() => setPage(p => Math.min(data.meta.pages, p + 1))}
            className="px-4 py-2 border border-slate-200 rounded-lg disabled:opacity-50 text-sm font-medium hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
