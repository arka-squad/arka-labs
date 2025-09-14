// lib/auth/role.ts — client-side role helper (JWT → admin|manager|operator|viewer)
export type UIRole = 'admin' | 'manager' | 'operator' | 'viewer';

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
    // Check for B24 auth system tokens first, then legacy tokens
    const tok = (typeof localStorage !== 'undefined')
      ? (localStorage.getItem('arka_token') || localStorage.getItem('jwt') || localStorage.getItem('RBAC_TOKEN') || localStorage.getItem('access_token'))
      : null;
    
    // Also check for user info stored by B24 auth
    const userStr = (typeof localStorage !== 'undefined') ? localStorage.getItem('arka_user') : null;
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role) {
          const role = String(user.role).toLowerCase();
          if (role === 'admin' || role === 'manager' || role === 'operator' || role === 'viewer') {
            return role as UIRole;
          }
        }
      } catch {}
    }
    
    // Fallback to JWT parsing
    if (tok) {
      const parts = tok.split('.');
      if (parts.length >= 2) {
        const payload = b64urlToString(parts[1]);
        const json = JSON.parse(payload || '{}');
        const raw = String(json.role || json.rbac || json.claims?.role || '').toLowerCase();
        
        // Map B24 roles directly without transformation
        if (raw === 'admin') return 'admin';
        if (raw === 'manager') return 'manager';
        if (raw === 'operator') return 'operator';
        if (raw === 'viewer') return 'viewer';
        
        // Legacy mappings for backward compatibility
        if (raw === 'owner') return 'admin';
        if (raw === 'editor') return 'operator';
      }
    }
  } catch {}
  return 'viewer';
}

