'use client';

import React, { useEffect, Suspense, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { useVerifyEmail } from '@/services/authApi';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const verifyEmailMutation = useVerifyEmail();
  
  // Use a ref to prevent double-firing in StrictMode
  const hasVerified = useRef(false);

  useEffect(() => {
    if (token && !hasVerified.current) {
      hasVerified.current = true;
      verifyEmailMutation.mutate(token);
    }
  }, [token]);

  if (!token) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-destructive-light mb-4">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Invalid Link</h3>
        <p className="text-muted-foreground mb-6">
          The verification link is missing or invalid. Please check your email and try again.
        </p>
        <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
          Return to login
        </Link>
      </div>
    );
  }

  if (verifyEmailMutation.isPending || verifyEmailMutation.isIdle) {
    return (
      <div className="text-center py-8">
        <Spinner size="lg" className="mx-auto mb-6 text-primary-600" />
        <h3 className="text-xl font-bold text-foreground mb-2">Verifying your email</h3>
        <p className="text-muted-foreground">
          Please wait a moment while we verify your account...
        </p>
      </div>
    );
  }

  if (verifyEmailMutation.isError) {
    return (
      <div className="text-center py-4">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-destructive-light mb-4">
          <AlertCircle className="h-6 w-6 text-destructive" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">Verification Failed</h3>
        <p className="text-muted-foreground mb-6">
          The link has expired or is invalid. Please request a new verification link.
        </p>
        <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
          Return to login
        </Link>
      </div>
    );
  }

  // isSuccess
  return (
    <div className="text-center py-4">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-success-light mb-4">
        <CheckCircle2 className="h-6 w-6 text-success" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">Email Verified!</h3>
      <p className="text-muted-foreground mb-6">
        Your email has been successfully verified. You are being redirected to the dashboard.
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center py-8 text-muted-foreground">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
