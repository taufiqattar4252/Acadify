'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { partnerLogin } from '@/services/partnerApi';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const partnerLoginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

type PartnerLoginFormData = z.infer<typeof partnerLoginSchema>;

export default function PartnerLoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, formState: { errors } } = useForm<PartnerLoginFormData>({
    resolver: zodResolver(partnerLoginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: partnerLogin,
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.data.user);
      toast.success('Login successful!');
      router.push('/partner/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });

  const onSubmit = (data: PartnerLoginFormData) => {
    loginMutation.mutate(data);
  };

  return (
    <>
      <h3 className="text-xl font-bold text-slate-900 mb-2 text-center">Partner Portal Login</h3>
      <p className="text-center text-sm text-slate-500 mb-6">
        Manage your affiliates, coupons, and commissions.
      </p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="partner@example.com"
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
            isLoading={loginMutation.isPending}
          >
            Sign in
          </Button>
        </div>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Are you a student?{' '}
        <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
          Student Login
        </Link>
      </div>
    </>
  );
}
