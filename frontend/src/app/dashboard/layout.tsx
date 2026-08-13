'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { StudentTopNavbar } from '@/components/dashboard/StudentTopNavbar';
import { useUser } from '@/services/authApi';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading, isError } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (isError || !user) {
        router.replace('/login');
      }
    }
  }, [user, isLoading, isError, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7F6]">
        <Spinner size="xl" />
      </div>
    );
  }

  const isExamView = pathname?.startsWith('/dashboard/exam/');

  if (isExamView) {
    return (
      <div className="min-h-screen w-full font-sans bg-white">
        {children}
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F4F7F6] flex flex-col font-sans overflow-hidden">
      <StudentTopNavbar />
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:px-2 lg:py-6">
        <div className="max-w-[1400px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
