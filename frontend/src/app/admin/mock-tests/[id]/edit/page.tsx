'use client';

import { use } from 'react';
import MockTestBuilder from '@/components/admin/MockTestBuilder/MockTestBuilder';
import { useGetMockTest } from '@/services/mockTestApi';
import { Loader2 } from 'lucide-react';

export default function EditMockTestPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { data: initialData, isLoading, isError } = useGetMockTest(resolvedParams.id);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading mock test builder...</p>
      </div>
    );
  }

  if (isError || !initialData) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Failed to load mock test.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <MockTestBuilder initialData={initialData} isEdit={true} />
    </div>
  );
}
