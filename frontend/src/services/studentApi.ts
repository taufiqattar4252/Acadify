import api from '../lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MockTest } from './mockTestApi'; // Re-use the MockTest interface

export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatar?: string;
  createdAt: string;
  isActive: boolean;
  lastLogin?: string;
  goals: {
    targetScore: number;
    targetPercentile: number;
    targetCollege: string;
  };
  notificationPreferences: {
    email: boolean;
    inApp: boolean;
    examReminders: boolean;
    resultNotifications: boolean;
    marketingEmails: boolean;
    systemAnnouncements: boolean;
  };
}

export interface StudentStats {
  purchasedMocks: number;
  attemptedMocks: number;
  averageScore: number;
  accuracy: number;
  totalAmountSpent: number;
  percentile: number;
  rank: number | string;
}

export interface RecentActivityItem {
  id: string;
  type: string;
  title: string;
  target: string;
  date: string;
  status: string;
}

export interface Purchase {
  _id: string;
  mockTest: Pick<MockTest, '_id' | 'title' | 'slug' | 'thumbnail' | 'category' | 'duration' | 'price'>;
  payment: string;
  purchaseDate: string;
  status: string;
  amountPaid: number;
}

export interface PaginatedMockTests {
  tests: MockTest[];
  pagination: {
    total: number;
    page: number;
    pages: number;
  };
}

// 1. Get Available Mock Tests (Store)
export const useGetStudentMockTests = (
  page = 1,
  limit = 12,
  search = '',
  category = '',
  sort = '-createdAt'
) => {
  return useQuery<PaginatedMockTests>({
    queryKey: ['studentMockTests', page, limit, search, category, sort],
    queryFn: async () => {
      const { data } = await api.get('/student/mock-tests', {
        params: { page, limit, search, category, sort },
      });
      return data.data;
    },
  });
};

// 2. Get Single Mock Test Details
export const useGetStudentMockTest = (slug: string) => {
  return useQuery<{ test: MockTest; isPurchased: boolean }>({
    queryKey: ['studentMockTest', slug],
    queryFn: async () => {
      const { data } = await api.get(`/student/mock-tests/${slug}`);
      return data.data;
    },
    enabled: !!slug,
  });
};

// 3. Get Student Purchases
export const useGetStudentPurchases = () => {
  return useQuery<{ purchases: Purchase[] }>({
    queryKey: ['studentPurchases'],
    queryFn: async () => {
      const { data } = await api.get('/student/purchases');
      return data.data;
    },
  });
};

export const useGetStudentProfile = () => {
  return useQuery<{ user: UserProfile, stats: StudentStats, recentActivity: RecentActivityItem[] }>({
    queryKey: ['studentProfile'],
    queryFn: async () => {
      const { data } = await api.get('/student/profile');
      return data.data;
    },
  });
};

export const useUpdateStudentProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profileData: { 
      fullName?: string; 
      phone?: string; 
      avatar?: string; 
      goals?: Partial<UserProfile['goals']>;
    }) => {
      const { data } = await api.put('/student/profile', profileData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
    },
  });
};

// 6. Change Password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (passwordData: any) => {
      const { data } = await api.put('/student/change-password', passwordData);
      return data;
    },
  });
};

// 7. Update Notification Preferences
export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (preferences: Partial<UserProfile['notificationPreferences']>) => {
      const { data } = await api.put('/student/notification-preferences', { preferences });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentProfile'] });
    },
  });
};
