'use client';

import React from 'react';
import { useAdminStore } from '@/store/adminStore';
import { useUser } from '@/services/authApi';
import { Menu, Bell, Search, User } from 'lucide-react';
import { Badge } from '../ui/Badge';

export const Topbar = () => {
  const { toggleSidebar, notificationsCount } = useAdminStore();
  const { data: user } = useUser();

  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-lg text-muted-foreground hover:bg-muted lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center w-full max-w-md relative">
          <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search anything..."
            className="w-full pl-9 pr-4 py-2 bg-muted/50 border border-transparent rounded-lg text-sm focus:bg-white focus:border-primary-300 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 rounded-full text-muted-foreground hover:bg-muted transition-colors">
          <Bell className="w-5 h-5" />
          {notificationsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          )}
        </button>

        <div className="h-8 w-px bg-muted-hover mx-1 hidden sm:block" />

        <div className="flex items-center gap-3 cursor-pointer p-1 rounded-lg hover:bg-muted transition-colors">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-muted-foreground">
              {user?.fullName || 'Admin User'}
            </span>
            <Badge variant="info" className="text-[10px] px-1.5 py-0">
              {user?.role || 'Super Admin'}
            </Badge>
          </div>
          <div className="h-9 w-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center border border-primary-200">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};
