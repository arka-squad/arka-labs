/**
 * Button UI Component - B28 Phase 3
 */

import { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const variants = {
    default: 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
    primary: 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-600 border-gray-600 text-white hover:bg-gray-700',
    danger: 'bg-red-600 border-red-600 text-white hover:bg-red-700',
    outline: 'bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50',
    ghost: 'bg-transparent border-transparent text-gray-700 hover:bg-gray-100'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`inline-flex items-center border rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}