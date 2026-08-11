import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import toast from 'react-hot-toast';

// Types
export interface CartItem {
  mockTest: {
    _id: string;
    title: string;
    category: string;
    price: number;
    thumbnail: string;
    duration: number;
    totalQuestions: number;
    difficulty: string;
  };
  price: number;
  addedAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discountType: string;
  discountValue: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  coupon?: Coupon;
  subtotal: number;
  discount: number;
  finalTotal: number;
}

// Queries
export const useGetCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const { data } = await api.get('/student/cart');
      return data.data.cart as Cart;
    },
  });
};

// Mutations
export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (mockTestId: string) => {
      const { data } = await api.post('/student/cart/add', { mockTestId });
      return data.data.cart as Cart;
    },
    onSuccess: (newCart) => {
      toast.success('Added to cart');
      queryClient.setQueryData(['cart'], newCart);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to add to cart');
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (mockTestId: string) => {
      const { data } = await api.delete(`/student/cart/remove/${mockTestId}`);
      return data.data.cart as Cart;
    },
    onSuccess: (newCart) => {
      toast.success('Removed from cart');
      queryClient.setQueryData(['cart'], newCart);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to remove from cart');
    },
  });
};

export const useApplyCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (code: string) => {
      const { data } = await api.post('/student/cart/apply-coupon', { code });
      return data.data.cart as Cart;
    },
    onSuccess: (newCart) => {
      toast.success('Coupon applied successfully');
      queryClient.setQueryData(['cart'], newCart);
    },
    onError: (error: any) => {
      // Handled locally in component to display text error instead of toast
    },
  });
};

export const useRemoveCoupon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.delete('/student/cart/remove-coupon');
      return data.data.cart as Cart;
    },
    onSuccess: (newCart) => {
      toast.success('Coupon removed');
      queryClient.setQueryData(['cart'], newCart);
    },
    onError: (error: any) => {
      toast.error('Failed to remove coupon');
    },
  });
};

export const useCheckoutCart = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post('/student/cart/checkout');
      return data.data; // Returns { orderId, amount, currency, paymentId }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Checkout failed');
    },
  });
};
