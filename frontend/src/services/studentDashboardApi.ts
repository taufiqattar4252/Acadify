import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';

export interface DashboardData {
  overview: {
    studentName: string;
    greeting: string;
    purchasedMocks: number;
    attemptedMocks: number;
    averageScore: number;
    bestScore: number;
    accuracy: number;
    percentile: number;
  };
  continueExam: any | null;
  scoreTrend: { name: string; score: number; percentage: number }[];
  subjectPerformance: {
    physics: { accuracy: number; averageScore: number; solved: number };
    chemistry: { accuracy: number; averageScore: number; solved: number };
    mathematics: { accuracy: number; averageScore: number; solved: number };
  };
  questionStats: {
    correct: number;
    wrong: number;
    skipped: number;
    markedForReview: number;
    bookmarked: number;
  };
  studyProgress: {
    strongChapters: string[];
    weakChapters: string[];
    needsRevision: number;
    practicePending: number;
  };
  leaderboard: {
    currentRank: number | string;
    percentile: number;
    highestScore: number;
    averageScore: number;
    totalStudents: number;
  };
  recommendations: any[];
  recentActivity: any[];
  notifications: any[];
  goals: {
    targetScore: number;
    targetPercentile: number;
    targetCollege: string;
  };
}

export const useGetDashboardData = () => {
  return useQuery<{ data: DashboardData }>({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const response = await api.get('/student/dashboard');
      return response.data;
    },
  });
};
