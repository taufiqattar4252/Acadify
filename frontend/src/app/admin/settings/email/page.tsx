'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Save, AlertCircle, Send } from 'lucide-react';
import { useGetSettings, useUpdateEmail, useTestEmail } from '@/services/adminSettingsApi';
import { useUser } from '@/services/authApi';
import toast from 'react-hot-toast';

export default function EmailSettingsPage() {
  const { data: user } = useUser();
  const { data: settings, isLoading } = useGetSettings();
  const { mutate: updateEmail, isPending: isUpdating } = useUpdateEmail();
  const { mutate: testEmail, isPending: isTesting } = useTestEmail();
  
  const [testEmailAddress, setTestEmailAddress] = useState('');
  const [testEmailMessage, setTestEmailMessage] = useState('');
  
  const isSuperAdmin = user?.role === 'Super Admin';

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      provider: 'smtp',
      senderName: 'Acadify Support',
      senderEmail: 'noreply@acadify.com',
    }
  });

  useEffect(() => {
    if (settings?.email) {
      reset({
        provider: settings.email.provider || 'smtp',
        senderName: settings.email.senderName || 'Acadify Support',
        senderEmail: settings.email.senderEmail || 'noreply@acadify.com',
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: any) => {
    if (!isSuperAdmin) {
      toast.error('Only Super Admins can update email settings');
      return;
    }

    const payload = { ...data };

    updateEmail(payload, {
      onSuccess: () => {
        toast.success('Email settings updated successfully');
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to update settings');
      }
    });
  };

  const handleTestEmail = () => {
    if (!testEmailAddress) {
      toast.error('Please enter an email address to test');
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testEmailAddress)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    testEmail({ to: testEmailAddress, message: testEmailMessage }, {
      onSuccess: () => {
        toast.success(`Test email sent to ${testEmailAddress}`);
        setTestEmailAddress('');
        setTestEmailMessage('');
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to send test email');
      }
    });
  };

  if (isLoading) {
    return <div className="p-8 animate-pulse bg-muted h-full rounded-2xl"></div>;
  }

  return (
    <div className="p-8">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-between items-center border-b border-border pb-6 mb-8">
          <div>
            <h2 className="text-xl font-bold text-foreground">Email Delivery</h2>
            <p className="text-sm text-muted-foreground mt-1">Configure SMTP or third-party email providers.</p>
          </div>
          {isSuperAdmin && (
            <button 
              type="submit"
              disabled={isUpdating}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 text-white font-medium rounded-xl hover:bg-primary-700 transition-colors shadow-sm shadow-primary-500/20 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>

        {!isSuperAdmin && (
          <div className="mb-8 p-4 bg-destructive-light border border-red-100 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-800">Restricted Access</h4>
              <p className="text-xs text-destructive mt-1">You do not have permission to modify these settings.</p>
            </div>
          </div>
        )}

        <div className="space-y-8 max-w-3xl opacity-100 transition-opacity" style={{ opacity: !isSuperAdmin ? 0.7 : 1 }}>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted-foreground mb-2">Email Provider</label>
              <select 
                {...register('provider')}
                disabled={!isSuperAdmin}
                className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:bg-muted"
              >
                <option value="smtp">Standard SMTP</option>
                <option value="resend">Resend</option>
                <option value="sendgrid">SendGrid</option>
                <option value="aws_ses">AWS SES</option>
              </select>
            </div>
          </div>

          <div className="border-t border-border pt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Sender Name</label>
              <input 
                {...register('senderName')}
                disabled={!isSuperAdmin}
                className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:bg-muted"
                placeholder="e.g. Acadify Support"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Sender Email</label>
              <input 
                type="email"
                {...register('senderEmail')}
                disabled={!isSuperAdmin}
                className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 disabled:bg-muted"
                placeholder="e.g. no-reply@acadify.com"
              />
            </div>
          </div>
        </div>
      </form>

      {/* Test Email Section (Outside main form so it doesn't trigger submit) */}
      {isSuperAdmin && (
        <div className="mt-12 p-6 bg-muted border border-border rounded-2xl max-w-3xl">
          <h3 className="text-sm font-bold text-foreground mb-4">Send Test Email</h3>
          <div className="flex flex-col gap-4">
            <input 
              type="email"
              value={testEmailAddress}
              onChange={(e) => setTestEmailAddress(e.target.value)}
              placeholder="Receiver's Email Address"
              className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
            <textarea
              value={testEmailMessage}
              onChange={(e) => setTestEmailMessage(e.target.value)}
              placeholder="Custom email message (optional)"
              rows={3}
              className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
            />
            <div className="flex justify-end">
              <button 
                onClick={handleTestEmail}
                disabled={isTesting}
                className="flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-900 transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                {isTesting ? 'Sending...' : 'Send Test'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
