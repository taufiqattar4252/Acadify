import api from '../lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export interface MockTest {
  _id: string;
  title: string;
  slug: string;
  category: string;
  description?: string;
  thumbnail?: string;
  instructions?: string;
  duration: number;
  passingMarks: number;
  totalMarks: number;
  price: number;
  discountPrice?: number;
  language: string;
  status: 'Draft' | 'Published' | 'Archived' | 'Hidden';
  featured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  questions: any[]; // Populated questions or ObjectIds
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockTestsResponse {
  tests: MockTest[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export const useGetMockTests = (
  page = 1,
  limit = 10,
  search = '',
  status = '',
  category = '',
  createdBy = '',
  sort = '-createdAt'
) => {
  return useQuery({
    queryKey: ['mockTests', page, limit, search, status, category, createdBy, sort],
    queryFn: async (): Promise<MockTestsResponse> => {
      const { data } = await api.get('/admin/mock-tests', {
        params: { page, limit, search, status, category, createdBy, sort },
      });
      return data.data;
    },
  });
};

export const useGetMockTest = (id: string) => {
  return useQuery({
    queryKey: ['mockTest', id],
    queryFn: async (): Promise<MockTest> => {
      const { data } = await api.get(`/admin/mock-tests/${id}`);
      return data.data.test;
    },
    enabled: !!id,
  });
};

export const useCreateMockTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newMockTest: Partial<MockTest>) => {
      const { data } = await api.post('/admin/mock-tests', newMockTest);
      return data.data.test;
    },
    onSuccess: () => {
      toast.success('Mock Test created successfully');
      queryClient.invalidateQueries({ queryKey: ['mockTests'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create mock test');
    },
  });
};

export const useUpdateMockTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MockTest> }) => {
      const response = await api.put(`/admin/mock-tests/${id}`, data);
      return response.data.data.test;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['mockTests'] });
      queryClient.invalidateQueries({ queryKey: ['mockTest', variables.id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update mock test');
    },
  });
};

export const useUpdateMockTestStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await api.patch(`/admin/mock-tests/${id}/status`, { status });
      return data.data.test;
    },
    onSuccess: (_, variables) => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['mockTests'] });
      queryClient.invalidateQueries({ queryKey: ['mockTest', variables.id] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
};

export const useDeleteMockTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/mock-tests/${id}`);
    },
    onSuccess: () => {
      toast.success('Mock test deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['mockTests'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete mock test');
    },
  });
};

export const useRestoreMockTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/admin/mock-tests/${id}/restore`);
    },
    onSuccess: () => {
      toast.success('Mock test restored successfully');
      queryClient.invalidateQueries({ queryKey: ['mockTests'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to restore mock test');
    },
  });
};

export const useCloneMockTest = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/admin/mock-tests/${id}/clone`);
      return data.data.test;
    },
    onSuccess: () => {
      toast.success('Mock test cloned successfully');
      queryClient.invalidateQueries({ queryKey: ['mockTests'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to clone mock test');
    },
  });
};
