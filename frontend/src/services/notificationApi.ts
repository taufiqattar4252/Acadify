import api from '../lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: string;
  priority: 'Low' | 'Normal' | 'High';
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  image?: string;
  createdAt: string;
}

export interface NotificationPreferences {
  email: boolean;
  inApp: boolean;
  examReminders: boolean;
  resultNotifications: boolean;
  marketingEmails: boolean;
  systemAnnouncements: boolean;
}

export const useGetNotifications = (params?: { page?: number; limit?: number; isRead?: boolean; type?: string; search?: string }) => {
  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      const { data } = await api.get('/student/notifications', { params });
      return data;
    },
  });
};

export const useGetUnreadCount = () => {
  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get('/student/notifications/unread-count');
      return data.count;
    },
    refetchInterval: 60000, // Poll every minute
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/student/notifications/${id}/read`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.patch('/student/notifications/read-all');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/student/notifications/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useUpdateNotificationPreferences = () => {
  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      const { data } = await api.patch('/student/notification-preferences', { preferences });
      return data;
    },
  });
};

// Admin Endpoints
export const useAdminBroadcast = () => {
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post('/admin/notifications/broadcast', payload);
      return data;
    },
  });
};

export const useAdminGetNotifications = (params?: { page?: number; limit?: number }) => {
  return useQuery({
    queryKey: ['admin-notifications', params],
    queryFn: async () => {
      const { data } = await api.get('/admin/notifications/history', { params });
      return data;
    },
  });
};
