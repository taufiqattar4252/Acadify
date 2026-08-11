'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Bell, Send, Calendar, Clock, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useSendBroadcast } from '@/services/adminNotificationApi';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function CreateBroadcastPage() {
  const router = useRouter();
  const { mutate: sendBroadcast, isPending } = useSendBroadcast();
  const [isScheduled, setIsScheduled] = useState(false);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm({
    defaultValues: {
      title: '',
      message: '',
      html: '',
      type: 'Admin Announcement',
      priority: 'Normal',
      targetAudience: 'All Students',
      sendInApp: true,
      sendEmail: false,
      scheduledDate: '',
      scheduledTime: '',
    }
  });

  const watchSendEmail = watch('sendEmail');

  const onSubmit = (data: any) => {
    let scheduledAt = null;
    if (isScheduled && data.scheduledDate && data.scheduledTime) {
      scheduledAt = new Date(`${data.scheduledDate}T${data.scheduledTime}`).toISOString();
    }

    sendBroadcast(
      { ...data, scheduledAt },
      {
        onSuccess: () => {
          toast.success(scheduledAt ? 'Broadcast scheduled!' : 'Broadcast sent successfully!');
          router.push('/admin/notifications');
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Failed to send broadcast');
        }
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="flex items-center gap-4 mb-8">
        <Link 
          href="/admin/notifications"
          className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Broadcast</h1>
          <p className="text-sm text-slate-500 mt-1">Send a notification or email to students.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-500" /> Message Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Notification Type</label>
              <select 
                {...register('type')}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="Admin Announcement">Admin Announcement</option>
                <option value="System Maintenance">System Maintenance</option>
                <option value="Promotional Offer">Promotional Offer</option>
                <option value="Exam Reminder">Exam Reminder</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
              <select 
                {...register('priority')}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="Low">Low</option>
                <option value="Normal">Normal</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Title / Subject</label>
            <input 
              {...register('title', { required: 'Title is required' })}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              placeholder="E.g., Scheduled Maintenance this Sunday"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">Message Content (In-App & Fallback Email)</label>
            <textarea 
              {...register('message', { required: 'Message is required' })}
              rows={4}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              placeholder="Keep it brief for push notifications..."
            />
            {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message.message as string}</p>}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-500" /> Delivery Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Target Audience</label>
              <select 
                {...register('targetAudience')}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="All Students">All Students</option>
                <option value="Purchased Students">Purchased Students</option>
                <option value="Inactive Students">Inactive Students</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Delivery Channels</label>
              <div className="flex flex-col gap-3 mt-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register('sendInApp')} className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-slate-700">In-App Notification Center</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register('sendEmail')} className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-slate-700">Email</span>
                </label>
              </div>
            </div>
          </div>

          {watchSendEmail && (
            <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="block text-sm font-medium text-slate-700 mb-2">HTML Email Body (Optional)</label>
              <p className="text-xs text-slate-500 mb-3">If provided, this HTML will be sent instead of the plain text message above.</p>
              <textarea 
                {...register('html')}
                rows={6}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                placeholder="<h1>Hello {{userName}}</h1><p>...</p>"
              />
            </div>
          )}

          <div className="border-t border-slate-100 pt-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-slate-700">Schedule for later?</label>
              <button 
                type="button"
                onClick={() => setIsScheduled(!isScheduled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isScheduled ? 'bg-primary-600' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isScheduled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {isScheduled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2"><Calendar className="w-4 h-4" /> Date</label>
                  <input 
                    type="date"
                    {...register('scheduledDate')}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2"><Clock className="w-4 h-4" /> Time</label>
                  <input 
                    type="time"
                    {...register('scheduledTime')}
                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Link 
            href="/admin/notifications"
            className="px-6 py-3 rounded-xl font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={isPending}
            className="px-6 py-3 rounded-xl font-medium text-white bg-primary-600 hover:bg-primary-700 shadow-sm shadow-primary-500/20 transition-colors flex items-center gap-2"
          >
            {isPending ? 'Processing...' : isScheduled ? 'Schedule Broadcast' : 'Send Now'}
            {!isPending && <Send className="w-4 h-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}
