'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PartnerTopNavbar } from '@/components/partner/PartnerTopNavbar';
import { useUser } from '@/services/authApi';
import { Spinner } from '@/components/ui/Spinner';

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user, redirect them to login
    if (!isLoading && (!user || user.role !== 'Partner')) {
      router.replace('/partner-login');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6] dark:bg-gray-900">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] dark:bg-gray-900 flex flex-col font-sans">
      <PartnerTopNavbar />
      <main className="flex-1 overflow-x-hidden p-6 md:p-8">
        <div className="max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
