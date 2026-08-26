'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetCart, useCheckoutCart } from '@/services/cartApi';
import { ShieldCheck, Lock, CreditCard, AlertCircle, ShoppingBag, CheckCircle2, Flame } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import Image from 'next/image';
import Script from 'next/script';

export default function CheckoutPage() {
  const router = useRouter();
  const { data: cart, isLoading: isCartLoading } = useGetCart();
  const checkoutMutation = useCheckoutCart();
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  // Redirect to cart if empty
  useEffect(() => {
    if (!isCartLoading && (!cart || !cart.items || cart.items.length === 0)) {
      router.push('/dashboard/cart');
    }
  }, [cart, isCartLoading, router]);

  // Check if Razorpay is already loaded (e.g., when returning to the page)
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      setIsRazorpayLoaded(true);
    }
  }, []);

  const handleCheckout = async () => {
    if (!isRazorpayLoaded) {
      toast.error('Payment gateway is still loading. Please wait a moment.');
      return;
    }

    try {
      const orderData = await checkoutMutation.mutateAsync();
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '', // Needs to be configured in .env.local
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Acadify MHT-CET',
        description: `Payment for ${cart?.items.length} Mock Tests`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await api.post('/payment/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              toast.success('Payment successful!');
              router.push('/dashboard/purchases');
            }
          } catch (error: any) {
            toast.error(error.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: '', // We could populate this from user profile context if available
          email: '',
          contact: ''
        },
        theme: {
          color: '#4f46e5',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        toast.error(response.error.description || 'Payment failed');
      });
      
      rzp.open();

    } catch (error) {
      console.error(error);
    }
  };

  if (isCartLoading || !cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto pb-12 animate-pulse space-y-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-[400px] rounded-2xl" />
          <Skeleton className="h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setIsRazorpayLoaded(true)}
      />
      
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row min-h-[80vh] border-t border-border mt-6">
        {/* Left Column */}
        <div className="lg:w-[60%] p-6 lg:p-12 bg-white">
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-8">Checkout</h1>
          
          <div className="space-y-0">
            <div className="py-5 border-b border-border flex justify-between items-center">
              <span className="font-bold text-foreground text-[17px]">1. Logged in securely</span>
              <span className="text-success font-medium text-sm flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Account verified
              </span>
            </div>
            
            <div className="py-5 border-b border-border flex justify-between items-center">
              <span className="font-bold text-foreground text-[17px]">2. Payment method</span>
              <Lock className="w-4 h-4 text-muted-foreground" />
            </div>
            
            <div className="py-6">
              <h2 className="text-[17px] font-bold text-foreground mb-6">Order details ({cart.items.length} course{cart.items.length > 1 ? 's' : ''})</h2>
              
              <div className="space-y-4">
                {cart.items.map((item: any) => (
                  <div key={item.mockTest._id} className="flex gap-4">
                    <div className="w-16 h-12 bg-muted relative overflow-hidden flex-shrink-0 border border-border">
                      {item.mockTest.thumbnail ? (
                        <Image src={item.mockTest.thumbnail} alt={item.mockTest.title} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <ShoppingBag className="w-4 h-4 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-sm line-clamp-2 leading-tight">{item.mockTest.title}</h3>
                    </div>
                    <div className="text-right font-bold text-foreground text-sm whitespace-nowrap">
                      {item.price === 0 ? <span className="bg-[#00BC7D] text-white text-[10px] md:text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded shadow-sm">FREE</span> : `₹${(item.price || 0).toFixed(2)}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:w-[40%] bg-muted p-6 lg:p-12 lg:border-l border-border relative">
          <h2 className="text-2xl font-bold text-foreground mb-6">Order summary</h2>
          
          <div className="space-y-3 text-muted-foreground border-b border-border pb-6 mb-6 text-sm">
            <div className="flex justify-between">
              <span>Original Price:</span>
              <span>₹{(cart.subtotal || 0).toFixed(2)}</span>
            </div>
            {cart.discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Coupon Discount:</span>
                <span>-₹{(cart.discount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-foreground text-[17px] pt-3 mt-1">
              <span>Total ({cart.items.length} course{cart.items.length > 1 ? 's' : ''}):</span>
              <span>₹{(cart.finalTotal || 0).toFixed(2)}</span>
            </div>
          </div>
          
          <button 
            onClick={handleCheckout} 
            disabled={checkoutMutation.isPending || !isRazorpayLoaded}
            className="w-full rounded-md py-4 text-lg font-bold bg-[#00BC7D] hover:bg-[#00BC7D] text-white transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {checkoutMutation.isPending ? 'Processing...' : `Complete Checkout`}
          </button>

          <div className="mt-5 flex flex-col items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-success" />
              100% Safe & Secure Checkout
            </div>
            <div className="text-[11px] text-muted-foreground">Payments securely processed by <span className="font-bold text-muted-foreground">Razorpay</span></div>
          </div>

          <div className="text-[11px] text-muted-foreground mt-6 text-center">
            By completing your purchase you agree to these <a href="#" className="text-success hover:underline font-medium">Terms of Service</a>.
          </div>

        </div>
      </div>
    </>
  );
}
