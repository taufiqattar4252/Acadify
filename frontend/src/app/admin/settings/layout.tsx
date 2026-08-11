'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  User, 
  Settings, 
  GraduationCap, 
  CreditCard, 
  Mail, 
  Bell, 
  Shield, 
  Palette, 
  Lock, 
  HardDrive 
} from 'lucide-react';

const sidebarLinks = [
  { name: 'Profile', href: '/admin/settings/profile', icon: User },
  { name: 'General', href: '/admin/settings/general', icon: Settings },
  { name: 'Exam Settings', href: '/admin/settings/exam', icon: GraduationCap },
  { name: 'Payment', href: '/admin/settings/payment', icon: CreditCard },
  { name: 'Email', href: '/admin/settings/email', icon: Mail },
  { name: 'Notifications', href: '/admin/settings/notifications', icon: Bell },
  { name: 'Roles & Permissions', href: '/admin/settings/roles', icon: Shield },
  { name: 'Website & Branding', href: '/admin/settings/branding', icon: Palette },
  { name: 'Security', href: '/admin/settings/security', icon: Lock },
  { name: 'System', href: '/admin/settings/system', icon: HardDrive },
];

import { useGetSettings } from '@/services/adminSettingsApi';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Keep the settings cache warm at the layout level to prevent 
  // loading skeletons from flashing during soft navigations between settings pages
  useGetSettings();

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage global configurations and preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* SIDEBAR */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col gap-1 sticky top-24">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive ? 'text-primary-600' : 'text-slate-400')} />
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 min-h-[500px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
