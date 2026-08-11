import api from '../lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

export interface QuestionOption {
  _id?: string;
  text: string;
  image?: string | null;
  isCorrect: boolean;
}

export interface Question {
  _id: string;
  questionType: string;
  questionText: string;
  questionImage?: string;
  options: QuestionOption[];
  explanation?: string;
  explanationImage?: string;
  subject: any; // Can be object or ID
  chapter: any;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  positiveMarks: number;
  negativeMarks: number;
  estimatedTime: number;
  pyqYears: number[];
  status: 'Draft' | 'Published' | 'Archived';
  tags: string[];
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: any;
  updatedBy?: any;
}

export interface QuestionsResponse {
  questions: Question[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

export const useGetQuestions = (
  page = 1,
  limit = 10,
  search = '',
  subject = '',
  chapter = '',
  difficulty = '',
  status = '',
  pyqYear = '',
  sort = '-createdAt'
) => {
  return useQuery({
    queryKey: ['questions', page, limit, search, subject, chapter, difficulty, status, pyqYear, sort],
    queryFn: async (): Promise<QuestionsResponse> => {
      const { data } = await api.get('/admin/questions', {
        params: { page, limit, search, subject, chapter, difficulty, status, pyqYear, sort },
      });
      return data.data;
    },
  });
};

export const useGetQuestion = (id: string) => {
  return useQuery({
    queryKey: ['question', id],
    queryFn: async (): Promise<Question> => {
      const { data } = await api.get(`/admin/questions/${id}`);
      return data.data.question;
    },
    enabled: !!id,
  });
};

export const useCreateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newQuestion: Partial<Question>) => {
      const { data } = await api.post('/admin/questions', newQuestion);
      return data.data.question;
    },
    onSuccess: () => {
      toast.success('Question created successfully');
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create question');
    },
  });
};

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Question> }) => {
      const response = await api.put(`/admin/questions/${id}`, data);
      return response.data.data.question;
    },
    onSuccess: () => {
      toast.success('Question updated successfully');
      queryClient.invalidateQueries({ queryKey: ['questions'] });
      queryClient.invalidateQueries({ queryKey: ['question'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update question');
    },
  });
};

export const useDeleteQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/admin/questions/${id}`);
    },
    onSuccess: () => {
      toast.success('Question moved to archive (deleted)');
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete question');
    },
  });
};

export const useToggleQuestionStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/admin/questions/${id}/status`);
      return data.data.question;
    },
    onSuccess: () => {
      toast.success('Status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update status');
    },
  });
};

export const useRestoreQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/admin/questions/${id}/restore`);
      return data.data.question;
    },
    onSuccess: () => {
      toast.success('Question restored successfully');
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to restore question');
    },
  });
};

export const useDuplicateQuestion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.post(`/admin/questions/duplicate/${id}`);
      return data.data.question;
    },
    onSuccess: () => {
      toast.success('Question duplicated successfully');
      queryClient.invalidateQueries({ queryKey: ['questions'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to duplicate question');
    },
  });
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/admin/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data.data.url;
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    },
  });
};
