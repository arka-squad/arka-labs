import { TRACE_HEADER, generateTraceId } from './trace';

export async function apiFetch(input: RequestInfo, init: RequestInit = {}) {
  const url = typeof input === 'string' ? input : input.toString();
  const headers = new Headers(init.headers || {});
  if (url.startsWith('/api/')) {
    // Ne pas ajouter Authorization header - nous utilisons les cookies HTTPOnly maintenant
    // const token = getToken();
    // if (token) headers.set('Authorization', `Bearer ${token}`);
    if (!headers.has(TRACE_HEADER)) headers.set(TRACE_HEADER, generateTraceId());
  }
  // Toujours inclure les cookies pour l'authentification
  const res = await fetch(input, { 
    ...init, 
    headers,
    credentials: 'include' // Important: toujours inclure les cookies
  });
  if (url.startsWith('/api/') && res.status === 401 && typeof window !== 'undefined') {
    showToast('Session expirée');
    window.location.href = '/login';
  }
  return res;
}

function getToken(): string | null {
  if (typeof document !== 'undefined') {
    const m = document.cookie.match(/\b(arka_access_token|arka_auth)=([^;]+)/);
    if (m) return decodeURIComponent(m[2]);
  }
  try {
    return (
      localStorage.getItem('RBAC_TOKEN') ||
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      null
    );
  } catch {
    return null;
  }
}

function showToast(msg: string) {
  if (typeof document === 'undefined') return;
  const div = document.createElement('div');
  div.textContent = msg;
  div.className = 'fixed bottom-4 right-4 rounded bg-black px-4 py-2 text-white';
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}

