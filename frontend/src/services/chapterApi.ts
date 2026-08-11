import api from '../lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Interfaces
export interface Chapter {
  _id: string;
  name: string;
  code: string;
  subject: any; // Ideally expanded Subject interface or string ID
  description?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChaptersResponse {
  chapters: Chapter[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

// Hooks
export const useGetChapters = (page = 1, search = '', subject = '') => {
  return useQuery({
    queryKey: ['chapters', page, search, subject],
    queryFn: async (): Promise<ChaptersResponse> => {
      const { data } = await api.get('/admin/chapters', { params: { page, search, subject } });
      return data.data;
    },
  });
};

export const useCreateChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newChapter: Partial<Chapter>) => {
      const { data } = await api.post('/admin/chapters', newChapter);
      return data.data.chapter;
    },
    onSuccess: () => {
      toast.success('Chapter created successfully');
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create chapter');
    },
  });
};

export const useUpdateChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Chapter> }) => {
      const response = await api.put(`/admin/chapters/${id}`, data);
      return response.data.data.chapter;
    },
    onSuccess: () => {
      toast.success('Chapter updated successfully');
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update chapter');
    },
  });
};

export const useDeleteChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/chapters/${id}`);
    },
    onSuccess: () => {
      toast.success('Chapter deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete chapter');
    },
  });
};

export const useToggleChapterStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/admin/chapters/${id}/status`);
      return data.data.chapter;
    },
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['chapters'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
};
