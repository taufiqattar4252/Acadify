'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  useGetStudentProfile, 
  useUpdateStudentProfile,
  useChangePassword,
  useUpdateNotificationPreferences
} from '@/services/studentApi';
import { 
  User, Mail, Phone, Calendar, Shield, Save, Loader2, 
  Award, TrendingUp, Key, Bell, CreditCard, Crosshair, 
  BookOpen, CheckCircle2, History, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import Image from 'next/image';

// Zod Schemas
const profileSchema = z.object({
  fullName: z.string().min(3, 'Name must be at least 3 characters'),
  phone: z.string().optional(),
  targetScore: z.number().min(0, 'Score cannot be negative').max(200, 'Score cannot exceed 200').optional().or(z.nan().transform(() => undefined)),
  targetCollege: z.string().optional(),
});
type ProfileFormData = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { data, isLoading } = useGetStudentProfile();
  const updateProfile = useUpdateStudentProfile();
  const changePassword = useChangePassword();
  const updateNotifications = useUpdateNotificationPreferences();

  // Forms
  const { register: registerProfile, handleSubmit: handleProfileSubmit, reset: resetProfile, formState: { errors: profileErrors, isDirty: isProfileDirty } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const user = data?.user;
  const stats = data?.stats;
  const recentActivity = data?.recentActivity || [];

  // Populate form
  useEffect(() => {
    if (user) {
      resetProfile({
        fullName: user.fullName || '',
        phone: user.phone || '',
        targetScore: user.goals?.targetScore || 0,
        targetCollege: user.goals?.targetCollege || '',
      });
    }
  }, [user, resetProfile]);

  const onProfileSubmit = async (formData: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync({
        fullName: formData.fullName,
        phone: formData.phone,
        goals: {
          targetScore: formData.targetScore,
          targetCollege: formData.targetCollege,
        }
      });
      toast.success('Profile updated successfully!');
      resetProfile(formData);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (formData: PasswordFormData) => {
    try {
      await changePassword.mutateAsync({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      toast.success('Password changed successfully!');
      resetPassword({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleNotificationToggle = async (key: string, value: boolean) => {
    try {
      await updateNotifications.mutateAsync({ [key]: value });
      toast.success('Preferences updated!');
    } catch (error) {
      toast.error('Failed to update preferences');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        <Skeleton className="h-48 rounded-2xl w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Skeleton className="h-64 rounded-xl" />
            <Skeleton className="h-80 rounded-xl" />
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-[2rem] shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] border border-border mb-8 overflow-hidden">
        {/* Top Gradient */}
        <div className="h-32 md:h-48 bg-gradient-to-r from-emerald-500 to-teal-600 relative overflow-hidden">
          {/* Subtle overlay (optional) */}
          <div className="absolute inset-0 opacity-[0.03] bg-black mix-blend-overlay"></div>
          
          {/* Large bottom-left curve */}
          <div className="absolute -bottom-[28rem] -left-[16rem] w-[50rem] h-[50rem] rounded-full bg-white/10"></div>
          
          {/* Top-right circle */}
          <div className="absolute -top-12 -right-8 w-40 h-40 md:w-56 md:h-56 rounded-full bg-teal-400/20"></div>
          
          {/* Decorative wavy line */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 1000 200" preserveAspectRatio="none">
            <path d="M 1100 20 C 900 20, 850 180, 700 150 C 550 120, 500 50, 400 60 C 250 75, 200 200, 0 180" fill="none" stroke="white" strokeWidth="1.5" />
          </svg>
        </div>
        
        {/* Bottom Content */}
        <div className="relative px-6 pb-8 md:px-10 flex flex-col xl:flex-row items-center xl:items-start xl:justify-between">
          
          {/* Avatar & Info */}
          <div className="relative -mt-16 md:-mt-20 flex flex-col items-center xl:items-start xl:flex-row xl:gap-6 z-10 w-full xl:w-auto">
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white p-2 shadow-sm">
                <div className="w-full h-full rounded-full bg-success-light flex items-center justify-center text-success text-5xl font-bold overflow-hidden relative">
                  {user?.avatar ? (
                    <Image src={user.avatar} alt={user.fullName} fill className="object-cover" />
                  ) : (
                    user?.fullName?.charAt(0).toUpperCase() || 'S'
                  )}
                </div>
              </div>
              {/* Verified Badge */}
              <div className="absolute bottom-2 right-2 w-8 h-8 md:w-10 md:h-10 bg-[#00BC7D] rounded-full border-[3px] border-white flex items-center justify-center shadow-sm">
                <CheckCircle2 className="w-4 h-4 md:w-6 md:h-6 text-white fill-emerald-500" />
              </div>
            </div>

            <div className="mt-4 xl:mt-20 text-center xl:text-left">
              <h1 className="text-2xl md:text-[28px] font-black text-foreground tracking-tight">{user?.fullName}</h1>
              <p className="text-muted-foreground font-medium text-sm md:text-base mt-0.5">MHT-CET Aspirant</p>
              <div className="flex items-center justify-center xl:justify-start gap-1.5 mt-2 text-muted-foreground text-xs md:text-sm font-medium">
                <MapPin className="w-4 h-4 text-success" /> Maharashtra, India
              </div>
            </div>
          </div>

          {/* Stats & Banner Right */}
          <div className="mt-8 xl:mt-6 w-full xl:w-auto flex flex-col md:flex-row items-center gap-6 xl:gap-10 justify-center">
            
            {/* Stats Row */}
            <div className="flex items-center gap-6 xl:gap-8">
              <div className="hidden xl:block h-16 w-px bg-muted-hover"></div>
              
              <div className="flex flex-col items-center xl:items-start">
                <Crosshair className="w-5 h-5 md:w-6 md:h-6 text-success mb-2" />
                <span className="text-[10px] md:text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Mock Tests</span>
                <span className="text-lg md:text-xl font-bold text-success">{stats?.purchasedMocks || 0}</span>
              </div>
              
              <div className="h-10 w-px bg-muted-hover"></div>
              
              <div className="flex flex-col items-center xl:items-start">
                <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-success mb-2" />
                <span className="text-[10px] md:text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Performance</span>
                <span className="text-lg md:text-xl font-bold text-success">{stats?.accuracy || 0}%</span>
              </div>
              
              <div className="h-10 w-px bg-muted-hover"></div>
              
              <div className="flex flex-col items-center xl:items-start">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-success mb-2" />
                <span className="text-[10px] md:text-[11px] text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Member Since</span>
                <span className="text-lg md:text-xl font-bold text-success">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '--'}
                </span>
              </div>
            </div>

            {/* Motivation Box */}
            <div className="bg-success-light/80 rounded-2xl p-4 md:p-5 border border-emerald-100 flex items-center gap-4 min-w-[220px]">
              <div className="w-12 h-12 rounded-full bg-success-light/70 border border-emerald-200 flex items-center justify-center text-success">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] md:text-xs text-muted-foreground font-medium">Keep Learning,</p>
                <p className="text-sm md:text-base font-bold text-success leading-tight">Keep Growing!</p>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Account Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
            <h3 className="font-bold text-foreground mb-5 flex items-center gap-2">
              <User className="w-5 h-5 text-success" /> Account Info
            </h3>
            <div className="space-y-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground font-medium">Email Address</p>
                  <p className="text-sm font-semibold text-foreground truncate" title={user?.email}>{user?.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Joined On</p>
                  <p className="text-sm font-semibold text-foreground">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '--'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-success-light flex items-center justify-center flex-shrink-0">
                  <Shield className="w-4 h-4 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">Status</p>
                  <p className="text-sm font-semibold text-success">Active & Verified</p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Statistics */}
          {stats && (
            <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
              <h3 className="font-bold text-foreground mb-5 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" /> Statistics
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-xl border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Mocks Owned</p>
                  <p className="text-xl font-bold text-foreground">{stats.purchasedMocks}</p>
                </div>
                <div className="p-4 bg-muted rounded-xl border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Total Spent</p>
                  <p className="text-xl font-bold text-foreground">₹{stats.totalAmountSpent}</p>
                </div>
                <div className="p-4 bg-success-light rounded-xl border border-emerald-100">
                  <p className="text-xs font-medium text-success mb-1">Avg Score</p>
                  <p className="text-xl font-bold text-success">{stats.averageScore}</p>
                </div>
                <div className="p-4 bg-primary-light rounded-xl border border-indigo-100">
                  <p className="text-xs font-medium text-primary mb-1">Accuracy</p>
                  <p className="text-xl font-bold text-primary">{stats.accuracy}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6">
            <h3 className="font-bold text-foreground mb-5 flex items-center gap-2">
              <History className="w-5 h-5 text-success" /> Recent Activity
            </h3>
            
            <div className="space-y-6">
              {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                <div key={activity.id + index} className="flex gap-4 relative">
                  {index !== recentActivity.length - 1 && (
                    <div className="absolute left-[15px] top-8 bottom-[-24px] w-0.5 bg-muted"></div>
                  )}
                  <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center flex-shrink-0 z-10">
                    {activity.type === 'Login' && <User className="w-3 h-3 text-muted-foreground" />}
                    {activity.type === 'Purchase' && <CreditCard className="w-3 h-3 text-success" />}
                    {activity.type === 'Exam' && <BookOpen className="w-3 h-3 text-primary" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.target}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium">{new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Profile Settings */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6 lg:p-8">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Save className="w-5 h-5 text-success" /> Edit Profile
            </h2>
            
            <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input 
                  label="Full Name" 
                  placeholder="Enter your full name" 
                  {...registerProfile('fullName')} 
                  error={profileErrors.fullName?.message} 
                />
                <Input 
                  label="Phone Number" 
                  placeholder="e.g. 9876543210" 
                  {...registerProfile('phone')} 
                  error={profileErrors.phone?.message} 
                />
              </div>

              <div className="pt-6 border-t border-border mt-6">
                <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 text-md">
                  <Crosshair className="w-4 h-4 text-success" /> Target Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input 
                    label="Target Score (Out of 200)" 
                    type="number"
                    placeholder="e.g. 180" 
                    {...registerProfile('targetScore', { valueAsNumber: true })} 
                    error={profileErrors.targetScore?.message} 
                  />
                  <Input 
                    label="Target College" 
                    placeholder="e.g. COEP Pune" 
                    {...registerProfile('targetCollege')} 
                    error={profileErrors.targetCollege?.message} 
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <Button 
                  type="submit" 
                  disabled={!isProfileDirty || updateProfile.isPending}
                  className="gap-2 bg-[#00BC7D] hover:bg-[#00BC7D] focus:ring-emerald-500 text-white rounded-lg px-6"
                >
                  {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6 lg:p-8">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Key className="w-5 h-5 text-muted-foreground" /> Change Password
            </h2>
            
            <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-6 max-w-lg">
              <Input 
                label="Current Password" 
                type="password"
                placeholder="Enter current password" 
                {...registerPassword('currentPassword')} 
                error={passwordErrors.currentPassword?.message} 
              />
              <Input 
                label="New Password" 
                type="password"
                placeholder="Enter new password" 
                {...registerPassword('newPassword')} 
                error={passwordErrors.newPassword?.message} 
              />
              <Input 
                label="Confirm New Password" 
                type="password"
                placeholder="Confirm new password" 
                {...registerPassword('confirmPassword')} 
                error={passwordErrors.confirmPassword?.message} 
              />
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  disabled={changePassword.isPending}
                  variant="secondary"
                  className="gap-2 rounded-lg"
                >
                  {changePassword.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  Update Password
                </Button>
              </div>
            </form>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl shadow-sm border border-border p-6 lg:p-8">
            <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Notification Preferences
            </h2>
            
            <div className="space-y-4 max-w-2xl">
              {[
                { key: 'email', label: 'Email Notifications', desc: 'Receive important updates via email' },
                { key: 'examReminders', label: 'Exam Reminders', desc: 'Get notified before your scheduled exams' },
                { key: 'resultNotifications', label: 'Result Notifications', desc: 'Alerts when your exam results are published' },
                { key: 'marketingEmails', label: 'Promotional Emails', desc: 'Receive offers and marketing emails' },
              ].map((pref) => {
                const isEnabled = (user?.notificationPreferences as any)?.[pref.key] ?? false;
                
                return (
                  <div key={pref.key} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted">
                    <div>
                      <p className="font-semibold text-foreground">{pref.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{pref.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={isEnabled}
                        onChange={(e) => handleNotificationToggle(pref.key, e.target.checked)}
                        disabled={updateNotifications.isPending}
                      />
                      <div className="w-11 h-6 bg-muted-hover peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00BC7D] disabled:opacity-50"></div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
