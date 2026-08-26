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
      case 'Completed': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-success-light text-success"><CheckCircle className="w-3 h-3"/> Completed</span>;
      case 'Pending': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-warning-light text-warning"><Clock className="w-3 h-3"/> Scheduled</span>;
      case 'In Progress': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-light text-primary"><Loader2 className="w-3 h-3 animate-spin"/> Sending</span>;
      case 'Failed': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-destructive-light text-destructive"><XCircle className="w-3 h-3"/> Failed</span>;
      default: return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/notifications"
            className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Broadcast History</h1>
            <p className="text-sm text-muted-foreground mt-1">Track delivery status, read rates, and schedules.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Broadcast Details</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Target</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status & Timing</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Performance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading history...
                  </td>
                </tr>
              ) : data?.data?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No broadcast history found.
                  </td>
                </tr>
              ) : (
                data?.data?.map((log: any) => (
                  <tr key={log._id} className="hover:bg-muted transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground mb-1 line-clamp-1">{log.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{log.message}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-medium px-2 py-0.5 bg-muted text-muted-foreground rounded">
                          {log.type}
                        </span>
                        {log.sendEmail && <span className="text-[10px] font-medium px-2 py-0.5 bg-primary-light text-primary rounded border border-indigo-100">Email</span>}
                        {log.sendInApp && <span className="text-[10px] font-medium px-2 py-0.5 bg-success-light text-success rounded border border-emerald-100">In-App</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {log.targetAudience}
                    </td>
                    <td className="px-6 py-4">
                      <div className="mb-2">
                        {getStatusChip(log.status)}
                      </div>
                      {log.status === 'Pending' ? (
                        <p className="text-xs text-warning flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Scheduled for {format(new Date(log.scheduledAt), 'PPp')}
                        </p>
                      ) : log.sentAt ? (
                        <p className="text-xs text-muted-foreground">
                          Sent on {format(new Date(log.sentAt), 'PPp')}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Created on {format(new Date(log.createdAt), 'PPp')}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.status === 'Completed' ? (
                        <div className="flex flex-col items-end gap-1">
                          <div className="text-sm font-bold text-foreground flex items-center gap-2">
                            <span className="text-success flex items-center gap-1" title="Successful Deliveries"><CheckCircle className="w-3 h-3" /> {log.successCount}</span>
                            {log.failureCount > 0 && <span className="text-destructive flex items-center gap-1" title="Failed Deliveries"><AlertCircle className="w-3 h-3" /> {log.failureCount}</span>}
                          </div>
                          <div className="flex gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1" title="Reads/Opens"><Eye className="w-3 h-3" /> {log.readCount}</span>
                            <span className="flex items-center gap-1" title="Clicks"><MousePointer2 className="w-3 h-3" /> {log.clickCount}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
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
            className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 text-sm font-medium hover:bg-muted"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-sm text-muted-foreground font-medium">Page {page} of {data.meta.pages}</span>
          <button 
            disabled={page === data.meta.pages}
            onClick={() => setPage(p => Math.min(data.meta.pages, p + 1))}
            className="px-4 py-2 border border-border rounded-lg disabled:opacity-50 text-sm font-medium hover:bg-muted"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
