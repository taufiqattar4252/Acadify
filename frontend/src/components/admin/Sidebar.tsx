'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAdminStore } from '@/store/adminStore';
import {
  LayoutDashboard,
  BookOpen,
  Library,
  HelpCircle,
  FileText,
  Users,
  ShoppingCart,
  CreditCard,
  History,
  BarChart3,
  Settings,
  ShieldAlert,
  LifeBuoy,
  LogOut,
  X,
  Radio
} from 'lucide-react';
import { useLogout } from '@/services/authApi';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Subjects', href: '/admin/subjects', icon: BookOpen },
  { name: 'Chapters', href: '/admin/chapters', icon: Library },
  { name: 'Questions', href: '/admin/questions', icon: HelpCircle },
  { name: 'Mock Tests', href: '/admin/mock-tests', icon: FileText },
  { name: 'Students', href: '/admin/students', icon: Users },
  { name: 'Purchases', href: '/admin/purchases', icon: ShoppingCart },
  { name: 'Payments', href: '/admin/payments', icon: CreditCard },
  { name: 'Attempts', href: '/admin/attempts', icon: History },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Broadcast', href: '/admin/broadcast', icon: Radio },
];

const bottomNavItems = [
  { name: 'Admins', href: '/admin/admins', icon: ShieldAlert },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Support', href: '/admin/support', icon: LifeBuoy },
];

export const Sidebar = () => {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useAdminStore();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-slate-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 flex w-64 flex-col bg-white border-r border-border transition-transform duration-300 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <Link href="/admin" className="text-2xl font-bold text-primary-600">
            Acadify
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-muted-foreground hover:text-muted-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3">
            Main Navigation
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                  isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className={cn('w-5 h-5 mr-3 flex-shrink-0', isActive ? 'text-primary-600' : 'text-muted-foreground group-hover:text-muted-foreground')} />
                {item.name}
              </Link>
            );
          })}

          <div className="mt-8 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-3 pt-4 border-t border-border">
            System
          </div>
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                  isActive 
                    ? 'bg-primary-50 text-primary-700' 
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <item.icon className={cn('w-5 h-5 mr-3 flex-shrink-0', isActive ? 'text-primary-600' : 'text-muted-foreground group-hover:text-muted-foreground')} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive-light transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};
