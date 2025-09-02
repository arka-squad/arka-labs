import Link from 'next/link';
import React from 'react';

export type NavItemProps = {
  id?: string;
  href: string;
  active?: boolean;
  label: string;
  ['data-codex-id']?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>;

export const NavItem: React.FC<NavItemProps> = ({
  id,
  href,
  active,
  label,
  className = '',
  'data-codex-id': dataCodexId,
  ...props
}) => (
  <Link
    {...props}
    id={id}
    href={href}
    data-codex-id={dataCodexId}
    aria-current={active ? 'page' : undefined}
    className={`w-full rounded-xl px-3 py-2 text-sm font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arka-bg)] ${
      active
        ? 'text-white shadow'
        : 'text-slate-100 hover:bg-slate-800 focus:bg-slate-800 hover:text-white focus:text-white'
    } ${className}`}
    style={active ? { background: 'var(--arka-grad-cta)' } : { backgroundColor: 'var(--arka-card)' }}
  >
    {label}
  </Link>
);
