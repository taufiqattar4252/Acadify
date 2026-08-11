import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../lib/axios';

// Interfaces
export interface CreateOrderData {
  mockTestId: string;
}

export interface VerifyPaymentData {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface PaymentDetails {
  _id: string;
  orderId: string;
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  transactionDate: string;
  createdAt: string;
  paymentGateway: string;
  mockTest: {
    _id: string;
    title: string;
    category: string;
    price: number;
    thumbnail: string;
  };
  user: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  };
}

// Student APIs

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: async (data: CreateOrderData) => {
      const response = await axiosInstance.post('/payment/create-order', data);
      return response.data.data;
    },
  });
};

export const useVerifyPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: VerifyPaymentData) => {
      const response = await axiosInstance.post('/payment/verify', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studentPurchases'] });
      queryClient.invalidateQueries({ queryKey: ['paymentHistory'] });
      queryClient.invalidateQueries({ queryKey: ['studentMockTest'] });
    },
  });
};

export const useGetPaymentHistory = () => {
  return useQuery({
    queryKey: ['paymentHistory'],
    queryFn: async () => {
      const response = await axiosInstance.get('/payment/history');
      return response.data.data.payments;
    },
  });
};

export const useGetPaymentDetails = (id: string) => {
  return useQuery({
    queryKey: ['paymentDetails', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/payment/${id}`);
      return response.data.data.payment as PaymentDetails;
    },
    enabled: !!id,
  });
};

// Admin APIs

export const useGetAllPayments = (page = 1, limit = 20, status?: string) => {
  return useQuery({
    queryKey: ['adminPayments', page, limit, status],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
      });
      const response = await axiosInstance.get(`/admin/payments?${params}`);
      return response.data.data;
    },
  });
};

export const useGetPaymentStats = () => {
  return useQuery({
    queryKey: ['adminPaymentStats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/admin/payments/stats');
      return response.data.data;
    },
  });
};
