import React from 'react';
import { Bell, Search, Menu } from 'lucide-react';
import { useUser } from '@/services/authApi';

export const StudentTopbar = () => {
  const { data: user } = useUser();

  return (
    <header className="bg-white border-b border-border h-16 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 text-muted-foreground hover:bg-muted rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg text-muted-foreground focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:bg-white transition-all w-64">
          <Search className="w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search mock tests..." 
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-full transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-foreground">{user?.fullName || 'Student'}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role || 'student'}</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary-light border border-indigo-200 flex items-center justify-center text-primary font-bold shadow-sm">
            {user?.fullName?.charAt(0).toUpperCase() || 'S'}
          </div>
        </div>
      </div>
    </header>
  );
};
