'use client';

import React, { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { useResetPassword } from '@/services/authApi';
import { AlertCircle, Lock, Eye, EyeOff } from 'lucide-react';

const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const resetPasswordMutation = useResetPassword(token || '');

  const onSubmit = (data: ResetPasswordFormData) => {
    resetPasswordMutation.mutate(data);
  };

  const errorMessage = resetPasswordMutation.error ? ((resetPasswordMutation.error as any).response?.data?.message || 'Failed to reset password') : null;
  const successMessage = resetPasswordMutation.isSuccess ? 'Password reset successfully! You are now logged in.' : null;

  if (!token) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-destructive-light mb-4">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Invalid Token</h3>
        <p className="text-muted-foreground">
          The password reset token is missing. Please check your email link again or request a new one.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold font-sans text-foreground tracking-tight mb-0.5">Set New Password</h2>
        <p className="text-muted-foreground text-xs font-medium">Create a new, strong password for your account.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {errorMessage && <Alert type="error" message={errorMessage} />}
        {successMessage && <Alert type="success" message={successMessage} />}

        <Input
          label="New Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          icon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-muted-foreground focus:outline-none">
              {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          }
          {...register('password')}
          error={errors.password?.message}
        />

        <div className="space-y-1.5">
          <Input
            label="Confirm New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="••••••••"
            icon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="hover:text-muted-foreground focus:outline-none">
                {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            }
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            fullWidth 
            disabled={!watch('password') || !watch('confirmPassword')}
            className="!bg-emerald-500 hover:!bg-emerald-600 text-white py-3 !rounded-xl text-sm font-semibold transition-colors shadow-md shadow-emerald-500/20 !border-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none hover:!border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            isLoading={resetPasswordMutation.isPending}
          >
            Reset Password
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
