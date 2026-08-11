'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useForgotPassword } from '@/services/authApi';
import { Mail } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const forgotPasswordMutation = useForgotPassword();

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotPasswordMutation.mutate(data);
  };

  if (forgotPasswordMutation.isSuccess) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <Mail className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Check your email</h3>
        <p className="text-slate-600 mb-6">
          We've sent a password reset link to your email address. Please check your inbox.
        </p>
        <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <>
      <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Reset your password</h3>
      <p className="text-center text-sm text-slate-600 mb-6">
        Enter your email address and we will send you a link to reset your password.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="john@example.com"
          {...register('email')}
          error={errors.email?.message}
        />

        <div className="pt-2">
          <Button 
            type="submit" 
            fullWidth 
            isLoading={forgotPasswordMutation.isPending}
          >
            Send reset link
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Remember your password?{' '}
        <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
          Back to login
        </Link>
      </div>
    </>
  );
}
