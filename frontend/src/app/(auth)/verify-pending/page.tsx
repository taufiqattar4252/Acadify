'use client';

import React from 'react';
import Link from 'next/link';
import { Mail, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function VerifyPendingPage() {
  return (
    <div className="text-center py-8">
      <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-primary-100 mb-6">
        <Mail className="h-10 w-10 text-primary-600" />
      </div>
      
      <h3 className="text-2xl font-extrabold text-foreground mb-4 tracking-tight">Check your email</h3>
      
      <p className="text-muted-foreground text-lg mb-8 max-w-sm mx-auto leading-relaxed">
        We've sent a verification link to your registered email address. 
        Please click the link to verify your account and continue.
      </p>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Didn't receive the email? Check your spam folder.
        </p>
        
        <div className="pt-4 flex justify-center">
          <Link href="/login">
            <Button variant="secondary" className="flex items-center gap-2">
              Back to login <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
