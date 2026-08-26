'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useUser, useLogout } from '@/services/authApi';
import { LogOut, PieChart, ShoppingCart, Banknote, User } from 'lucide-react';

export const PartnerTopNavbar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const logoutMutation = useLogout();
  const { data: user } = useUser();

  const handleLogout = () => {
    logoutMutation.mutate();
    // Router push is handled inside useLogout
  };

  const navItems = [
    { name: 'Dashboard', href: '/partner/dashboard', icon: <PieChart /> },
    { name: 'Purchases', href: '/partner/purchases', icon: <ShoppingCart /> },
    { name: 'Commissions', href: '/partner/commissions', icon: <Banknote /> },
    { name: 'Profile', href: '/partner/profile', icon: <User /> },
  ];

  return (
    <nav className="bg-white dark:bg-card border-b border-border dark:border-border sticky top-0 z-30 w-full">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/partner/dashboard" className="text-xl font-bold text-primary dark:text-indigo-400">
            Partner Portal
          </Link>
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                  pathname.includes(item.href)
                    ? 'bg-primary-light text-primary dark:bg-indigo-900/50 dark:text-indigo-300'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground dark:text-gray-300 dark:hover:bg-muted/50 dark:hover:text-white'
                }`}
              >
                {item.icon} {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-sm text-muted-foreground dark:text-gray-300">
            Welcome, <span className="font-bold">{user?.fullName || 'Partner'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive-light rounded-full transition dark:text-muted-foreground dark:hover:text-red-400 dark:hover:bg-red-900/30"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};
