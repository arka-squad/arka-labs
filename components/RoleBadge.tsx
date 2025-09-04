'use client';

import { useEffect, useState } from 'react';

type Role = 'viewer' | 'editor' | 'admin' | 'owner' | 'operator';

function decodeRoleFromJWT(token: string | null): Role | null {
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    const json = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    const r: string | undefined = json.role || json.rbac || json.claims?.role;
    if (!r) return null;
    const v = r.toLowerCase();
    if (['viewer', 'editor', 'admin', 'owner', 'operator'].includes(v)) return v as Role;
    return null;
  } catch {
    return null;
  }
}

export default function RoleBadge() {
  const [role, setRole] = useState<Role>('viewer');

  useEffect(() => {
    try {
      const tok =
        (typeof document !== 'undefined' && (document.cookie.match(/\barka_auth=([^;]+)/)?.[1] || null)) ||
        (typeof localStorage !== 'undefined' && (localStorage.getItem('RBAC_TOKEN') || localStorage.getItem('access_token')));
      const decoded = decodeRoleFromJWT(tok);
      if (decoded) setRole(decoded);
    } catch {
      // no-op
    }
  }, []);

  const color = role === 'owner' || role === 'admin' ? 'bg-emerald-600' : role === 'editor' || role === 'operator' ? 'bg-indigo-600' : 'bg-slate-600';

  return (
    <span aria-label="Rôle courant" className={`ml-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${color}`}>
      <span>role</span>
      <strong className="uppercase">{role}</strong>
    </span>
  );
}

