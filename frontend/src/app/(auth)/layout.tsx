import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-white flex overflow-hidden">
      {/* Left side: Form */}
      <div className="flex-1 overflow-y-auto lg:flex-none lg:w-[480px] xl:w-[560px] 2xl:w-[640px]">
        <div className="min-h-full flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="mx-auto w-full max-w-sm lg:w-[400px]">
            <div className="mb-8">
              <Link href="/" className="flex items-center gap-2 group w-fit">
                <div className="bg-primary-600 p-2 rounded-xl group-hover:scale-105 transition-transform shadow-lg shadow-primary-500/20">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-extrabold text-foreground tracking-tight">
                  Acadify
                </span>
              </Link>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/40 border border-border p-8 sm:p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-primary-600" />
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Illustration/Pattern */}
      <div className="hidden lg:flex flex-1 relative bg-muted overflow-hidden items-center justify-center p-12">
        {/* Decorative background blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-primary-200/40 blur-3xl mix-blend-multiply animate-pulse" />
        <div className="absolute bottom-[-10%] left-[10%] w-[600px] h-[600px] rounded-full bg-blue-200/40 blur-3xl mix-blend-multiply animate-pulse delay-1000" />
        
        <div className="relative z-10 w-full max-w-2xl">
          <div className="bg-white/40 backdrop-blur-3xl rounded-3xl border border-white/60 p-12 shadow-2xl shadow-slate-200/50 text-center">
            <h2 className="text-4xl font-extrabold text-foreground tracking-tight mb-6">
              Master the MHT-CET <br/>
              <span className="text-primary-600">With Confidence.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              Join thousands of students preparing for their engineering and pharmacy entrance exams with our comprehensive mock test platform.
            </p>
            
            <div className="mt-12 grid grid-cols-3 gap-6 text-center">
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/50">
                <div className="text-3xl font-bold text-primary-600 mb-1">10k+</div>
                <div className="text-sm font-medium text-muted-foreground">Active Students</div>
              </div>
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/50">
                <div className="text-3xl font-bold text-primary-600 mb-1">100+</div>
                <div className="text-sm font-medium text-muted-foreground">Mock Tests</div>
              </div>
              <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 shadow-sm border border-white/50">
                <div className="text-3xl font-bold text-primary-600 mb-1">150k</div>
                <div className="text-sm font-medium text-muted-foreground">Questions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
