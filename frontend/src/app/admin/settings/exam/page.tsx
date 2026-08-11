'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save } from 'lucide-react';
import { useGetSettings, useUpdateExam } from '@/services/adminSettingsApi';
import toast from 'react-hot-toast';

export default function ExamSettingsPage() {
  const { data: settings, isLoading } = useGetSettings();
  const { mutate: updateExam, isPending } = useUpdateExam();
  
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      defaultDuration: 60,
      defaultNegativeMarking: 0,
      autoSubmit: true,
      shuffleQuestions: false,
      shuffleOptions: false,
      passingPercentage: 35,
    }
  });

  useEffect(() => {
    if (settings?.exam) {
      reset({
        defaultDuration: settings.exam.defaultDuration ?? 60,
        defaultNegativeMarking: settings.exam.defaultNegativeMarking ?? 0,
        autoSubmit: settings.exam.autoSubmit ?? true,
        shuffleQuestions: settings.exam.shuffleQuestions ?? false,
        shuffleOptions: settings.exam.shuffleOptions ?? false,
        passingPercentage: settings.exam.passingPercentage ?? 35,
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: any) => {
    updateExam(data, {
      onSuccess: () => {
        toast.success('Exam settings updated successfully');
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
          <h2 className="text-xl font-bold text-slate-900">Exam Preferences</h2>
          <p className="text-sm text-slate-500 mt-1">Global defaults for new mock tests.</p>
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

      <div className="space-y-8 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Default Duration (mins)</label>
            <input 
              type="number"
              {...register('defaultDuration', { valueAsNumber: true })}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Default Passing %</label>
            <input 
              type="number"
              {...register('passingPercentage', { valueAsNumber: true })}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Default Negative Marking</label>
            <input 
              type="number"
              step="0.1"
              {...register('defaultNegativeMarking', { valueAsNumber: true })}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">Exam Experience</h3>
          
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <div>
              <h4 className="text-sm font-medium text-slate-900">Auto Submit</h4>
              <p className="text-xs text-slate-500 mt-1">Automatically submit the exam when the timer ends.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register('autoSubmit')} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <div>
              <h4 className="text-sm font-medium text-slate-900">Shuffle Questions</h4>
              <p className="text-xs text-slate-500 mt-1">Randomize the order of questions for each student.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register('shuffleQuestions')} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
            <div>
              <h4 className="text-sm font-medium text-slate-900">Shuffle Options</h4>
              <p className="text-xs text-slate-500 mt-1">Randomize the order of options within each question.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register('shuffleOptions')} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
