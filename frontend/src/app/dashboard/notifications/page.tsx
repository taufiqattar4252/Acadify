'use client';

import React, { useState } from 'react';
import {
  Bell, Check, Trash2, Loader2, Info, CreditCard, Gift,
  MonitorPlay, FileText, Search, Filter, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  useGetNotifications, useMarkAsRead, useMarkAllAsRead,
  useDeleteNotification, Notification
} from '@/services/notificationApi';
import { formatDistanceToNow, format } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [search, setSearch] = useState('');

  const limit = 10;

  const { data, isLoading } = useGetNotifications({
    page,
    limit,
    ...(filter === 'unread' ? { isRead: false } : {}),
    ...(search ? { search } : {})
  });

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteNotification = useDeleteNotification();
  const router = useRouter();

  const notifications = data?.data || [];
  const meta = data?.meta || { total: 0, pages: 1 };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Welcome':
      case 'Promotional Offer':
        return <Gift className="w-5 h-5 text-purple-500" />;
      case 'Support':
      case 'Admin Announcement':
      case 'System Maintenance':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'Payment Successful':
      case 'Payment Failed':
      case 'Mock Purchased':
        return <CreditCard className="w-5 h-5 text-emerald-500" />;
      case 'Exam Reminder':
      case 'Mock Published':
        return <MonitorPlay className="w-5 h-5 text-orange-500" />;
      case 'Result Published':
      case 'Exam Submitted':
        return <FileText className="w-5 h-5 text-indigo-500" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification._id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {/* <Bell className="w-6 h-6 text-primary-500" /> */}
            Notification Center
          </h1>
          <p className="text-slate-500 mt-1">Stay updated with your latest alerts and announcements</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => markAllAsRead.mutate()}
            disabled={markAllAsRead.isPending || notifications.length === 0}
            className="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 hover:text-primary-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
          <button
            onClick={() => router.push('/dashboard/settings/notifications')}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
          >
            Settings
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
          <button
            onClick={() => { setFilter('all'); setPage(1); }}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            All
          </button>
          <button
            onClick={() => { setFilter('unread'); setPage(1); }}
            className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'unread' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Unread
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary-500" />
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No notifications found</h3>
            <p className="text-slate-500">You're all caught up! Check back later.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {notifications.map((notification: Notification) => (
              <div
                key={notification._id}
                className={`p-5 sm:p-6 transition-colors hover:bg-slate-50 group flex flex-col sm:flex-row sm:items-start gap-4 ${!notification.isRead ? 'bg-blue-50/20' : ''}`}
              >
                <div
                  className="flex-1 flex gap-4 cursor-pointer"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${!notification.isRead ? 'bg-blue-100' : 'bg-slate-100'}`}>
                    {getIcon(notification.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`text-base ${!notification.isRead ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {notification.title}
                      </h4>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                      )}
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed mb-2 max-w-3xl">
                      {notification.message}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                      <span>•</span>
                      <span>{format(new Date(notification.createdAt), 'MMM d, yyyy h:mm a')}</span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center sm:opacity-0 group-hover:opacity-100 transition-opacity justify-end gap-2 shrink-0">
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead.mutate(notification._id);
                      }}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors tooltip-trigger"
                      title="Mark as read"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification.mutate(notification._id);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors tooltip-trigger"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.pages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <span className="text-sm text-slate-600">
              Showing page {meta.page} of {meta.pages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(p => Math.min(meta.pages, p + 1))}
                disabled={page === meta.pages}
                className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
