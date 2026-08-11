'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Bell,
  Settings,
  User,
  ChevronDown,
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  BarChart3,
  LogOut
} from 'lucide-react';
import { useLogout, useUser } from '@/services/authApi';

const navItems = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Students', href: '/admin/students' },
  { name: 'Mock Tests', href: '/admin/mock-tests' },
  { name: 'Questions', href: '/admin/questions' },
  { name: 'Broadcast', href: '/admin/broadcast' },
];

export const TopNavbar = () => {
  const pathname = usePathname();
  const { data: user } = useUser();
  const logoutMutation = useLogout();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-[#f4f7f6]">
      
      {/* LEFT: Brand Logo */}
      <div className="flex items-center gap-2 cursor-pointer">
        <div className="w-8 h-8 rounded-lg bg-[#00BC7D] flex items-center justify-center transform -rotate-12">
          <div className="w-3 h-3 bg-white rounded-sm"></div>
        </div>
        <span className="text-xl font-bold text-slate-800 tracking-tight">Acadify</span>
      </div>

      {/* CENTER: Floating Pill Navigation */}
      <nav className="hidden md:flex items-center bg-white px-2 py-1.5 rounded-full shadow-lumina">
        {navItems.map((item) => {
          const isActive = item.href === '/admin' 
            ? pathname === item.href 
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'px-5 py-2 rounded-full text-sm font-medium transition-all duration-300',
                isActive
                  ? 'bg-slate-100 text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              {item.name}
            </Link>
          );
        })}

        {/* Dropdown for More */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="px-5 py-2 rounded-full text-sm font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50 flex items-center gap-1 transition-all duration-300"
          >
            More <ChevronDown className="w-4 h-4" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-4 w-48 bg-white rounded-2xl shadow-lumina-hover border border-slate-100 py-2 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
              <Link href="/admin/subjects" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900">Subjects</Link>
              <Link href="/admin/chapters" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900">Chapters</Link>
              <Link href="/admin/purchases" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900">Purchases</Link>
              <Link href="/admin/payments" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900">Payments</Link>
              <Link href="/admin/attempts" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900">Attempts</Link>
              <Link href="/admin/partners" className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900">Partners</Link>
              <div className="h-px bg-slate-100 my-1"></div>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* RIGHT: Actions & Profile */}
      <div className="flex items-center gap-3">
        <Link 
          href="/admin/settings"
          className="w-10 h-10 rounded-full bg-white shadow-lumina flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </Link>
        <Link 
          href="/admin/notifications"
          className="w-10 h-10 rounded-full bg-white shadow-lumina flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors relative"
        >
          <Bell className="w-5 h-5" />
        </Link>
        
        <Link href="/admin/settings/profile" className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center cursor-pointer">
          <User className="w-5 h-5 text-slate-500" />
        </Link>
      </div>
    </header>
  );
};
