import React from 'react';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }>(({ className = '', label, error, ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-text">{label}</label>}
      <input
        ref={ref}
        className={`px-4 py-2.5 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 transition-shadow ${error ? 'border-danger focus:ring-danger' : 'border-slate-200'} ${className}`}
        {...props}
      />
      {error && <span className="text-sm text-danger">{error}</span>}
    </div>
  );
});
Input.displayName = 'Input';
