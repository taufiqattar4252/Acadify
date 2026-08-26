import React from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ 
  className = '', 
  variant = 'primary', 
  fullWidth = false,
  isLoading = false,
  children,
  disabled,
  ...props 
}, ref) => {
  const baseStyles = 'px-5 py-2.5 rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center text-sm shadow-sm';
  const variants = {
    primary: 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-900',
    secondary: 'bg-white border border-border text-muted-foreground hover:bg-muted focus:ring-ring shadow-lumina',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
  };
  
  const widthClass = fullWidth ? 'w-full' : '';
  const isDisabled = disabled || isLoading;

  return (
    <button 
      ref={ref} 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${isDisabled ? 'opacity-70 cursor-not-allowed' : ''} ${className}`} 
      disabled={isDisabled}
      {...props}
    >
      {isLoading && <Spinner size="sm" className="mr-2 border-white border-t-transparent" />}
      {children}
    </button>
  );
});
Button.displayName = 'Button';
