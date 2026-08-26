'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save, AlertCircle } from 'lucide-react';
import { useGetSettings, useUpdatePayment } from '@/services/adminSettingsApi';
import { useUser } from '@/services/authApi';
import toast from 'react-hot-toast';

export default function PaymentSettingsPage() {
  const { data: user } = useUser();
  const { data: settings, isLoading } = useGetSettings();
  const { mutate: updatePayment, isPending } = useUpdatePayment();

  const isSuperAdmin = user?.role === 'Super Admin';

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      razorpayKeyId: '',
      razorpaySecret: '',
      webhookSecret: '',
      currency: 'INR',
      taxPercentage: 18,
      refundPolicy: false,
    }
  });

  useEffect(() => {
    if (settings?.payment) {
      reset({
        razorpayKeyId: settings.payment.razorpayKeyId || '',
        razorpaySecret: settings.payment.razorpaySecret || '',
        webhookSecret: settings.payment.webhookSecret || '',
        currency: settings.payment.currency || 'INR',
        taxPercentage: settings.payment.taxPercentage ?? 18,
        refundPolicy: settings.payment.refundPolicy ?? false,
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: any) => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admins can update payment settings');
      return;
    }

    // Only send secrets if they were changed from the masked '********'
    const payload = { ...data };
    if (payload.razorpaySecret === '********') delete payload.razorpaySecret;
    if (payload.webhookSecret === '********') delete payload.webhookSecret;

    updatePayment(payload, {
      onSuccess: () => {
        toast.success('Payment settings updated successfully');
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to update settings');
      }
    });
  };

  if (isLoading) {
    return <div className="p-8 animate-pulse bg-muted h-full rounded-2xl"></div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-8">
      <div className="flex justify-between items-center border-b border-border pb-6 mb-8">
        <div>
          <h2 className="text-xl font-bold text-foreground">Payment Configuration</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage Razorpay integration and tax details. (Feature on hold!)</p>
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
        <div className="mb-8 p-4 bg-destructive-light border border-red-100 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-800">Restricted Access</h4>
            <p className="text-xs text-destructive mt-1">You do not have permission to modify these settings. Please contact a Super Admin.</p>
          </div>
        </div>
      )}

      <div className="space-y-8 max-w-3xl opacity-100 transition-opacity" style={{ opacity: !isSuperAdmin ? 0.7 : 1 }}>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-muted-foreground mb-2">Razorpay Key ID</label>
            <input
              {...register('razorpayKeyId')}
              disabled={!isSuperAdmin}
              className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:bg-muted"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Razorpay Secret</label>
            <input
              type="password"
              {...register('razorpaySecret')}
              disabled={!isSuperAdmin}
              className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:bg-muted"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Webhook Secret</label>
            <input
              type="password"
              {...register('webhookSecret')}
              disabled={!isSuperAdmin}
              className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:bg-muted"
            />
          </div>
        </div>

        <div className="border-t border-border pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Default Currency</label>
            <select
              {...register('currency')}
              disabled={!isSuperAdmin}
              className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:bg-muted"
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Tax Percentage (%)</label>
            <input
              type="number"
              step="0.01"
              {...register('taxPercentage', { valueAsNumber: true })}
              disabled={!isSuperAdmin}
              className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:bg-muted"
            />
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex items-center justify-between p-4 bg-muted border border-border rounded-xl">
            <div>
              <h4 className="text-sm font-medium text-foreground">Enable Refund Policy</h4>
              <p className="text-xs text-muted-foreground mt-1">Allow automatic processing of eligible refunds through Razorpay.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" {...register('refundPolicy')} disabled={!isSuperAdmin} className="sr-only peer" />
              <div className="w-11 h-6 bg-muted-hover peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50"></div>
            </label>
          </div>
        </div>

      </div>
    </form>
  );
}
