import api from '../lib/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export const useRegister = () => {
  const router = useRouter();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/auth/register', data);
      return response.data;
    },
    onSuccess: (data) => {
      router.push('/login');
    },
    onError: (error: any) => {
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
      queryClient.setQueryData(['user'], data.data.user);
      router.push('/dashboard'); // generic redirect
    },
    onError: (error: any) => {
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
      queryClient.setQueryData(['user'], data.data.admin);
      router.push('/admin'); // Redirect to admin dashboard
    },
    onError: (error: any) => {
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
      queryClient.clear();
      router.push('/login');
    },
    onError: (error: any) => {
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
    },
    onError: (error: any) => {
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
      router.push('/dashboard');
    },
    onError: (error: any) => {
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
      router.push('/dashboard');
    },
    onError: (error: any) => {
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
    },
    onError: (error: any) => {
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
    },
    onError: (error: any) => {
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
