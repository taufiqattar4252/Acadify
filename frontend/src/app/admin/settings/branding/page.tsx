'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Save } from 'lucide-react';
import { useGetSettings, useUpdateBranding } from '@/services/adminSettingsApi';
import toast from 'react-hot-toast';

export default function BrandingSettingsPage() {
  const { data: settings, isLoading } = useGetSettings();
  const { mutate: updateBranding, isPending } = useUpdateBranding();

  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      primaryColor: '#10B981',
      secondaryColor: '#6366F1',
      footerText: '© 2026 Acadify. All rights reserved.',
      seoTitle: 'Acadify - MHT-CET Mock Tests',
      seoDescription: 'Best platform for MHT-CET preparation.',
      socialLinks: {
        facebook: '',
        twitter: '',
        instagram: '',
        linkedin: '',
      }
    }
  });

  useEffect(() => {
    if (settings?.branding) {
      reset({
        primaryColor: settings.branding.primaryColor || '#10B981',
        secondaryColor: settings.branding.secondaryColor || '#6366F1',
        footerText: settings.branding.footerText || '',
        seoTitle: settings.branding.seoTitle || '',
        seoDescription: settings.branding.seoDescription || '',
        socialLinks: {
          facebook: settings.branding.socialLinks?.facebook || '',
          twitter: settings.branding.socialLinks?.twitter || '',
          instagram: settings.branding.socialLinks?.instagram || '',
          linkedin: settings.branding.socialLinks?.linkedin || '',
        }
      });
    }
  }, [settings, reset]);

  const onSubmit = (data: any) => {
    updateBranding(data, {
      onSuccess: () => {
        toast.success('Branding settings updated successfully');
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
          <h2 className="text-xl font-bold text-foreground">Website & Branding</h2>
          <p className="text-sm text-muted-foreground mt-1">Configure appearance, colors, and SEO. (Feature on hold! )</p>
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
            <label className="block text-sm font-medium text-muted-foreground mb-2">Primary Color (Hex)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                {...register('primaryColor')}
                className="w-10 h-10 rounded cursor-pointer border-0 p-0"
              />
              <input
                {...register('primaryColor')}
                className="flex-1 bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 uppercase"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Secondary Color (Hex)</label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                {...register('secondaryColor')}
                className="w-10 h-10 rounded cursor-pointer border-0 p-0"
              />
              <input
                {...register('secondaryColor')}
                className="flex-1 bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 uppercase"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">SEO & Metadata</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">SEO Title</label>
              <input
                {...register('seoTitle')}
                className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">SEO Description</label>
              <textarea
                {...register('seoDescription')}
                rows={3}
                className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Footer & Social</h3>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Footer Copyright Text</label>
              <input
                {...register('footerText')}
                className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Facebook URL</label>
                <input
                  {...register('socialLinks.facebook')}
                  placeholder="https://facebook.com/..."
                  className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Twitter / X URL</label>
                <input
                  {...register('socialLinks.twitter')}
                  placeholder="https://twitter.com/..."
                  className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Instagram URL</label>
                <input
                  {...register('socialLinks.instagram')}
                  placeholder="https://instagram.com/..."
                  className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">LinkedIn URL</label>
                <input
                  {...register('socialLinks.linkedin')}
                  placeholder="https://linkedin.com/..."
                  className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
