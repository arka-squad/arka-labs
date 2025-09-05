import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_HOST || '';
  const url = (p: string) => (base ? `${base}${p}` : p);
  return [
    { url: url('/') },
    { url: url('/#features') },
    { url: url('/#how') },
    { url: url('/#pricing') },
    { url: url('/#faq') },
    { url: url('/contact') },
    { url: url('/legal/mentions') },
    { url: url('/legal/privacy') },
  ];
}

