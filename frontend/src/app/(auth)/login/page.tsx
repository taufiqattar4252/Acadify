'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLogin } from '@/services/authApi';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useLogin();

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold font-sans text-foreground tracking-tight mb-0.5">Welcome Back</h2>
        <p className="text-muted-foreground text-xs font-medium">Sign in to your account to continue.</p>
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
        
        <div className="space-y-1.5">
          <Input
            label="Password"
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
          <div className="flex justify-end pt-1">
            <Link href="/forgot-password" className="text-xs font-semibold text-emerald-500 hover:text-emerald-600 transition-colors">
              Forgot your password?
            </Link>
          </div>
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            fullWidth 
            className="!bg-emerald-500 hover:!bg-emerald-600 text-white py-3 !rounded-xl text-sm font-semibold transition-colors shadow-md shadow-emerald-500/20 !border-0 focus:!ring-0 focus:!ring-offset-0 focus:!outline-none hover:!border-transparent"
            isLoading={loginMutation.isPending}
          >
            Sign in
          </Button>
        </div>
      </form>

      <div className="mt-8 text-center text-sm font-medium text-muted-foreground">
        Don't have an account?{' '}
        <Link href="/register" className="font-bold text-emerald-500 hover:text-emerald-600 transition-colors">
          Register here
        </Link>
      </div>

    </div>
  );
}
