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
      <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300 text-center py-4">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
          <Mail className="h-6 w-6 text-emerald-500" />
        </div>
        <div className="mb-8">
          <h2 className="text-2xl font-semibold font-sans text-foreground tracking-tight mb-0.5">Check your email</h2>
          <p className="text-muted-foreground text-xs font-medium mt-2">
            We've sent a password reset link to your email address. Please check your inbox.
          </p>
        </div>
        <Link href="/login" className="font-semibold text-emerald-500 hover:text-emerald-600 transition-colors text-sm">
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold font-sans text-foreground tracking-tight mb-0.5">Reset Password</h2>
        <p className="text-muted-foreground text-xs font-medium">Enter your email address to receive a reset link.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          icon={<Mail className="w-4 h-4" />}
          {...register('email')}
          error={errors.email?.message}
        />

        <div className="pt-2">
          <Button 
            type="submit" 
            fullWidth 
            className="!bg-emerald-500 hover:!bg-emerald-600 text-white py-3 !rounded-xl text-sm font-semibold transition-colors shadow-md shadow-emerald-500/20 !border-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none hover:!border-transparent"
            isLoading={forgotPasswordMutation.isPending}
          >
            Send reset link
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
        Remember your password?{' '}
        <Link href="/login" className="font-semibold text-emerald-500 hover:text-emerald-600 transition-colors">
          Back to login
        </Link>
      </div>
    </div>
  );
}
