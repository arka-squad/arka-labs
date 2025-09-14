/**
 * Input UI Component - B28 Phase 3
 */

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  error = false,
  ...props
}, ref) => {
  return (
    <input
      ref={ref}
      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error
          ? 'border-red-300 focus:border-red-500'
          : 'border-gray-300 focus:border-blue-500'
      } ${className}`}
      {...props}
    />
  );
});

Input.displayName = 'Input';