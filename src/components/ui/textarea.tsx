/**
 * Textarea UI Component - B28 Phase 3
 */

import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({
  className = '',
  error = false,
  ...props
}, ref) => {
  return (
    <textarea
      ref={ref}
      className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical ${
        error
          ? 'border-red-300 focus:border-red-500'
          : 'border-gray-300 focus:border-blue-500'
      } ${className}`}
      {...props}
    />
  );
});

Textarea.displayName = 'Textarea';