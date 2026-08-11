import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Store, 
  ShoppingBag, 
  User, 
  LogOut 
} from 'lucide-react';
import { useLogout } from '@/services/authApi';

export const StudentSidebar = () => {
  const pathname = usePathname();
  const logout = useLogout();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Mock Store', href: '/dashboard/mock-tests', icon: Store },
    { name: 'Purchases', href: '/dashboard/purchases', icon: ShoppingBag },
    { name: 'Profile', href: '/dashboard/profile', icon: User },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col hidden md:flex">
      <div className="p-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
          Acadify
        </h2>
        <p className="text-xs text-slate-400 mt-1">Student Portal</p>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={() => logout.mutate()}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};
