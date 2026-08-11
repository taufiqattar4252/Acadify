import React from 'react';
import { Card } from './Card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, className }) => {
  const isPositive = trend && trend.value >= 0;

  // Generate a random pastel color for the icon background based on the title length (deterministic)
  const colors = [
    'bg-emerald-50 text-emerald-500', 
    'bg-blue-50 text-blue-500', 
    'bg-amber-50 text-amber-500', 
    'bg-purple-50 text-purple-500',
    'bg-rose-50 text-rose-500'
  ];
  const colorClass = colors[title.length % colors.length];

  return (
    <Card className={cn('p-6 flex flex-col justify-between h-full relative overflow-hidden', className)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-[28px] font-bold text-slate-900 leading-none mb-2">{value}</h2>
          <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        </div>
        <div className={cn("p-3 rounded-2xl", colorClass)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 pt-4 border-t border-slate-50/50 flex items-center">
          <span className={cn('text-xs font-bold px-2 py-1 rounded-full', isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600')}>
            {isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-slate-400 ml-2">{trend.label}</span>
        </div>
      )}
    </Card>
  );
};
