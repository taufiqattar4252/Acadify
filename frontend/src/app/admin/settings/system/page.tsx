'use client';

import React from 'react';
import { Database, Server, HardDrive, RefreshCw, Archive, FileText, AlertCircle } from 'lucide-react';
import { useUser } from '@/services/authApi';
import toast from 'react-hot-toast';

export default function SystemSettingsPage() {
  const { data: user } = useUser();
  const isSuperAdmin = user?.role === 'Super Admin';

  const handleAction = (action: string) => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admins can perform system actions');
      return;
    }
    toast.success(`${action} initiated successfully`);
  };

  const systemStats = [
    { name: 'Application Version', value: 'v1.0.0 (Production)', icon: Server, color: 'text-primary', bg: 'bg-primary-light' },
    { name: 'Database Status', value: 'Connected (MongoDB)', icon: Database, color: 'text-success', bg: 'bg-success-light' },
    { name: 'Server Status', value: 'Online (Node.js 20)', icon: Server, color: 'text-primary', bg: 'bg-primary-light' },
    { name: 'Storage Usage', value: '45.2 GB / 100 GB', icon: HardDrive, color: 'text-warning', bg: 'bg-warning-light' },
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center border-b border-border pb-6 mb-8">
        <div>
          <h2 className="text-xl font-bold text-foreground">System Information</h2>
          <p className="text-sm text-muted-foreground mt-1">Monitor platform health and perform system actions.</p>
        </div>
      </div>

      {!isSuperAdmin && (
        <div className="mb-8 p-4 bg-destructive-light border border-red-100 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-800">Restricted Access</h4>
            <p className="text-xs text-destructive mt-1">You cannot perform administrative system actions.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {systemStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white border border-border rounded-2xl p-6 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full ${stat.bg} ${stat.color} flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.name}</p>
                <p className="text-lg font-bold text-foreground mt-0.5">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-border pt-8">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">System Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button 
            onClick={() => handleAction('Cache clearance')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-border rounded-2xl hover:bg-muted hover:border-border transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors mb-4">
              <RefreshCw className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-foreground">Clear Cache</h4>
            <p className="text-xs text-muted-foreground text-center mt-2">Flush Redis and application cache to force a fresh reload.</p>
          </button>

          <button 
            onClick={() => handleAction('Database backup')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-border rounded-2xl hover:bg-muted hover:border-border transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors mb-4">
              <Archive className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-foreground">Backup Database</h4>
            <p className="text-xs text-muted-foreground text-center mt-2">Trigger a manual backup of the entire MongoDB database.</p>
          </button>

          <button 
            onClick={() => handleAction('Audit logs export')}
            className="flex flex-col items-center justify-center p-6 bg-white border border-border rounded-2xl hover:bg-muted hover:border-border transition-all group"
          >
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-foreground">View Audit Logs</h4>
            <p className="text-xs text-muted-foreground text-center mt-2">Export and view security and administrative action logs.</p>
          </button>
        </div>
      </div>
    </div>
  );
}
