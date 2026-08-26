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
    'bg-success-light text-success', 
    'bg-primary-light text-primary', 
    'bg-warning-light text-warning', 
    'bg-primary-light text-primary',
    'bg-destructive-light text-destructive'
  ];
  const colorClass = colors[title.length % colors.length];

  return (
    <Card className={cn('p-6 flex flex-col justify-between h-full relative overflow-hidden', className)}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-[28px] font-bold text-foreground leading-none mb-2">{value}</h2>
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        </div>
        <div className={cn("p-3 rounded-2xl", colorClass)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 pt-4 border-t border-slate-50/50 flex items-center">
          <span className={cn('text-xs font-bold px-2 py-1 rounded-full', isPositive ? 'bg-success-light text-success' : 'bg-destructive-light text-destructive')}>
            {isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-xs text-muted-foreground ml-2">{trend.label}</span>
        </div>
      )}
    </Card>
  );
};
