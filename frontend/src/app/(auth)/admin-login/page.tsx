'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAdminLogin } from '@/services/authApi';

const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useAdminLogin();

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <>
      <div className="mb-6 flex flex-col items-center">
        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold tracking-wide uppercase mb-4">
          Restricted Area
        </span>
        <h3 className="text-xl font-bold text-slate-900 text-center">Admin Portal Login</h3>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Admin Email"
          type="email"
          placeholder="admin@acadify.com"
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
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            fullWidth 
            variant="danger"
            isLoading={loginMutation.isPending}
          >
            Access Dashboard
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Not an administrator?{' '}
        <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
          Student Login
        </Link>
      </div>
    </>
  );
}
