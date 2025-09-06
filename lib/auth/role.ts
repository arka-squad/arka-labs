// lib/auth/role.ts — client-side role helper (JWT → viewer|operator|owner)
export type UIRole = 'viewer' | 'operator' | 'owner';

function b64urlToString(b64url: string): string {
  try {
    const pad = '='.repeat((4 - (b64url.length % 4)) % 4);
    const b64 = (b64url + pad).replace(/-/g, '+').replace(/_/g, '/');
    if (typeof atob === 'function') {
      const str = atob(b64);
      // decodeURIComponent for unicode safety
      return decodeURIComponent(
        Array.prototype.map
          .call(str, (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    }
  } catch {}
  return '';
}

export function getCurrentRole(): UIRole {
  try {
    const tok = (typeof localStorage !== 'undefined')
      ? (localStorage.getItem('jwt') || localStorage.getItem('RBAC_TOKEN') || localStorage.getItem('access_token'))
      : null;
    if (tok) {
      const parts = tok.split('.');
      if (parts.length >= 2) {
        const payload = b64urlToString(parts[1]);
        const json = JSON.parse(payload || '{}');
        const raw = String(json.role || json.rbac || json.claims?.role || '').toLowerCase();
        if (raw === 'owner' || raw === 'admin') return 'owner';
        if (raw === 'operator' || raw === 'editor') return 'operator';
      }
    }
  } catch {}
  return 'viewer';
}

