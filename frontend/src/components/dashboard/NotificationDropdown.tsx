'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Check, Loader2, Info, AlertTriangle, CreditCard, Gift, MonitorPlay, FileText } from 'lucide-react';
import { useGetNotifications, useGetUnreadCount, useMarkAsRead, useMarkAllAsRead, Notification } from '@/services/notificationApi';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

export const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: unreadCount = 0 } = useGetUnreadCount();
  const { data: notificationsData, isLoading } = useGetNotifications({ limit: 5 });
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  const notifications = notificationsData?.data || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead.mutate(notification._id);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    setIsOpen(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Welcome':
      case 'Promotional Offer':
        return <Gift className="w-4 h-4 text-primary" />;
      case 'Support':
      case 'Admin Announcement':
      case 'System Maintenance':
        return <Info className="w-4 h-4 text-primary" />;
      case 'Payment Successful':
      case 'Payment Failed':
      case 'Mock Purchased':
        return <CreditCard className="w-4 h-4 text-success" />;
      case 'Exam Reminder':
      case 'Mock Published':
        return <MonitorPlay className="w-4 h-4 text-warning" />;
      case 'Result Published':
      case 'Exam Submitted':
        return <FileText className="w-4 h-4 text-primary" />;
      default:
        return <Bell className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-full bg-white shadow-lumina flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-white flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-4 w-80 sm:w-96 bg-white rounded-2xl shadow-lumina-hover border border-border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-bold text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAllAsRead.mutate()}
                disabled={markAllAsRead.isPending}
                className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-[360px] overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                You have no notifications yet.
              </div>
            ) : (
              <div className="flex flex-col">
                {notifications.map((notification: Notification) => (
                  <div 
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-muted transition-colors flex gap-3 ${!notification.isRead ? 'bg-primary-light/30' : ''}`}
                  >
                    <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${!notification.isRead ? 'bg-primary-light' : 'bg-muted'}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm mb-0.5 ${!notification.isRead ? 'font-semibold text-foreground' : 'font-medium text-muted-foreground'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5 shrink-0"></div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-3 border-t border-border text-center bg-muted hover:bg-muted transition-colors">
            <Link 
              href="/dashboard/notifications" 
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-muted-foreground block w-full"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
