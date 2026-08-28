import api from '../lib/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export const useRegister = () => {
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Registration successful! You can now log in.');
      router.push('/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Registration failed');
    },
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/auth/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Login successful!');
      queryClient.setQueryData(['user'], data.data.user);
      router.push('/dashboard'); // generic redirect
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Login failed');
    },
  });
};

export const useAdminLogin = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/auth/admin/login', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Admin login successful!');
      queryClient.setQueryData(['user'], data.data.admin);
      router.push('/admin'); // Redirect to admin dashboard
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Admin login failed');
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const response = await api.post('/auth/logout');
      return response.data;
    },
    onSuccess: () => {
      toast.success('Logged out successfully');
      queryClient.clear();
      router.push('/login');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Logout failed');
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await api.post('/auth/forgot-password', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Password reset link sent to your email.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    },
  });
};

export const useResetPassword = (token: string) => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post(`/auth/reset-password/${token}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password reset successfully! You are now logged in.');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    },
  });
};

export const useVerifyEmail = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (token: string) => {
      const response = await api.post(`/auth/verify-email/${token}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Email verified successfully! You are now logged in.');
      router.push('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Verification failed. The token may be expired or invalid.');
    },
  });
};

export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const response = await api.get('/auth/me');
        return response.data.data.user;
      } catch (error) {
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useSendOtp = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await api.post('/auth/send-otp', { email });
      return response.data;
    },
    onSuccess: (data: any) => {
      toast.success(data.message || 'OTP sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to send verification code. Please try again.');
    },
  });
};

export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const response = await api.post('/auth/verify-otp', data);
      return response.data;
    },
    onSuccess: (data: any) => {
      toast.success(data.message || 'Email verified successfully!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Verification failed');
    },
  });
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const response = await api.post('/auth/check-email', { email });
    return response.data.exists;
  } catch (error) {
    return false;
  }
};
