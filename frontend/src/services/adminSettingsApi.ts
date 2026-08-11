import api from '../lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useGetSettings = () => {
  return useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: async () => {
      const { data } = await api.get('/admin/settings');
      return data.data;
    }
  });
};

const createSettingUpdateHook = (section: string) => {
  return () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (payload: any) => {
        const { data } = await api.put(`/admin/settings/${section}`, payload);
        return data.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'settings'] });
      }
    });
  };
};

export const useUpdateProfile = createSettingUpdateHook('profile');
export const useUpdateGeneral = createSettingUpdateHook('general');
export const useUpdateExam = createSettingUpdateHook('exam');
export const useUpdatePayment = createSettingUpdateHook('payment');
export const useUpdateEmail = createSettingUpdateHook('email');
export const useUpdateNotifications = createSettingUpdateHook('notifications');
export const useUpdateRoles = createSettingUpdateHook('roles');
export const useUpdateBranding = createSettingUpdateHook('branding');
export const useUpdateSecurity = createSettingUpdateHook('security');

export const useTestEmail = () => {
  return useMutation({
    mutationFn: async (payload: { to: string; message?: string }) => {
      const { data } = await api.post('/admin/settings/email/test', payload);
      return data;
    }
  });
};
