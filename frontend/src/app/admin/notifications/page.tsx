'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Bell, 
  Send, 
  Clock, 
  CheckCircle,
  Activity,
  Plus,
  FileText
} from 'lucide-react';
import { useGetDashboardStats } from '@/services/adminNotificationApi';
import { format } from 'date-fns';

export default function AdminNotificationsPage() {
  const { data: stats, isLoading } = useGetDashboardStats();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notification Center</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage broadcasts, emails, and templates.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/notifications/templates"
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border rounded-xl text-muted-foreground font-medium hover:bg-muted transition-colors shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Templates
          </Link>
          <Link 
            href="/admin/notifications/create"
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 rounded-xl text-white font-medium hover:bg-primary-700 transition-colors shadow-sm shadow-primary-500/20"
          >
            <Plus className="w-4 h-4" />
            New Broadcast
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-border shadow-sm animate-pulse h-32"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard 
            title="Total Broadcasts" 
            value={stats?.totalBroadcasts || 0} 
            icon={<Bell className="w-5 h-5 text-primary" />} 
            bg="bg-primary-light"
          />
          <StatCard 
            title="Scheduled" 
            value={stats?.scheduledBroadcasts || 0} 
            icon={<Clock className="w-5 h-5 text-warning" />} 
            bg="bg-warning-light"
          />
          <StatCard 
            title="Total Notifications Sent" 
            value={stats?.totalSent || 0} 
            icon={<Send className="w-5 h-5 text-success" />} 
            bg="bg-success-light"
          />
          <StatCard 
            title="Delivery Rate" 
            value={`${stats?.deliveryRate || 0}%`} 
            icon={<CheckCircle className="w-5 h-5 text-primary" />} 
            bg="bg-primary-light"
          />
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-6 border-b border-border flex justify-between items-center">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5 text-muted-foreground" />
            Quick Actions & Navigation
          </h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/admin/notifications/create" className="group block p-6 bg-muted rounded-2xl border border-border hover:border-primary-200 hover:bg-primary-50 transition-all">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Send className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Send Broadcast</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">Send announcements or emails to specific groups of students instantly or schedule for later.</p>
          </Link>
          
          <Link href="/admin/notifications/history" className="group block p-6 bg-muted rounded-2xl border border-border hover:border-indigo-200 hover:bg-primary-light transition-all">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-foreground mb-2">View History</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">Check the delivery status, read rates, and logs of all previously sent notifications.</p>
          </Link>
          
          <Link href="/admin/notifications/templates" className="group block p-6 bg-muted rounded-2xl border border-border hover:border-emerald-200 hover:bg-success-light transition-all">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-bold text-foreground mb-2">Manage Templates</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">Create reusable templates for welcome emails, exam reminders, or payment receipts.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, bg }: { title: string, value: string | number, icon: React.ReactNode, bg: string }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-border shadow-sm flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
}
