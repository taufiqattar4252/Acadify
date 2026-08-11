import api from '../lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

// Interfaces
export interface Subject {
  _id: string;
  name: string;
  code: string;
  description?: string;
  icon?: string;
  color?: string;
  displayOrder: number;
  isActive: boolean;
  chaptersCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubjectsResponse {
  subjects: Subject[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

// Hooks
export const useGetSubjects = (page = 1, search = '', limit = 10) => {
  return useQuery({
    queryKey: ['subjects', page, search, limit],
    queryFn: async (): Promise<SubjectsResponse> => {
      const { data } = await api.get('/admin/subjects', { params: { page, search, limit } });
      return data.data;
    },
  });
};

export const useCreateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newSubject: Partial<Subject>) => {
      const { data } = await api.post('/admin/subjects', newSubject);
      return data.data.subject;
    },
    onSuccess: () => {
      toast.success('Subject created successfully');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create subject');
    },
  });
};

export const useUpdateSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Subject> }) => {
      const response = await api.put(`/admin/subjects/${id}`, data);
      return response.data.data.subject;
    },
    onSuccess: () => {
      toast.success('Subject updated successfully');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update subject');
    },
  });
};

export const useDeleteSubject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/subjects/${id}`);
    },
    onSuccess: () => {
      toast.success('Subject deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete subject');
    },
  });
};

export const useToggleSubjectStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/admin/subjects/${id}/status`);
      return data.data.subject;
    },
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['subjects'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
};
