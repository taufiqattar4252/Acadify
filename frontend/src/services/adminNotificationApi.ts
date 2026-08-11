import api from '../lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useGetDashboardStats = () => {
  return useQuery({
    queryKey: ['admin', 'notifications', 'stats'],
    queryFn: async () => {
      const { data } = await api.get('/admin/notifications/dashboard-stats');
      return data.data;
    }
  });
};

export const useGetNotificationHistory = (params: { page: number; limit: number }) => {
  return useQuery({
    queryKey: ['admin', 'notifications', 'history', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/notifications/history', { params });
      return data;
    }
  });
};

export const useSendBroadcast = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/admin/notifications/broadcast', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications'] });
    }
  });
};

export const useGetTemplates = () => {
  return useQuery({
    queryKey: ['admin', 'notifications', 'templates'],
    queryFn: async () => {
      const { data } = await api.get('/admin/notifications/templates');
      return data.data;
    }
  });
};

export const useCreateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/admin/notifications/templates', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications', 'templates'] });
    }
  });
};

export const useUpdateTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, payload }: { id: string, payload: any }) => {
      const { data } = await api.put(`/admin/notifications/templates/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications', 'templates'] });
    }
  });
};

export const useDeleteTemplate = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/admin/notifications/templates/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'notifications', 'templates'] });
    }
  });
};
