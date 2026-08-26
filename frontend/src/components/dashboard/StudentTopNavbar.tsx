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
  LogOut,
  LayoutDashboard,
  FileText,
  CreditCard,
  Target,
  Trophy,
  ShoppingCart
} from 'lucide-react';
import { useLogout, useUser } from '@/services/authApi';
import { useGetCart } from '@/services/cartApi';
import { NotificationDropdown } from './NotificationDropdown';

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'My Mock Tests', href: '/dashboard/mock-tests' },
  { name: 'Result Analysis', href: '/dashboard/results' },
];

export const StudentTopNavbar = () => {
  const pathname = usePathname();
  const { data: user } = useUser();
  const { data: cartData } = useGetCart();
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
    <header className="sticky top-0 z-50 bg-[#F4F7F6] px-4 lg:px-2 pt-8 pb-4">
      <div className="max-w-[1400px] mx-auto w-full flex items-center justify-between">
        {/* LEFT: Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-[#00BC7D] flex items-center justify-center transform -rotate-12">
            <div className="w-3.5 h-3.5 bg-white rounded-[4px]"></div>
          </div>
          <span className="text-2xl font-bold text-foreground tracking-tight ml-1">Acadify</span>
        </Link>

        {/* CENTER: Floating Pill Navigation */}
        <nav className="hidden md:flex items-center bg-white px-2 py-1.5 rounded-full shadow-lumina">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard'
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'px-5 py-2 rounded-full text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'bg-muted text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {item.name}
              </Link>
            );
          })}


        </nav>

        {/* RIGHT: Actions & Profile */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard/cart" className="relative w-10 h-10 rounded-full bg-white shadow-lumina flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {cartData && cartData.items && cartData.items.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#00BC7D] text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                {cartData.items.length}
              </span>
            )}
          </Link>


          <NotificationDropdown />

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-10 h-10 rounded-full bg-muted-hover border-2 border-white shadow-sm overflow-hidden flex items-center justify-center cursor-pointer hover:border-border transition-colors"
            >
              <User className="w-5 h-5 text-muted-foreground" />
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-4 w-48 bg-white rounded-2xl shadow-lumina-hover border border-border py-2 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                <Link href="/dashboard/purchases" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">My Purchases</Link>
                <Link href="/dashboard/profile" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">Profile</Link>
                <Link href="/dashboard/settings/notifications" onClick={() => setDropdownOpen(false)} className="block px-4 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">Settings</Link>
                <div className="h-px bg-muted my-1"></div>
                <button
                  onClick={() => { setDropdownOpen(false); handleLogout(); }}
                  className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-destructive-light flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
