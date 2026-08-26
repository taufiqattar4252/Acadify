'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLogin } from '@/services/authApi';

const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLogin();

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <>
      <h3 className="text-xl font-bold text-foreground mb-6 text-center">Sign in to your account</h3>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="john@example.com"
          {...register('email')}
          error={errors.email?.message}
        />
        
        <div>
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />
          <div className="mt-2 flex justify-end">
            <Link href="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            fullWidth 
            isLoading={loginMutation.isPending}
          >
            Sign in
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
          Register here
        </Link>
      </div>

      <div className="mt-4 text-center text-xs text-muted-foreground">
        Are you a partner?{' '}
        <Link href="/partner-login" className="font-medium text-primary hover:text-primary transition-colors">
          Sign in to Partner Portal
        </Link>
      </div>
    </>
  );
}
