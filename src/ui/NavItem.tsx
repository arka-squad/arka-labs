
import React from 'react';


export type NavItemProps = {
  active?: boolean;
  label: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const NavItem: React.FC<NavItemProps> = ({ active, label, className = '', ...props }) => (
  <button
    {...props}
    className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arka-bg)] ${active ? 'text-white shadow' : 'hover:opacity-90'} ${className}`}
    style={active ? { background: 'var(--arka-grad-cta)' } : { backgroundColor: 'var(--arka-card)' }}

  >
    {label}
  </button>
);
