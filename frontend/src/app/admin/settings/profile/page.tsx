'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Camera, Save, User as UserIcon, Lock } from 'lucide-react';
import { useUpdateProfile } from '@/services/adminSettingsApi';
import { useUser } from '@/services/authApi';
import toast from 'react-hot-toast';

export default function ProfileSettingsPage() {
  const { data: user, isLoading: isUserLoading } = useUser();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  
  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      phoneNumber: '',
      password: '',
      confirmPassword: '',
    }
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [user, reset]);

  const password = watch('password');

  const onSubmit = (data: any) => {
    if (data.password && data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const payload: any = {
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber,
    };
    
    if (data.password) {
      payload.password = data.password;
    }

    updateProfile(payload, {
      onSuccess: () => {
        toast.success('Profile updated successfully');
        reset({ ...data, password: '', confirmPassword: '' });
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || 'Failed to update profile');
      }
    });
  };

  if (isUserLoading) {
    return <div className="p-8 animate-pulse bg-muted h-full rounded-2xl"></div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-8">
      <div className="flex justify-between items-center border-b border-border pb-6 mb-8">
        <div>
          <h2 className="text-xl font-bold text-foreground">Personal Profile</h2>
          <p className="text-sm text-muted-foreground mt-1">Update your personal information and security details.</p>
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

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Avatar Section */}
        <div className="flex flex-col items-center shrink-0">
          <div className="w-32 h-32 rounded-full bg-muted border-4 border-white shadow-sm overflow-hidden relative group mb-4">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary-50 text-primary-500">
                <UserIcon className="w-12 h-12" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <span className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full uppercase tracking-wider">
            {user?.role}
          </span>
          {user?.lastLogin && (
            <p className="text-xs text-muted-foreground mt-4">
              Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'N/A'}
            </p>
          )}
        </div>

        {/* Form Fields */}
        <div className="flex-1 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Full Name</label>
              <input 
                {...register('fullName', { required: 'Name is required' })}
                className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
              {errors.fullName && <p className="text-destructive text-xs mt-1">{errors.fullName.message as string}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Email Address</label>
              <input 
                type="email"
                {...register('email', { required: 'Email is required' })}
                className="w-full bg-muted border border-border text-muted-foreground rounded-xl px-4 py-2.5 cursor-not-allowed"
                readOnly
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Phone Number</label>
              <input 
                {...register('phoneNumber')}
                className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                placeholder="+91 9876543210"
              />
            </div>
          </div>

          <div className="border-t border-border pt-8">
            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-muted-foreground" />
              Security
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">New Password</label>
                <input 
                  type="password"
                  {...register('password')}
                  className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  placeholder="Leave blank to keep current"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Confirm New Password</label>
                <input 
                  type="password"
                  {...register('confirmPassword')}
                  className="w-full bg-white border border-border text-foreground rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  placeholder="Leave blank to keep current"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
