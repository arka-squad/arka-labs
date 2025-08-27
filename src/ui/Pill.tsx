import React from 'react';

export const Pill: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ className = '', ...props }) => (
  <span
    className={`inline-flex items-center rounded-full bg-[var(--arka-card)] px-3 py-1 text-xs font-medium ${className}`}
    {...props}
  />
);
