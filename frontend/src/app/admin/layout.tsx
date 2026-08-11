'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TopNavbar } from '@/components/admin/TopNavbar';
import { useUser } from '@/services/authApi';
import { Spinner } from '@/components/ui/Spinner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isError || !user) {
        router.replace('/login');
      } else if (!user.role || !['Super Admin', 'Content Admin', 'Support Admin'].includes(user.role)) {
        router.replace('/login');
      }
    }
  }, [user, isLoading, isError, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6]">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] flex flex-col font-sans">
      <TopNavbar />
      <main className="flex-1 overflow-x-hidden p-6 md:p-8">
        <div className="max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
