'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPartnerProfile, updatePartnerProfile } from '@/services/partnerApi';
import toast from 'react-hot-toast';

export default function PartnerProfilePage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['partnerProfile'],
    queryFn: getPartnerProfile,
  });

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    if (data?.partner) {
      setFormData({
        fullName: data.partner.fullName || '',
        phone: data.partner.phone || '',
        password: '',
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: updatePartnerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partnerProfile'] });
      toast.success('Profile updated successfully');
      setFormData(prev => ({ ...prev, password: '' })); // clear password field
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: any = {
      fullName: formData.fullName,
      phone: formData.phone,
    };
    if (formData.password) {
      updateData.password = formData.password;
    }
    updateMutation.mutate(updateData);
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading Profile...</div>;
  }

  const partner = data?.partner;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Profile Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input 
              type="email" 
              value={partner?.email || ''} 
              disabled 
              className="w-full border p-2 rounded-lg bg-gray-50 text-gray-500 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-400 cursor-not-allowed" 
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input 
              type="text" 
              required
              value={formData.fullName} 
              onChange={(e) => setFormData({...formData, fullName: e.target.value})} 
              className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
            <input 
              type="text" 
              value={formData.phone} 
              onChange={(e) => setFormData({...formData, phone: e.target.value})} 
              className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
            />
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Change Password</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input 
                type="password" 
                placeholder="Leave blank to keep current password"
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit" 
              disabled={updateMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow-sm transition disabled:opacity-50"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
