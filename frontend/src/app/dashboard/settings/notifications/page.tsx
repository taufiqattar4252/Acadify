'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/services/authApi';
import { useUpdateNotificationPreferences } from '@/services/notificationApi';
import { Bell, Mail, MonitorPlay, Save, FileText, Loader2, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationSettingsPage() {
  const { data: user, isLoading: userLoading } = useUser();
  const updatePreferences = useUpdateNotificationPreferences();
  
  const [prefs, setPrefs] = useState({
    email: true,
    inApp: true,
    examReminders: true,
    resultNotifications: true,
    marketingEmails: true,
    systemAnnouncements: true,
  });

  useEffect(() => {
    if (user?.notificationPreferences) {
      setPrefs({ ...user.notificationPreferences });
    }
  }, [user]);

  const handleToggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    updatePreferences.mutate(prefs, {
      onSuccess: () => {
        toast.success('Notification preferences updated successfully');
      },
      onError: () => {
        toast.error('Failed to update preferences. Try again.');
      }
    });
  };

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary-500" />
          Notification Settings
        </h1>
        <p className="text-slate-500 mt-1">Manage how and when you want to be notified</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Mail className="w-5 h-5 text-slate-500" />
            Global Channels
          </h2>
          <p className="text-sm text-slate-500 mt-1">Enable or disable communication channels completely.</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Email Notifications</p>
              <p className="text-sm text-slate-500">Receive important updates directly in your inbox.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={prefs.email} onChange={() => handleToggle('email')} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">In-App Notifications</p>
              <p className="text-sm text-slate-500">Receive alerts inside the platform.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={prefs.inApp} onChange={() => handleToggle('inApp')} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-slate-500" />
            Specific Events
          </h2>
          <p className="text-sm text-slate-500 mt-1">Choose which types of alerts you want to receive.</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Exam Reminders</p>
              <p className="text-sm text-slate-500">Alerts for upcoming or unfinished exams.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={prefs.examReminders} onChange={() => handleToggle('examReminders')} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Result Publishing</p>
              <p className="text-sm text-slate-500">Notifies you when your mock test results are ready.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={prefs.resultNotifications} onChange={() => handleToggle('resultNotifications')} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">System Announcements</p>
              <p className="text-sm text-slate-500">Important messages from administrators or maintenance alerts.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={prefs.systemAnnouncements} onChange={() => handleToggle('systemAnnouncements')} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900">Marketing & Offers</p>
              <p className="text-sm text-slate-500">Occasional promotional offers for mock test bundles.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={prefs.marketingEmails} onChange={() => handleToggle('marketingEmails')} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={updatePreferences.isPending}
          className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50"
        >
          {updatePreferences.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Save Preferences
        </button>
      </div>
    </div>
  );
}
