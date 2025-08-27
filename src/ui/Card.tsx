import React from 'react';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className = '', ...props }) => (
  <div
    className={`rounded-2xl border border-[var(--arka-border)] bg-[var(--arka-card)] ${className}`}
    {...props}
  />
);
