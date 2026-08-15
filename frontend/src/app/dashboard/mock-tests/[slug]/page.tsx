'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetStudentMockTest } from '@/services/studentApi';
import { useCreateOrder, useVerifyPayment } from '@/services/paymentApi';
import { useAddToCart, useGetCart } from '@/services/cartApi';
import { useStartExam } from '@/services/examApi';
import { useUser } from '@/services/authApi';
import {
  ArrowLeft, Clock, BookOpen, Tag, IndianRupee,
  CheckCircle2, Play, ShoppingCart, Sparkles, FileText, Trophy, Star, ShieldCheck, HelpCircle, BarChart3, XCircle, Calendar, PieChart, Lightbulb, ClipboardList, Users, CheckCircle, Settings, Layers, ChevronDown, ChevronUp, ChevronRight, Award
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { Spinner } from '@/components/ui/Spinner';
import Image from 'next/image';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function MockDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: userData } = useUser();
  const { data, isLoading, isError } = useGetStudentMockTest(slug);

  const createOrder = useCreateOrder();
  const verifyPayment = useVerifyPayment();
  const startExamMutation = useStartExam();
  const { data: cartData } = useGetCart();
  const addToCartMutation = useAddToCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStartingExam, setIsStartingExam] = useState(false);

  const isInCart = cartData?.items?.some((item: any) => item.mockTest._id === data?.test?._id || item.mockTest === data?.test?._id);

  const handleAddToCart = () => {
    if (!data?.test) return;
    addToCartMutation.mutate(data.test._id);
  };

  const handlePayment = async () => {
    if (!data?.test) return;
    setIsProcessing(true);

    try {
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }

      // 1. Create order on our backend
      const orderData = await createOrder.mutateAsync({ mockTestId: data.test._id });

      if ((orderData as any).isFree) {
        setIsProcessing(false);
        window.location.reload();
        return;
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_xxxxxx', // Replace with dynamic env if set
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'MHT-CET Platform',
        description: data.test.title,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          try {
            await verifyPayment.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            // Auto redirects or state will auto update via React Query invalidation
          } catch (error) {
            console.error('Payment verification failed', error);
            alert('Payment verification failed. If amount was deducted, please contact support.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: userData?.fullName || '',
          email: userData?.email || '',
        },
        theme: {
          color: '#4f46e5',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);

      paymentObject.on('payment.failed', function (response: any) {
        setIsProcessing(false);
        alert(`Payment failed: ${response.error.description}`);
      });

      paymentObject.open();
    } catch (error: any) {
      console.error('Payment initialization error', error);
      alert(error?.response?.data?.message || 'Something went wrong while initiating payment.');
      setIsProcessing(false);
    }
  };

  const handleStartExam = async () => {
    if (!data?.test) return;
    setIsStartingExam(true);

    try {
      const response = await startExamMutation.mutateAsync(data.test._id);
      // Navigate to the exam engine layout with the session ID in a new window
      const features = `popup=yes,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${window.screen.width},height=${window.screen.height}`;
      window.open(`/dashboard/exam/${response.session._id}`, '_blank', features);
      setIsStartingExam(false);
    } catch (error: any) {
      console.error('Error starting exam', error);
      alert(error?.response?.data?.message || 'Failed to start exam session.');
      setIsStartingExam(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="xl" />
      </div>
    );
  }

  if (isError || !data?.test) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-slate-200">
        <h3 className="text-lg font-bold text-slate-900">Mock Test Not Found</h3>
        <p className="text-slate-500 mt-1">This test might be unavailable or removed.</p>
        <Button variant="secondary" className="mt-4" onClick={() => router.push('/dashboard/mock-tests')}>
          Back to Store
        </Button>
      </div>
    );
  }

  const { test, isPurchased } = data;

  return (
    <div className="bg-[#f9f9f9] min-h-screen pb-20">

      {/* 1. Global Navigation / Breadcrumbs (Header Area) */}
      <div className="bg-white border-b border-slate-200 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center text-sm text-slate-500 font-medium">
            <Link href="/dashboard/mock-tests" className="hover:text-blue-600 transition-colors">Store</Link>
            <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
            <span className="text-slate-900 truncate max-w-[300px]">{test.category || 'Mock Test'}</span>
            <ChevronRight className="w-4 h-4 mx-2 text-slate-300" />
            <span className="text-slate-400 truncate max-w-[200px]">{test.title}</span>
          </div>
        </div>
      </div>

      {/* 2. Dark Hero Banner */}
      <div className="bg-[#00BC7D] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

            {/* Left Content */}
            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-white mb-6 border border-white/20">
                PROFESSIONAL MOCK TEST
              </div>
              <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight text-white">
                {test.title}
              </h1>
              <p className="text-lg md:text-xl text-green-50 mb-6 max-w-3xl leading-relaxed opacity-90">
                {test.description || 'Comprehensive mock test designed to evaluate your preparation and improve your final score through detailed analytics.'}
              </p>

              <div className="flex items-center gap-3 mb-8 text-green-100 font-medium">
                {/* <div className="w-10 h-10 rounded-full bg-[#00BC7D]/20 flex items-center justify-center border border-[#00BC7D]/30">
                  <Award className="w-5 h-5 text-[#00BC7D]" />
                </div> */}
                <span>Created by <strong className="text-white font-bold border-b border-[#00BC7D]/50 pb-0.5">Acadify Experts Team</strong></span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {isPurchased ? (
                  <Button
                    className="w-full sm:w-auto px-10 py-4 text-lg font-bold gap-2 bg-white !text-[#00BC7D] hover:!bg-slate-50 focus:!ring-[#00BC7D] border-none shadow-lg rounded-lg"
                    onClick={handleStartExam}
                    disabled={isStartingExam}
                  >
                    {isStartingExam ? (
                      <Spinner size="sm" className="text-white" />
                    ) : (
                      <><Play className="w-5 h-5" fill="currentColor" /> Start Exam</>
                    )}
                  </Button>
                ) : test.price === 0 ? (
                  <Button
                    className="w-full sm:w-auto px-10 py-4 text-lg font-bold gap-2 bg-white !text-[#00BC7D] hover:!bg-slate-50 focus:!ring-[#00BC7D] border-none shadow-lg rounded-lg"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Spinner size="sm" className="text-white" />
                    ) : (
                      <><Play className="w-5 h-5" fill="currentColor" /> Enroll for Free</>
                    )}
                  </Button>
                ) : isInCart ? (
                  <Button
                    className="w-full sm:w-auto px-10 py-4 text-lg font-bold gap-2 bg-white !text-[#00BC7D] hover:!bg-slate-50 focus:!ring-[#00BC7D] border-none shadow-lg rounded-lg"
                    onClick={() => router.push('/dashboard/cart')}
                  >
                    <ShoppingCart className="w-5 h-5" /> Go to Cart
                  </Button>
                ) : (
                  <Button
                    className="w-full sm:w-auto px-10 py-4 text-lg font-bold gap-2 bg-white !text-[#00BC7D] hover:!bg-slate-50 focus:!ring-[#00BC7D] border-none shadow-lg rounded-lg"
                    onClick={handleAddToCart}
                    disabled={addToCartMutation.isPending}
                  >
                    {addToCartMutation.isPending ? (
                      <Spinner size="sm" className="text-white" />
                    ) : (
                      <>Enroll Now <span className="mx-1">•</span> ₹{(test.price || 0).toFixed(2)}</>
                    )}
                  </Button>
                )}

                <p className="text-sm text-green-100 font-medium opacity-90">
                  <strong>12,450</strong> already enrolled
                </p>
              </div>
            </div>

            {/* Right Graphics/CTA Box (Optional, like Coursera) */}
            <div className="hidden lg:flex lg:col-span-4 justify-end">
              <div className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
                <div className="aspect-video relative rounded-lg overflow-hidden bg-[#021f11] mb-4 flex items-center justify-center border border-white/10">
                  {test.thumbnail ? (
                    <Image src={test.thumbnail} alt={test.title} fill className="object-cover opacity-80" />
                  ) : (
                    <BookOpen className="w-16 h-16 text-[#00BC7D]/50" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 bg-[#00BC7D]/80 hover:bg-[#00BC7D] shadow-[0_0_15px_rgba(0,201,80,0.5)] rounded-full flex items-center justify-center cursor-pointer transition-colors">
                      <Play className="w-5 h-5 text-white ml-1" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <p className="text-center text-sm font-medium text-green-50 opacity-90">Take a sneak peek into the test platform</p>
              </div>
            </div>

          </div>
        </div>
      </div>



      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* 4. Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-slate-200 mb-12" id="about">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <div className="flex text-amber-500">
                <Star className="w-5 h-5 fill-current" />
              </div>
              4.8
            </div>
            <p className="text-sm text-slate-600 font-medium">(2,143 reviews)</p>
          </div>

          <div className="flex flex-col gap-2 border-l border-slate-200 pl-6">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <Settings className="w-5 h-5" />
              {(test as any).level || 'Intermediate'} Level
            </div>
            <p className="text-sm text-slate-600 font-medium">Recommended Experience</p>
          </div>

          <div className="flex flex-col gap-2 border-l border-slate-200 pl-6">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <Clock className="w-5 h-5" />
              {test.duration} Minutes
            </div>
            <p className="text-sm text-slate-600 font-medium">Auto-submission at deadline</p>
          </div>

          <div className="flex flex-col gap-2 border-l border-slate-200 pl-6">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-lg">
              <HelpCircle className="w-5 h-5" />
              {test.questions?.length || 'Multiple'} Questions
            </div>
            <p className="text-sm text-slate-600 font-medium">Multiple Choice Format</p>
          </div>
        </div>

        {/* 5. Split Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left Main Content */}
          <div className="lg:col-span-8 space-y-16">

            {/* What you'll learn */}
            <section id="outcomes">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">What you'll gain</h2>
              <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <li className="flex gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                    <span className="text-slate-700 font-medium">Real exam environment simulation</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                    <span className="text-slate-700 font-medium">Detailed performance analytics and reporting</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                    <span className="text-slate-700 font-medium">Identification of weak subjects and topics</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                    <span className="text-slate-700 font-medium">Time management skills under pressure</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Skills Pills */}
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-4">Skills Tested</h2>
              <div className="flex flex-wrap gap-2">
                {['Time Management', 'Problem Solving', 'Accuracy', 'Speed', 'Concept Application'].map((skill, i) => (
                  <span key={i} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-full transition-colors cursor-default">
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Syllabus / Instructions Accordion */}
            <section id="syllabus">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Test Syllabus & Instructions</h2>

              <div className="space-y-4">
                {/* Accordion Item 1 */}
                <details className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm" open>
                  <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#f4fbf8] text-[#00BC7D] rounded-lg flex items-center justify-center font-bold text-lg">1</div>
                      <span className="text-lg text-slate-900">Exam Instructions</span>
                    </div>
                    <span className="transition group-open:rotate-180">
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    </span>
                  </summary>
                  <div className="p-6 pt-0 border-t border-slate-100">
                    <ul className="space-y-4 mt-4 relative z-10 w-full md:w-3/4">
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#00BC7D] fill-[#00BC7D]/10 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 text-sm font-medium">Once started, the timer cannot be paused.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#00BC7D] fill-[#00BC7D]/10 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 text-sm font-medium">Ensure you have a stable internet connection.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#00BC7D] fill-[#00BC7D]/10 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 text-sm font-medium">Do not refresh or close the browser window during the test.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-[#00BC7D] fill-[#00BC7D]/10 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 text-sm font-medium">The test will be auto-submitted when the time is over.</span>
                      </li>
                    </ul>
                  </div>
                </details>

                {/* Accordion Item 2 */}
                <details className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#f4fbf8] text-[#00BC7D] rounded-lg flex items-center justify-center font-bold text-lg">2</div>
                      <span className="text-lg text-slate-900">Marking Scheme</span>
                    </div>
                    <span className="transition group-open:rotate-180">
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    </span>
                  </summary>
                  <div className="p-6 pt-0 border-t border-slate-100">
                    <p className="text-slate-600 mt-4 leading-relaxed">
                      Each correct answer awards positive marks. There is <strong>No Negative Marking</strong> in this mock test unless specified otherwise in the question. Unattempted questions yield 0 marks.
                    </p>
                  </div>
                </details>
              </div>
            </section>

          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-[100px] space-y-6">

              {/* Creator Widget */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 text-lg mb-4">Offered By</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#00BC7D] to-[#009c3e] rounded-lg flex items-center justify-center shadow-inner text-white font-bold text-xl">
                    AC
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Acadify Experts</h4>
                    <p className="text-sm text-slate-500">Premium Educator</p>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                  Acadify provides world-class educational tools and highly curated mock exams to ensure students perform at their absolute best in competitive examinations.
                </p>
                <div className="grid grid-cols-2 gap-2 text-center border-t border-slate-100 pt-4">
                  <div>
                    <p className="text-lg font-bold text-slate-900">54</p>
                    <p className="text-xs text-slate-500 font-medium">Tests</p>
                  </div>
                  <div className="border-l border-slate-100">
                    <p className="text-lg font-bold text-slate-900">210k+</p>
                    <p className="text-xs text-slate-500 font-medium">Learners</p>
                  </div>
                </div>
              </div>

              {/* Test Features Widget */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 text-lg mb-6">Test Features</h3>
                <ul className="space-y-5">
                  <li className="flex gap-4">
                    <Trophy className="w-6 h-6 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Passing Marks</p>
                      <p className="text-slate-500 text-sm">{test.passingMarks || 'Not Specified'}</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <Layers className="w-6 h-6 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Difficulty Level</p>
                      <p className="text-slate-500 text-sm">Mixed</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <Calendar className="w-6 h-6 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Validity</p>
                      <p className="text-slate-500 text-sm">Unlimited Access</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <PieChart className="w-6 h-6 text-slate-400 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 text-sm">Results</p>
                      <p className="text-slate-500 text-sm">Instant Analytics</p>
                    </div>
                  </li>
                </ul>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
