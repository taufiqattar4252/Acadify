'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save } from 'lucide-react';
import { useGetSettings, useUpdateGeneral } from '@/services/adminSettingsApi';
import toast from 'react-hot-toast';

export default function GeneralSettingsPage() {
  const { data: settings, isLoading } = useGetSettings();
  const { mutate: updateGeneral, isPending } = useUpdateGeneral();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      platformName: '',
      supportEmail: '',
      supportPhone: '',
      maintenanceMode: false,
    }
  });

  useEffect(() => {
    if (settings?.general) {
      reset({
        platformName: settings.general.platformName || '',
        supportEmail: settings.general.supportEmail || '',
        supportPhone: settings.general.supportPhone || '',
        maintenanceMode: settings.general.maintenanceMode || false,
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: any) => {
    updateGeneral(data, {
      onSuccess: () => {
        toast.success('General settings updated successfully');
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
          <h2 className="text-xl font-bold text-slate-900">General Settings</h2>
          <p className="text-sm text-slate-500 mt-1">Configure basic platform details.</p>
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
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Platform Name</label>
            <input 
              {...register('platformName', { required: 'Platform name is required' })}
              className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
            {errors.platformName && <p className="text-red-500 text-xs mt-1">{errors.platformName.message as string}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Support Email</label>
              <input 
                type="email"
                {...register('supportEmail', { required: 'Support email is required' })}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
              {errors.supportEmail && <p className="text-red-500 text-xs mt-1">{errors.supportEmail.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Support Phone (Optional)</label>
              <input 
                {...register('supportPhone')}
                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8">
          <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-100 rounded-xl">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Maintenance Mode</h3>
              <p className="text-xs text-slate-500 mt-1">When enabled, students will not be able to access the platform.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register('maintenanceMode')} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </label>
          </div>
        </div>
      </div>
    </form>
  );
}
