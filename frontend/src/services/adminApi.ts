import { useQuery } from '@tanstack/react-query';

// Mock data interfaces
export interface DashboardStats {
  totalStudents: number;
  totalQuestions: number;
  totalMockTests: number;
  totalFullMockTests: number;
  totalPhysicsTests: number;
  totalChemistryTests: number;
  totalMathematicsTests: number;
  totalChapterWiseTests: number;
  totalPyqPapers: number;
  revenue: number;
  totalAttempts: number;
  totalPurchases: number;
}

export interface Activity {
  id: string;
  action: string;
  target: string;
  user: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface RevenueData {
  month: string;
  revenue: number;
}

export interface SubjectData {
  subject: string;
  count: number;
}

// Mock API responses
const mockStats: DashboardStats = {
  totalStudents: 10234,
  totalQuestions: 154300,
  totalMockTests: 45,
  totalFullMockTests: 15,
  totalPhysicsTests: 8,
  totalChemistryTests: 7,
  totalMathematicsTests: 5,
  totalChapterWiseTests: 6,
  totalPyqPapers: 4,
  revenue: 852000,
  totalAttempts: 45670,
  totalPurchases: 3200,
};

const mockActivities: Activity[] = [
  { id: '1', action: 'Purchased Mock Test Series', target: 'MHT-CET PCB 2026', user: 'Rahul Sharma', date: '2 mins ago', status: 'completed' },
  { id: '2', action: 'Registered', target: 'New Account', user: 'Sneha Patel', date: '15 mins ago', status: 'completed' },
  { id: '3', action: 'Completed Test', target: 'Physics Full Syllabus Mock 1', user: 'Amit Kumar', date: '1 hour ago', status: 'completed' },
  { id: '4', action: 'Payment Failed', target: 'MHT-CET PCM 2026', user: 'Priya Singh', date: '3 hours ago', status: 'failed' },
  { id: '5', action: 'Started Test', target: 'Chemistry Chapter 4', user: 'Vikram Joshi', date: '5 hours ago', status: 'pending' },
];

const mockRevenueData: RevenueData[] = [
  { month: 'Jan', revenue: 45000 },
  { month: 'Feb', revenue: 52000 },
  { month: 'Mar', revenue: 48000 },
  { month: 'Apr', revenue: 70000 },
  { month: 'May', revenue: 85000 },
  { month: 'Jun', revenue: 110000 },
  { month: 'Jul', revenue: 105000 },
];

const mockSubjectData: SubjectData[] = [
  { subject: 'Physics', count: 45000 },
  { subject: 'Chemistry', count: 42000 },
  { subject: 'Maths', count: 38000 },
  { subject: 'Biology', count: 29000 },
];

// Hooks simulating API calls
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['admin', 'dashboardStats'],
    queryFn: async () => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockStats;
    },
  });
};

export const useRecentActivity = () => {
  return useQuery({
    queryKey: ['admin', 'recentActivity'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockActivities;
    },
  });
};

export const useChartData = () => {
  return useQuery({
    queryKey: ['admin', 'chartData'],
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        revenue: mockRevenueData,
        subjects: mockSubjectData,
      };
    },
  });
};
