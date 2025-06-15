import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  children?: ReactNode;
  startIcon?: ReactNode;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  startIcon,
  className,
  ...props
}: ButtonProps) => {  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-amber-400 text-amber-900 hover:bg-amber-500 focus:ring-amber-200 border-0',
    secondary: 'bg-amber-100 text-amber-800 hover:bg-amber-200 focus:ring-amber-200 border-0',
    outline: 'bg-white hover:bg-amber-50 border border-red-500 text-red-600 hover:text-red-700 hover:border-red-600'
  };
  
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {startIcon && <span className="mr-2">{startIcon}</span>}
      {children}
    </button>
  );
};
