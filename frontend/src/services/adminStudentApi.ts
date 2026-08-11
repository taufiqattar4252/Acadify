import api from '../lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export const useAdminGetStudents = (params: any) => {
  return useQuery({
    queryKey: ['admin-students', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/students', { params });
      return data;
    },
  });
};

export const useAdminGetStudentStats = () => {
  return useQuery({
    queryKey: ['admin-student-stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/students/stats');
      return data.data;
    },
  });
};

export const useAdminGetStudentDetails = (id: string) => {
  return useQuery({
    queryKey: ['admin-student-details', id],
    queryFn: async () => {
      const { data } = await api.get(`/admin/students/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
};

export const useAdminToggleStudentBlock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'block' | 'unblock' }) => {
      const { data } = await api.patch(`/admin/students/${id}/${action}`);
      return data;
    },
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-students'] });
      queryClient.invalidateQueries({ queryKey: ['admin-student-details'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  });
};

export const useAdminResetStudentPassword = () => {
  return useMutation({
    mutationFn: async ({ id, newPassword }: { id: string; newPassword: string }) => {
      const { data } = await api.patch(`/admin/students/${id}/reset-password`, { newPassword });
      return data;
    },
    onSuccess: () => {
      toast.success('Password reset successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  });
};

export const useAdminGrantMockTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, mockTestId }: { id: string; mockTestId: string }) => {
      const { data } = await api.post(`/admin/students/${id}/grant-mock`, { mockTestId });
      return data;
    },
    onSuccess: () => {
      toast.success('Mock test granted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-student-details'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to grant mock test');
    }
  });
};
