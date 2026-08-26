'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save } from 'lucide-react';
import { useGetSettings, useUpdateNotifications } from '@/services/adminSettingsApi';
import toast from 'react-hot-toast';

export default function NotificationSettingsPage() {
  const { data: settings, isLoading } = useGetSettings();
  const { mutate: updateNotifications, isPending } = useUpdateNotifications();
  
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      emailEnabled: true,
      inAppEnabled: true,
      examReminders: true,
      resultNotifications: true,
      marketingEmails: false,
    }
  });

  useEffect(() => {
    if (settings?.notifications) {
      reset({
        emailEnabled: settings.notifications.emailEnabled ?? true,
        inAppEnabled: settings.notifications.inAppEnabled ?? true,
        examReminders: settings.notifications.examReminders ?? true,
        resultNotifications: settings.notifications.resultNotifications ?? true,
        marketingEmails: settings.notifications.marketingEmails ?? false,
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: any) => {
    updateNotifications(data, {
      onSuccess: () => {
        toast.success('Notification settings updated successfully');
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to update settings');
      }
    });
  };

  if (isLoading) {
    return <div className="p-8 animate-pulse bg-muted h-full rounded-2xl"></div>;
  }

  const toggleConfig = [
    { name: 'emailEnabled', title: 'Global Email Notifications', desc: 'Allow the system to send emails.' },
    { name: 'inAppEnabled', title: 'In-App Notifications', desc: 'Allow in-app alerts and bells for users.' },
    { name: 'examReminders', title: 'Exam Reminders', desc: 'Automatically send reminders for scheduled exams.' },
    { name: 'resultNotifications', title: 'Result Notifications', desc: 'Notify students when their mock test results are generated.' },
    { name: 'marketingEmails', title: 'Marketing Emails', desc: 'Allow promotional and marketing emails to be sent to users.' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-8">
      <div className="flex justify-between items-center border-b border-border pb-6 mb-8">
        <div>
          <h2 className="text-xl font-bold text-foreground">Notification Preferences</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage global notification toggles.</p>
        </div>
        <button 
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm shadow-primary-500/20 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-4 max-w-3xl">
        {toggleConfig.map((item) => (
          <div key={item.name} className="flex items-center justify-between p-4 bg-muted border border-border rounded-xl">
            <div>
              <h4 className="text-sm font-medium text-foreground">{item.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register(item.name as any)} className="sr-only peer" />
              <div className="w-11 h-6 bg-muted-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        ))}
      </div>
    </form>
  );
}
