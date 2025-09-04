'use client';

import { useEffect, useState } from 'react';

type Role = 'viewer' | 'editor' | 'admin' | 'owner' | 'operator';

function b64urlToString(b64url: string): string {
  const pad = '='.repeat((4 - (b64url.length % 4)) % 4);
  const b64 = (b64url + pad).replace(/-/g, '+').replace(/_/g, '/');
  if (typeof atob === 'function') {
    try {
      return decodeURIComponent(
        Array.prototype.map
          .call(atob(b64), (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } catch {
      return '';
    }
  }
  try {
    // Node fallback si dispo
    // @ts-ignore
    return Buffer.from(b64, 'base64').toString('utf8');
  } catch {
    return '';
  }
}

function decodeRoleFromJWT(token: string | null): Role | null {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = b64urlToString(parts[1]);
    const json = JSON.parse(payload || '{}');
    const r: string | undefined = json.role || json.rbac || json.claims?.role;
    if (!r) return null;
    const v = String(r).toLowerCase();
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
      let tok: string | null = null;
      if (typeof document !== 'undefined') {
        const m = document.cookie.match(/\b(arka_auth|arka_access_token)=([^;]+)/);
        if (m) tok = decodeURIComponent(m[2]);
      }
      if (!tok && typeof localStorage !== 'undefined') {
        tok = localStorage.getItem('RBAC_TOKEN') || localStorage.getItem('access_token');
      }
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
