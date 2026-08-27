import React from 'react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string; icon?: React.ReactNode; rightIcon?: React.ReactNode }>(({ className = '', label, error, icon, rightIcon, ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-foreground">{label}</label>}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-muted-foreground flex items-center justify-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={`w-full py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow ${icon ? 'pl-10' : 'px-4'} ${rightIcon ? 'pr-10' : 'pr-4'} ${error ? 'border-red-500 focus:ring-red-500' : 'border-border'} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-muted-foreground flex items-center justify-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <span className="text-xs font-medium text-destructive mt-0.5">{error}</span>}
    </div>
  );
});
Input.displayName = 'Input';
