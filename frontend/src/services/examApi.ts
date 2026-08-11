import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

// Interfaces
export interface IExamSession {
  _id: string;
  startedAt: string;
  expiresAt: string;
  status: string;
  timeLeft?: number;
}

export interface IQuestionOption {
  _id: string;
  text: string;
  image?: string;
}

export interface IExamQuestion {
  _id: string;
  questionType: string;
  questionText: string;
  questionImage?: string;
  options: IQuestionOption[];
  positiveMarks: number;
  negativeMarks: number;
}

export interface IExamData {
  session: IExamSession;
  duration: number;
  questions: IExamQuestion[];
}

export const useStartExam = () => {
  return useMutation({
    mutationFn: async (mockTestId: string) => {
      const { data } = await axiosInstance.post<{ success: boolean; data: IExamData }>('/student/exam/start', { mockTestId });
      return data.data;
    },
  });
};

export const useGetExamSession = (sessionId: string) => {
  return useQuery({
    queryKey: ['examSession', sessionId],
    queryFn: async () => {
      const { data } = await axiosInstance.get<{ success: boolean; data: IExamData }>(`/student/exam/session/${sessionId}`);
      return data.data;
    },
    enabled: !!sessionId,
    refetchOnWindowFocus: false, // Don't refetch automatically during an exam
  });
};

export interface ISubmitExamPayload {
  sessionId: string;
  answers: Record<string, string>;
}

export const useSubmitExam = () => {
  return useMutation({
    mutationFn: async (payload: ISubmitExamPayload) => {
      const { data } = await axiosInstance.post('/student/exam/submit', payload);
      return data.data;
    },
  });
};
