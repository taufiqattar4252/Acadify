import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className, ...props }) => {
  const variantStyles: Record<BadgeVariant, string> = {
    success: 'bg-success-light text-green-800 border-green-200',
    warning: 'bg-warning-light text-yellow-800 border-yellow-200',
    danger: 'bg-destructive-light text-red-800 border-red-200',
    info: 'bg-primary-light text-blue-800 border-blue-200',
    default: 'bg-muted text-foreground border-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
