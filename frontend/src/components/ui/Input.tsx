import React from 'react';
import { AlertCircle } from 'lucide-react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; icon?: React.ReactNode; rightIcon?: React.ReactNode }>(({ className = '', label, error, icon, rightIcon, ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className={`text-sm font-semibold ${error ? 'text-red-500' : 'text-foreground'}`}>{label}</label>}
      <div className="relative flex items-center">
        {icon && (
          <div className={`absolute left-3 flex items-center justify-center pointer-events-none ${error ? 'text-red-500' : 'text-muted-foreground'}`}>
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 transition-shadow ${icon ? 'pl-10' : 'px-4'} ${rightIcon ? 'pr-10' : 'pr-4'} ${error ? 'border-red-500 focus:ring-red-500' : 'border-border focus:ring-slate-900'} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className={`absolute right-3 flex items-center justify-center ${error ? 'text-red-500' : 'text-muted-foreground'}`}>
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-0.5 text-red-500">
          <AlertCircle className="w-4 h-4" />
          <span className="text-xs font-medium">{error}</span>
        </div>
      )}
    </div>
  );
});
Input.displayName = 'Input';
