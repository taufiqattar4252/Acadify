import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

// Get student attempt history
export const useGetStudentAttempts = () => {
  return useQuery({
    queryKey: ['student-attempts'],
    queryFn: async () => {
      const response = await api.get('/student/results');
      return response.data.data;
    },
  });
};

// Get specific attempt details
export const useGetAttemptDetails = (attemptId: string) => {
  return useQuery({
    queryKey: ['attempt-details', attemptId],
    queryFn: async () => {
      if (!attemptId) return null;
      const response = await api.get(`/student/results/${attemptId}`);
      return response.data.data;
    },
    enabled: !!attemptId,
  });
};

// Admin Analytics
export const useGetAdminAnalytics = () => {
  return useQuery({
    queryKey: ['admin-analytics-results'],
    queryFn: async () => {
      const response = await api.get('/admin/analytics');
      return response.data.data;
    },
  });
};

export const useGetAllAttempts = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['admin-attempts', page, limit],
    queryFn: async () => {
      const response = await api.get(`/admin/attempts?page=${page}&limit=${limit}`);
      return response.data;
    },
  });
};
