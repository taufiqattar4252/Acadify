import React from 'react';
import { Loader2 } from 'lucide-react';

export const Spinner = ({ className = '', size = 'md' }: { className?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };
  return <Loader2 className={`${sizeClasses[size]} animate-spin text-primary-600 ${className}`} />;
};
