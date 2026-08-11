import api from '../lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface PurchaseFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: string;
  maxAmount?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useGetPurchases = (filters: PurchaseFilters) => {
  return useQuery({
    queryKey: ['admin', 'purchases', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
      const { data } = await api.get(`/admin/purchases?${params.toString()}`);
      return data.data;
    }
  });
};

export const useGetPurchaseDetails = (id: string | null) => {
  return useQuery({
    queryKey: ['admin', 'purchases', id],
    queryFn: async () => {
      if (!id) return null;
      const { data } = await api.get(`/admin/purchases/${id}`);
      return data.data;
    },
    enabled: !!id
  });
};

export const useGrantAccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/admin/purchases/${id}/grant-access`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'purchases'] });
    }
  });
};

export const useRevokeAccess = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/admin/purchases/${id}/revoke-access`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'purchases'] });
    }
  });
};

export const useRefundPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/admin/purchases/${id}/refund`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'purchases'] });
    }
  });
};

export const useResendEmail = () => {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/admin/purchases/${id}/resend-email`);
      return data;
    }
  });
};

export const useDeletePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/admin/purchases/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'purchases'] });
    }
  });
};
