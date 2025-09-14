export function getPublicHost(): string {
  // On client, prefer configured host, else current origin
  if (typeof window !== 'undefined') {
    const envHost = process.env.NEXT_PUBLIC_HOST;
    return envHost && envHost.trim().length > 0
      ? envHost
      : window.location.origin;
  }
  // On server/build, use env or canonical apex as fallback
  return process.env.NEXT_PUBLIC_HOST || 'https://arka-squad.app';
}

export function assetUrl(path: string): string {
  const base = getPublicHost().replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

