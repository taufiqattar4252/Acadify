'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, AlertCircle } from 'lucide-react';
import { useGetSettings, useUpdateSecurity } from '@/services/adminSettingsApi';
import { useUser } from '@/services/authApi';
import toast from 'react-hot-toast';

export default function SecuritySettingsPage() {
  const { data: user } = useUser();
  const { data: settings, isLoading } = useGetSettings();
  const { mutate: updateSecurity, isPending } = useUpdateSecurity();
  
  const isSuperAdmin = user?.role === 'Super Admin';

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      sessionTimeout: 120,
      jwtExpiry: '1d',
      passwordPolicy: 'medium',
      maxLoginAttempts: 5,
      twoFactorEnabled: false,
    }
  });

  useEffect(() => {
    if (settings?.security) {
      reset({
        sessionTimeout: settings.security.sessionTimeout ?? 120,
        jwtExpiry: settings.security.jwtExpiry || '1d',
        passwordPolicy: settings.security.passwordPolicy || 'medium',
        maxLoginAttempts: settings.security.maxLoginAttempts ?? 5,
        twoFactorEnabled: settings.security.twoFactorEnabled ?? false,
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: any) => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admins can update security settings');
      return;
    }

    updateSecurity(data, {
      onSuccess: () => {
        toast.success('Security settings updated successfully');
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to update settings');
      }
    });
  };

  if (isLoading) {
    return <div className="p-8 animate-pulse bg-slate-50 h-full rounded-2xl"></div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-8">
      <div className="flex justify-between items-center border-b border-slate-100 pb-6 mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Security Policies</h2>
          <p className="text-sm text-slate-500 mt-1">Configure global security settings for the platform.</p>
        </div>
        {isSuperAdmin && (
          <button 
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm shadow-primary-500/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isPending ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-800">Restricted Access</h4>
            <p className="text-xs text-red-600 mt-1">You do not have permission to modify these settings.</p>
          </div>
        </div>
      )}

      <div className="space-y-8 max-w-3xl opacity-100 transition-opacity" style={{ opacity: !isSuperAdmin ? 0.7 : 1 }}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Session Timeout (minutes)</label>
            <input 
              type="number"
              {...register('sessionTimeout', { valueAsNumber: true })}
              disabled={!isSuperAdmin}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:bg-slate-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">JWT Expiry</label>
            <select 
              {...register('jwtExpiry')}
              disabled={!isSuperAdmin}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:bg-slate-50"
            >
              <option value="1h">1 Hour</option>
              <option value="12h">12 Hours</option>
              <option value="1d">1 Day</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Password Policy</label>
            <select 
              {...register('passwordPolicy')}
              disabled={!isSuperAdmin}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:bg-slate-50"
            >
              <option value="low">Low (Min 6 chars)</option>
              <option value="medium">Medium (Alphanumeric)</option>
              <option value="high">High (Special chars + numbers)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Max Login Attempts</label>
            <input 
              type="number"
              {...register('maxLoginAttempts', { valueAsNumber: true })}
              disabled={!isSuperAdmin}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:bg-slate-50"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8">
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <div>
              <h4 className="text-sm font-medium text-slate-900">Enforce Two-Factor Authentication (2FA)</h4>
              <p className="text-xs text-slate-500 mt-1">Require all admins to set up 2FA via authenticator app.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register('twoFactorEnabled')} disabled={!isSuperAdmin} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50"></div>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
