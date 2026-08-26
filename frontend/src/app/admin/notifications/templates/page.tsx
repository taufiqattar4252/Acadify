'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { FileText, Plus, Edit2, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import { useGetTemplates, useCreateTemplate, useDeleteTemplate } from '@/services/adminNotificationApi';
import toast from 'react-hot-toast';

export default function TemplatesPage() {
  const { data: templates, isLoading } = useGetTemplates();
  const { mutate: deleteTemplate } = useDeleteTemplate();
  const { mutate: createTemplate, isPending: isCreating } = useCreateTemplate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      name: '',
      type: 'Admin Announcement',
      subject: '',
      bodyHtml: '',
      inAppMessage: '',
    }
  });

  const onSubmit = (data: any) => {
    createTemplate(data, {
      onSuccess: () => {
        toast.success('Template created!');
        setIsModalOpen(false);
        reset();
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to create template');
      }
    });
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id, {
        onSuccess: () => toast.success('Template deleted')
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/notifications"
            className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Notification Templates</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage reusable email and in-app templates.</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 rounded-xl text-white font-medium hover:bg-primary-700 transition-colors shadow-sm shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" />
          New Template
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted border-b border-border">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Created By</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading templates...
                  </td>
                </tr>
              ) : templates?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                    No templates found. Create your first one!
                  </td>
                </tr>
              ) : (
                templates?.map((template: any) => (
                  <tr key={template._id} className="hover:bg-muted transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="font-medium text-foreground">{template.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                        {template.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {template.createdBy?.fullName || 'Admin'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleDelete(template._id)}
                        className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive-light rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-border p-6 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-foreground">Create Template</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-muted-foreground">
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Template Name</label>
                  <input 
                    {...register('name', { required: 'Name is required' })}
                    className="w-full bg-muted border border-border text-foreground rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                    placeholder="e.g. Exam Reminder Generic"
                  />
                  {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Type</label>
                  <select 
                    {...register('type')}
                    className="w-full bg-muted border border-border text-foreground rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  >
                    <option value="Admin Announcement">Admin Announcement</option>
                    <option value="System Maintenance">System Maintenance</option>
                    <option value="Exam Reminder">Exam Reminder</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Email Subject</label>
                <input 
                  {...register('subject')}
                  className="w-full bg-muted border border-border text-foreground rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  placeholder="Subject line for emails"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">In-App Message</label>
                <textarea 
                  {...register('inAppMessage')}
                  rows={3}
                  className="w-full bg-muted border border-border text-foreground rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  placeholder="Plain text for the in-app notification center"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">HTML Email Body</label>
                <textarea 
                  {...register('bodyHtml')}
                  rows={5}
                  className="w-full bg-muted border border-border text-foreground font-mono text-sm rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  placeholder="<h1>Hello {{userName}}</h1>"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-muted-foreground bg-muted hover:bg-muted-hover rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreating}
                  className="px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-xl font-medium transition-colors flex items-center gap-2"
                >
                  {isCreating ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
