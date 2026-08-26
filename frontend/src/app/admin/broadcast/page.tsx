'use client';

import React, { useState } from 'react';
import { useAdminBroadcast, useAdminGetNotifications } from '@/services/notificationApi';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Send, History, Radio, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminBroadcastPage() {
  const [activeTab, setActiveTab] = useState<'compose' | 'history'>('compose');
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'Admin Announcement',
    priority: 'Normal',
    actionUrl: '',
    target: 'All Students',
    userIds: '',
    sendEmail: false,
  });

  const broadcastMutation = useAdminBroadcast();
  const { data: historyData, isLoading: historyLoading } = useAdminGetNotifications({ limit: 50 });

  const history = historyData?.data || [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error('Title and Message are required');
      return;
    }

    const payload: any = { ...formData };
    if (formData.target === 'Specific Students') {
      if (!formData.userIds.trim()) {
        toast.error('Please enter at least one Student ID');
        return;
      }
      payload.filters = {
        userIds: formData.userIds.split(',').map(id => id.trim()).filter(Boolean)
      };
    }

    broadcastMutation.mutate(payload, {
      onSuccess: () => {
        toast.success('Broadcast initiated successfully');
        setFormData({
          title: '',
          message: '',
          type: 'Admin Announcement',
          priority: 'Normal',
          actionUrl: '',
          target: 'All Students',
          userIds: '',
          sendEmail: false,
        });
        setActiveTab('history');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to send broadcast');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-border">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Radio className="w-6 h-6 text-primary-500" />
            Broadcast Center
          </h1>
          <p className="text-muted-foreground mt-1">Send announcements and offers to students.</p>
        </div>
        <div className="flex bg-muted p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              activeTab === 'compose' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            <Send className="w-4 h-4" /> Compose
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-2 ${
              activeTab === 'history' ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            <History className="w-4 h-4" /> History
          </button>
        </div>
      </div>

      {activeTab === 'compose' && (
        <div className="bg-white rounded-xl shadow-sm border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Notification Title *"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. System Maintenance"
                required
              />
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Target Audience</label>
                <select
                  name="target"
                  value={formData.target}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none"
                >
                  <option value="All Students">All Students</option>
                  <option value="Purchased Students">Purchased Students</option>
                  <option value="Specific Students">Specific Students (Advanced)</option>
                </select>
              </div>
            </div>

            {formData.target === 'Specific Students' && (
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Student IDs (Comma separated) *</label>
                <Input
                  name="userIds"
                  value={formData.userIds}
                  onChange={handleInputChange}
                  placeholder="e.g. 64955f1f..., 64a88b2c..."
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Enter the exact Object IDs of the students, separated by commas.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Message Content *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                rows={5}
                required
                placeholder="Write your broadcast message here..."
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Notification Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none"
                >
                  <option value="Admin Announcement">Admin Announcement</option>
                  <option value="Promotional Offer">Promotional Offer</option>
                  <option value="System Maintenance">System Maintenance</option>
                  <option value="Exam Reminder">Exam Reminder</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-1">Priority</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-white border border-border rounded-lg focus:ring-2 focus:ring-primary-500/20 outline-none"
                >
                  <option value="Low">Low</option>
                  <option value="Normal">Normal</option>
                  <option value="High">High</option>
                </select>
              </div>
              <Input
                label="Action URL (Optional)"
                name="actionUrl"
                value={formData.actionUrl}
                onChange={handleInputChange}
                placeholder="e.g. /dashboard/mock-tests"
              />
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted border border-border rounded-lg">
              <input
                type="checkbox"
                id="sendEmail"
                name="sendEmail"
                checked={formData.sendEmail}
                onChange={handleCheckboxChange}
                className="w-4 h-4 text-primary-600 rounded border-border focus:ring-primary-500"
              />
              <div>
                <label htmlFor="sendEmail" className="font-medium text-foreground cursor-pointer">
                  Send as Email Broadcast as well
                </label>
                <p className="text-sm text-muted-foreground">Will send emails to all matched users (respecting their preferences).</p>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={broadcastMutation.isPending} className="px-8 flex items-center gap-2">
                {broadcastMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Broadcast
              </Button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
          {historyLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground">
              No broadcast history found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground font-medium">
                  <tr>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Type</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date Sent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((item: any) => (
                    <tr key={item._id} className="hover:bg-muted">
                      <td className="px-6 py-4 font-medium text-foreground">{item.title}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{item.user?.email || 'N/A'}</td>
                      <td className="px-6 py-4">
                        {item.isRead ? (
                          <span className="text-success font-medium text-xs">Read</span>
                        ) : (
                          <span className="text-muted-foreground font-medium text-xs">Unread</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(item.createdAt), 'MMM d, yyyy h:mm a')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
