'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useGetStudentMockTests, useGetStudentPurchases } from '@/services/studentApi';
import { useAddToCart, useGetCart } from '@/services/cartApi';
import { Search, Filter, BookOpen, Clock, Tag, IndianRupee, ChevronLeft, ChevronRight, ShoppingCart, Sparkles, FileText, Trophy, Star, CheckCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import Image from 'next/image';

const CustomSelect = ({ value, onChange, options, placeholder }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const selectedOption = options.find((opt: any) => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full min-w-[160px] px-4 py-3 rounded-full border border-slate-100 bg-slate-50 focus:border-[#00BC7D] focus:bg-white focus:ring-1 focus:ring-[#00BC7D] outline-none text-sm transition-all text-slate-700"
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full min-w-[180px] bg-white rounded-2xl shadow-lumina-hover border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
          {options.map((opt: any) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${value === opt.value
                  ? "bg-[#00BC7D]/10 text-[#00BC7D] font-bold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const MockTestCard = ({ test, router, cartData, handleAddToCart, addToCartMutation, isPurchased }: any) => (
  <div
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
      {test.price === 0 && !isPurchased && (
        <div className="absolute top-4 -right-1 z-30">
          <div className="bg-[#00BC7D] text-white text-[13px] font-bold px-4 py-1.5 rounded-l-md rounded-tr-md flex items-center gap-1 shadow-md relative">
            <Sparkles className="w-3.5 h-3.5" /> FREE
            {/* Ribbon fold */}
            <div className="absolute -bottom-1.5 right-0 border-t-[6px] border-t-[#009c3e] border-r-[6px] border-r-transparent"></div>
          </div>
        </div>
      )}

      {isPurchased && (
        <div className="absolute top-4 -right-1 z-30">
          <div className="bg-[#00BC7D] text-white text-[13px] font-bold px-4 py-1.5 rounded-l-md rounded-tr-md flex items-center gap-1 shadow-md relative">
            <CheckCircle className="w-3.5 h-3.5" /> ENROLLED
            {/* Ribbon fold */}
            <div className="absolute -bottom-1.5 right-0 border-t-[6px] border-t-[#009c3e] border-r-[6px] border-r-transparent"></div>
          </div>
        </div>
      )}
    </div>

    {/* Content Area */}
    <div className="px-3 pt-4 flex flex-col flex-1">
      <h3 className="text-lg font-medium text-slate-700 line-clamp-1 leading-tight transition-colors mb-3">
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
          <Clock className="w-4 h-4 text-[#00BC7D]" /> Duration: {test.duration || '-'} mins
        </div>
        <div className="w-px h-4 bg-slate-200"></div>
        <div className="flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-[#00BC7D]" /> Total Marks: {test.totalMarks || '-'}
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
            {isPurchased ? (
              <span className="text-[14px] text-slate-500 font-medium pt-2">Purchased</span>
            ) : test.price === 0 ? (
              <div className="bg-[#e8f7f0] text-[#00BC7D] text-[13px] uppercase tracking-wider font-bold px-4 py-2 rounded-full flex items-center gap-1.5 shadow-sm">
                <Tag className="w-4 h-4 fill-current" /> FREE
              </div>
            ) : (
              <span className="text-[20px]">₹{(test.price || 0).toFixed(2)}</span>
            )}
          </div>
          {!isPurchased && test.price > 0 && (
            <div className="text-[13px] text-slate-400 line-through leading-none pb-[2px]">
              ₹{(test.price * 1.2).toFixed(2)}
            </div>
          )}
        </div>

        {/* Actions Area */}
        <div className="ml-auto">
          {isPurchased ? (
            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/mock-tests/${test.slug}`); }}
              className="p-2.5 bg-[#00BC7D] text-white rounded-xl hover:bg-[#00a870] transition-colors flex items-center gap-2 text-sm font-bold px-4 shadow-lg shadow-[#00BC7D]/30"
            >
              Start Test
            </button>
          ) : cartData?.items?.some((item: any) => item.mockTest._id === test._id || item.mockTest === test._id) ? (
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

export default function MockStorePage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('-createdAt');

  const { data, isLoading } = useGetStudentMockTests(page, 12, debouncedSearch, category, sort);
  const { data: purchasesData, isLoading: isPurchasesLoading } = useGetStudentPurchases();
  const { data: cartData } = useGetCart();
  const addToCartMutation = useAddToCart();

  const handleAddToCart = (e: React.MouseEvent, testId: string) => {
    e.stopPropagation();
    addToCartMutation.mutate(testId);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Derived state for purchased vs unpurchased
  const purchasedTests = purchasesData?.purchases?.map((p: any) => p.mockTest) || [];
  const purchasedTestIds = new Set(purchasedTests.map((t: any) => t._id));

  // Filter the paginated store tests to exclude ones already purchased
  const storeTests = data?.tests?.filter((t: any) => !purchasedTestIds.has(t._id)) || [];

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-normal text-slate-800">
          Mock Test <span className="font-semibold text-slate-900">Store</span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">Discover and purchase premium mock tests to ace your exams.</p>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-lumina border-transparent flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search mock tests..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-full border border-slate-100 bg-slate-50 focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 outline-none text-sm transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <CustomSelect
            value={category}
            onChange={(val: string) => { setCategory(val); setPage(1); }}
            placeholder="All Categories"
            options={[
              { value: "", label: "All Categories" },
              { value: "Full Mock Test", label: "Full Mock Test" },
              { value: "Physics Test", label: "Physics Test" },
              { value: "Chemistry Test", label: "Chemistry Test" },
              { value: "Mathematics Test", label: "Mathematics Test" },
              { value: "Chapter-wise Test", label: "Chapter-wise Test" },
              { value: "Previous Year Paper", label: "Previous Year Paper" },
            ]}
          />
          <CustomSelect
            value={sort}
            onChange={(val: string) => { setSort(val); setPage(1); }}
            placeholder="Sort by"
            options={[
              { value: "-createdAt", label: "Newest First" },
              { value: "createdAt", label: "Oldest First" },
              { value: "-price", label: "Highest Price" },
              { value: "price", label: "Lowest Price" },
            ]}
          />
        </div>
      </div>

      {/* My Mock Tests Section */}
      {(!search && page === 1 && purchasedTests.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">My Mock Tests</h2>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{purchasedTests.length} Enrolled</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {purchasedTests.map((test: any) => (
              <MockTestCard
                key={test._id}
                test={test}
                router={router}
                cartData={cartData}
                handleAddToCart={handleAddToCart}
                addToCartMutation={addToCartMutation}
                isPurchased={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Available for Purchase Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Unlock More That Help You Score 99+ Percentile</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="h-80 rounded-3xl" />)}
          </div>
        ) : storeTests.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-lumina border-transparent">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No available tests found</h3>
            <p className="text-slate-500 mt-1">You may have purchased them all, or try adjusting filters.</p>
            <Button variant="secondary" className="mt-6 mx-auto rounded-full px-6" onClick={() => { setSearch(''); setCategory(''); }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {storeTests.map((test: any) => (
              <MockTestCard
                key={test._id}
                test={test}
                router={router}
                cartData={cartData}
                handleAddToCart={handleAddToCart}
                addToCartMutation={addToCartMutation}
                isPurchased={false}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-8">
          <Button
            variant="secondary"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2 py-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-sm font-medium text-slate-700 px-4">
            Page {page} of {data.pagination.pages}
          </span>
          <Button
            variant="secondary"
            onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
            disabled={page === data.pagination.pages}
            className="px-2 py-2"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
