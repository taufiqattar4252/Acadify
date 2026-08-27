import React from 'react';
import Link from 'next/link';
import { Headphones, Check } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-white flex overflow-hidden">
      <div className="flex-1 flex flex-col xl:flex-none xl:w-[600px] 2xl:w-[700px] px-8 sm:px-16 lg:px-20 pt-8 pb-4">
        <header className="w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#11c880] flex items-center justify-center transform -rotate-12 shadow-sm">
              <div className="w-4 h-4 rounded bg-white"></div>
            </div>
            <span className="font-bold text-[22px] text-foreground tracking-tight">Acadify</span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Headphones className="w-5 h-5 text-muted-foreground" />
            <span>Need help? <Link href="/support" className="text-emerald-500 hover:text-emerald-600">Contact Support</Link></span>
          </div>
        </header>

        <div className="w-full max-w-md mx-auto xl:mx-0 flex-1 flex flex-col justify-center">
          {children}
        </div>
      </div>

      {/* Right Column: Illustration & Social Proof */}
      <div className="hidden xl:flex flex-1 relative bg-gradient-to-br from-[#f8f5ff] via-[#fdf7ff] to-[#fff5f5] overflow-hidden items-center justify-center p-12">
        {/* Background glow effects */}
        <div className="absolute top-[20%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-200/40 blur-[80px] mix-blend-multiply" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-warning-light/50 blur-[80px] mix-blend-multiply" />
        
        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
          
          <div className="flex items-center gap-3 mb-8">
            <div className="flex -space-x-2">
              <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=1" alt="Avatar 1" />
              <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=2" alt="Avatar 2" />
              <img className="w-8 h-8 rounded-full border-2 border-white object-cover" src="https://i.pravatar.cc/100?img=3" alt="Avatar 3" />
            </div>
            <span className="text-sm font-semibold text-muted-foreground"><span className="text-emerald-500 font-bold">25,000+</span> Aspirants Trust Us</span>
          </div>

          <h2 className="text-lg font-semibold font-sans text-foreground tracking-tight text-center leading-tight mb-4">
            "Top MHT-CET rankers <br/> started just like you."
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-sm">
            Practice smarter, analyze deeper and achieve your dream college.
          </p>

          {/* Abstract UI Component */}
          <div className="relative w-full max-w-lg mb-16">
            {/* Floating Tags */}
            <div className="absolute -left-12 top-10 bg-[#f43f5e] text-white text-xs font-bold px-3 py-1.5 rounded-full rotate-[-12deg] shadow-lg">#Practice</div>
            <div className="absolute -right-4 -top-4 bg-[#d946ef] text-white text-xs font-bold px-3 py-1.5 rounded-full rotate-[10deg] shadow-lg">#Excel</div>
            <div className="absolute -left-16 bottom-20 bg-[#0ea5e9] text-white text-xs font-bold px-3 py-1.5 rounded-full rotate-[-5deg] shadow-lg">#Analyze</div>
            <div className="absolute left-4 -bottom-6 bg-[#10b981] text-white text-xs font-bold px-3 py-1.5 rounded-full rotate-[4deg] shadow-lg">#Achieve</div>

            {/* Quiz Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl shadow-slate-200/50 border border-white p-6 pb-12 w-full max-w-md mx-auto">
              <div className="text-xs font-bold text-foreground mb-2">Physics</div>
              <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
                A ball is thrown vertically upwards with a velocity of u.<br/>
                The time taken to reach the maximum height is:
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 rounded-xl border border-border bg-white">
                  <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center text-[10px] font-bold">A</div>
                  <span className="text-xs text-muted-foreground">u / g</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl border border-green-200 bg-success-light/50 relative">
                  <div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center text-[10px] font-bold">B</div>
                  <span className="text-xs text-muted-foreground font-medium">2u / g</span>
                  <div className="absolute right-3 w-4 h-4 rounded-full bg-green-500 text-white flex items-center justify-center">
                    <Check className="w-3 h-3" />
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl border border-border bg-white">
                  <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-bold">C</div>
                  <span className="text-xs text-muted-foreground">u / 2g</span>
                </div>
                <div className="flex items-center gap-3 p-2 rounded-xl border border-pink-200 bg-pink-50/50">
                  <div className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px] font-bold">D</div>
                  <span className="text-xs text-muted-foreground font-medium">g / u</span>
                </div>
              </div>
            </div>

            {/* Performance Card Overlay */}
            <div className="absolute -right-16 bottom-[-20px] bg-white rounded-2xl shadow-xl shadow-slate-300/40 border border-border p-5 w-48 z-20">
              <div className="text-[10px] font-bold text-foreground mb-3 text-center">Your Performance</div>
              
              <div className="relative w-20 h-20 mx-auto mb-4">
                <svg viewBox="0 0 36 36" className="w-full h-full text-success transform -rotate-90">
                  <path
                    className="text-slate-100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                  />
                  <path
                    className="text-success"
                    strokeDasharray="72, 100"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-sm font-extrabold text-foreground">72%</span>
                  <span className="text-[8px] text-muted-foreground uppercase">Score</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] mb-1">
                <span className="text-muted-foreground">Accuracy</span>
                <span className="font-bold text-muted-foreground">72%</span>
              </div>
              <div className="flex justify-between items-center text-[10px] mb-4">
                <span className="text-muted-foreground">Correct</span>
                <span className="font-bold text-muted-foreground">36 / 50</span>
              </div>
              
              <button className="w-full bg-[#10b981] text-white text-[10px] font-bold py-2 rounded-lg shadow-sm hover:bg-[#059669] transition-colors">
                View Analysis
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
