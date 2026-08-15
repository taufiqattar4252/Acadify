'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGetCart, useRemoveFromCart, useApplyCoupon, useRemoveCoupon, useAddToCart } from '@/services/cartApi';
import { useGetStudentMockTests, useGetStudentPurchases } from '@/services/studentApi';
import { ShoppingCart, Tag, BookOpen, Star, ArrowRight, CheckCircle2, Sparkles, FileText, Trophy, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const { data: cart, isLoading: isCartLoading } = useGetCart();
  const removeMutation = useRemoveFromCart();
  const applyCouponMutation = useApplyCoupon();
  const removeCouponMutation = useRemoveCoupon();
  const addToCartMutation = useAddToCart();
  const { data: storeData, isLoading: isStoreLoading } = useGetStudentMockTests(1, 10, '', '', '-createdAt');
  const { data: purchasesData } = useGetStudentPurchases();

  const purchasedTestIds = new Set((purchasesData?.purchases || []).map((p: any) => p.mockTest?._id || p.mockTest));

  const recommendedTests = storeData?.tests
    ? storeData.tests
        .filter((test: any) => !cart?.items?.some((i: any) => i.mockTest._id === test._id || i.mockTest === test._id) && !purchasedTestIds.has(test._id))
        .slice(0, 4)
    : [];

  const [couponCode, setCouponCode] = useState('');
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    applyCouponMutation.mutate(couponCode.trim(), {
      onError: (error: any) => {
        setCouponError(error.response?.data?.message || 'The coupon code entered is not valid for this course.');
      }
    });
  };

  const handleRemoveCoupon = () => {
    removeCouponMutation.mutate();
    setCouponCode('');
    setCouponError('');
  };

  const confirmRemove = (id: string) => {
    removeMutation.mutate(id);
  };

  const handleAddToCart = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    addToCartMutation.mutate(id);
  };

  if (isCartLoading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse p-8 max-w-[1200px] mx-auto mt-10">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-6">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div className="pb-12 max-w-[1200px] mx-auto px-4 mt-10">
      <h1 className="text-4xl font-bold text-slate-900 mb-6">Shopping Cart</h1>

      {isEmpty ? (
        <div className="py-6">
          <span className="font-bold italic text-slate-700">Your cart is empty</span>
          <span className="italic text-slate-500"> – let's change that. Time to learn some new skills!</span>
        </div>
      ) : (
        <>
          <div className="font-bold text-slate-800 text-lg mb-2">
            {cart.items.length} Course{cart.items.length > 1 ? 's' : ''} in Cart
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

            {/* Cart Items List */}
            <div className="lg:col-span-3 border border-slate-200 rounded-sm">
              {cart.items.map((item: any, idx: number) => {
                const originalPrice = Math.round(item.price * 1.2);

                return (
                  <div key={item.mockTest._id} className={`bg-white p-4 flex flex-col sm:flex-row gap-4 ${idx !== cart.items.length - 1 ? 'border-b border-slate-200' : ''}`}>

                    {/* Thumbnail */}
                    <div className="w-full sm:w-[120px] h-[68px] bg-slate-100 relative overflow-hidden flex-shrink-0 cursor-pointer border border-slate-200" onClick={() => router.push(`/dashboard/mock-tests/${item.mockTest.slug}`)}>
                      {item.mockTest.thumbnail ? (
                        <Image src={item.mockTest.thumbnail} alt={item.mockTest.title} fill className="object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-slate-300" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-base text-slate-900 line-clamp-2 leading-snug cursor-pointer hover:text-emerald-600 transition-colors" onClick={() => router.push(`/dashboard/mock-tests/${item.mockTest.slug}`)}>
                          {item.mockTest.title}
                        </h3>
                        <p className="text-[13px] text-slate-500 mt-0.5">By Acadify • {item.mockTest.category}</p>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="bg-[#eceb98] text-slate-800 text-[11px] font-bold px-1.5 py-0.5 rounded-sm">Bestseller</span>
                          <div className="flex items-center text-amber-600 text-[13px] font-bold">
                            4.7 <Star className="w-3.5 h-3.5 fill-current ml-0.5 mr-1" />
                            <span className="text-slate-400 font-normal text-xs">(194,717 ratings)</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-[12px] text-slate-500">
                          <span>{item.mockTest.duration} total mins</span>
                          <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                          <span>{item.mockTest.totalQuestions} questions</span>
                          <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                          <span className="capitalize">{item.mockTest.difficulty || 'All Levels'}</span>
                        </div>

                        <div className="mt-2">
                          <span className="bg-[#00BC7D] text-white text-[11px] font-bold px-2 py-0.5 rounded-sm inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Premium
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col gap-4 sm:gap-2 text-[13px] font-medium items-start sm:items-end justify-start sm:justify-start pt-1 sm:ml-4 sm:min-w-[100px]">
                        <button onClick={() => confirmRemove(item.mockTest._id)} className="text-emerald-600 hover:text-emerald-800">Remove</button>
                        <button className="text-emerald-600 hover:text-emerald-800">Save for Later</button>
                      </div>

                      {/* Pricing */}
                      <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0 pt-1 sm:ml-4 sm:min-w-[100px]">
                        <div className="font-bold text-lg text-emerald-600 flex items-center gap-1">
                          {item.price === 0 ? <span className="bg-[#00BC7D] text-white text-[10px] md:text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded shadow-sm">FREE</span> : <>₹{(item.price || 0).toFixed(2)} <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" /><circle cx="7" cy="7" r="1.5" fill="white" /></svg></>}
                        </div>
                        {item.price > 0 && (
                          <div className="text-[13px] text-slate-400 line-through">
                            ₹{(originalPrice || 0).toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Sticky Order Summary */}
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="text-slate-500 font-bold text-lg">Total:</div>
              <div className="text-4xl font-bold text-slate-900 tracking-tight">₹{(cart.finalTotal || 0).toFixed(2)}</div>

              {(cart.subtotal > cart.finalTotal || cart.discount > 0) && (
                <div className="flex items-center gap-2">
                  <div className="text-base text-slate-400 line-through">₹{(cart.subtotal || 0).toFixed(2)}</div>
                  <div className="text-base text-slate-600">
                    {Math.round(((cart.subtotal - cart.finalTotal) / cart.subtotal) * 100)}% off
                  </div>
                </div>
              )}

              <button
                className="w-[104%] -ml-[2%] rounded-md py-4 bg-[#00BC7D] hover:bg-[#00BC7D] text-white font-bold text-lg tracking-wide flex items-center justify-center gap-2 mt-2 transition-colors shadow-lg shadow-[#00BC7D]/30"
                onClick={() => router.push('/dashboard/checkout')}
              >
                Proceed to Checkout <ArrowRight className="w-5 h-5" />
              </button>
              <div className="text-[11px] text-center text-slate-500 mt-2">
                You won't be charged yet
              </div>

              {/* Coupon Section */}
              <div className="pt-6 border-t border-slate-200 mt-6">
                {!showCouponInput && !cart.coupon ? (
                  <button
                    onClick={() => setShowCouponInput(true)}
                    className="w-full border border-emerald-500 text-emerald-500 rounded-md py-2.5 font-bold hover:bg-emerald-50 transition-colors"
                  >
                    Apply Coupon
                  </button>
                ) : (
                  <>
                    <div className="font-bold text-sm text-slate-900 mb-2">Promotions</div>

                    {cart.coupon ? (
                      <div className="bg-slate-50 border border-slate-200 p-2 rounded-sm flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-700 font-bold">
                          <Tag className="w-3.5 h-3.5 text-slate-400" />
                          {cart.coupon.code} is applied
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          disabled={removeCouponMutation.isPending}
                          className="text-emerald-600 hover:text-emerald-800"
                        >
                          <span className="text-xl leading-none px-1">&times;</span>
                        </button>
                      </div>
                    ) : (
                      <div className="w-full">
                        <form onSubmit={handleApplyCoupon} className="flex h-10 w-full gap-2">
                          <input
                            type="text"
                            placeholder="Enter Coupon"
                            className={`flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-1 placeholder-slate-400 ${couponError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-600'}`}
                            value={couponCode}
                            onChange={(e) => {
                              setCouponCode(e.target.value.toUpperCase());
                              if (couponError) setCouponError('');
                            }}
                          />
                          <button
                            type="submit"
                            disabled={applyCouponMutation.isPending || !couponCode.trim()}
                            className="bg-[#00BC7D] hover:bg-[#00BC7D] text-white font-bold px-6 rounded-md text-sm disabled:opacity-50 transition-colors"
                          >
                            Apply
                          </button>
                        </form>
                        {couponError && (
                          <div className="text-red-600 text-[13px] mt-1.5">{couponError}</div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Recommended Mock Tests */}
      {!isStoreLoading && storeData?.tests && (
        <div className="mt-16 pt-8">
          <h2 className="text-xl text-slate-800 mb-6">Learners are also viewing</h2>
          
          {recommendedTests.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] text-slate-500 italic">
              You are caught with all
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recommendedTests.map((test: any) => {
              return (
                <div
                  key={test._id}
                  onClick={() => router.push(`/dashboard/mock-tests/${test.slug}`)}
                  className="bg-white rounded-3xl p-3 pb-5 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full min-h-[380px]"
                >
                  {/* Top Image Area */}
                  <div className="h-44 bg-[#f4fbf8] rounded-2xl relative overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {/* Dotted Patterns */}
                    <div className="absolute top-2 left-2 w-16 h-16 opacity-30 bg-[radial-gradient(circle_at_2px_2px,#00BC7D_1px,transparent_0)] bg-[length:8px_8px]"></div>
                    <div className="absolute bottom-2 right-2 w-16 h-16 opacity-30 bg-[radial-gradient(circle_at_2px_2px,#00BC7D_1px,transparent_0)] bg-[length:8px_8px]"></div>

                    {/* Center Circle & Icon */}
                    <div className="w-24 h-24 rounded-full bg-[#e8f7f0] flex items-center justify-center relative z-10 transition-transform duration-500 group-hover:scale-105">
                      <BookOpen className="w-10 h-10 text-[#00BC7D]" strokeWidth={2} />
                      {/* Small shadow under icon/circle */}
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-16 h-2 bg-[#00BC7D]/10 blur-md rounded-full"></div>
                    </div>

                    {/* Thumbnail overlay if test has image */}
                    {test.thumbnail && (
                      <Image src={test.thumbnail} alt={test.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500 z-20" />
                    )}

                    {/* Ribbon */}
                    {test.price === 0 && (
                      <div className="absolute top-4 -right-1 z-30">
                        <div className="bg-[#00BC7D] text-white text-[13px] font-bold px-4 py-1.5 rounded-l-md rounded-tr-md flex items-center gap-1 shadow-md relative">
                          <Sparkles className="w-3.5 h-3.5" /> FREE
                          {/* Ribbon fold */}
                          <div className="absolute -bottom-1.5 right-0 border-t-[6px] border-t-[#009c3e] border-r-[6px] border-r-transparent"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content Area */}
                  <div className="px-3 pt-4 flex flex-col flex-1">
                    <h3 className="font-bold text-[22px] text-slate-900 line-clamp-1 leading-tight transition-colors mb-3">
                      {test.title}
                    </h3>

                    {/* Category */}
                    <div className="flex items-center gap-2 text-slate-500 text-[14px] mb-4">
                      <FileText className="w-4 h-4 text-[#00BC7D]" />
                      {test.category || 'Full Mock Test'}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 text-slate-500 text-[13px] mb-5 whitespace-nowrap overflow-hidden">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-[#00BC7D]" /> Duration: {test.duration} mins
                      </div>
                      <div className="w-px h-4 bg-slate-200"></div>
                      <div className="flex items-center gap-1.5">
                        <Trophy className="w-4 h-4 text-[#00BC7D]" /> Total Questions: {test.totalQuestions}
                      </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 text-[15px] font-bold text-amber-500 mb-4 mt-auto">
                      <span className="text-[18px]">4.7</span>
                      <div className="flex items-center space-x-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 fill-current" />
                        <Star className="w-4 h-4 text-slate-200 fill-slate-200" />
                      </div>
                      <span className="text-[13px] text-slate-400 font-normal ml-1">(1,241)</span>
                    </div>

                    {/* Bottom Actions/Price */}
                    <div className="flex items-end justify-between mt-auto">
                      <div className="flex flex-col gap-1">
                        <div className="font-bold text-lg text-slate-900 flex items-center leading-none">
                          {test.price === 0 ? (
                            <div className="bg-[#e8f7f0] text-[#00BC7D] text-[13px] uppercase tracking-wider font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm">
                              <Tag className="w-4 h-4 fill-current" /> FREE
                            </div>
                          ) : (
                            <span className="text-[20px]">₹{(test.price || 0).toFixed(2)}</span>
                          )}
                        </div>
                        {test.price > 0 && (
                          <div className="text-[13px] text-slate-400 line-through leading-none pb-[2px]">
                            ₹{(test.price * 1.2).toFixed(2)}
                          </div>
                        )}
                      </div>

                      {/* Actions Area */}
                      <div className="ml-auto">
                        {cart?.items?.some((item: any) => item.mockTest._id === test._id || item.mockTest === test._id) ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push('/dashboard/cart'); }}
                            className="p-2.5 bg-[#00BC7D] text-white rounded-xl hover:bg-[#00a870] transition-colors flex items-center gap-2 text-sm font-bold px-4 shadow-lg shadow-[#00BC7D]/30"
                            title="Go to Cart"
                          >
                            <ShoppingCart className="w-4 h-4" /> Go to Cart
                          </button>
                        ) : test.price > 0 ? (
                          <button
                            onClick={(e) => handleAddToCart(e, test._id)}
                            disabled={addToCartMutation.isPending}
                            className="p-2.5 bg-[#00BC7D] text-white rounded-xl hover:bg-[#00a870] transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-bold px-4 shadow-lg shadow-[#00BC7D]/30"
                            title="Add to Cart"
                          >
                            <ShoppingCart className="w-4 h-4" /> Add
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
