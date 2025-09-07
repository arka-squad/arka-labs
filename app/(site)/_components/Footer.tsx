"use client";

export type FooterLink = { label: string; href: string };
export type FooterProps = {
  links?: FooterLink[];
  showLogo?: boolean;
  year?: number;
  onLinkClick?: (href: string) => void;
};

const DEFAULT_LINKS: FooterLink[] = [
  { label: 'Mentions', href: '/legal/mentions' },
  { label: 'Contact', href: '/contact' },
  { label: 'Statut', href: '/status' },
];

export default function Footer({ links = DEFAULT_LINKS, showLogo = true, year = new Date().getFullYear(), onLinkClick }: FooterProps) {
  return (
    <footer role="contentinfo" className="mt-24 border-t" style={{ borderColor: 'rgba(0,0,0,.10)' }}>
      <div className="mx-auto max-w-[90rem] px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm" style={{ color: 'var(--site-muted-2)' }}>
        <div className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--site-text)' }}>
          {showLogo && (
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--brand-grad)' }}>arka</span>
          )}
        </div>
        <nav aria-label="Liens de bas de page">
          <ul className="flex flex-wrap items-center gap-x-3 gap-y-2">
            {links.map((l, i) => (
              <>
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => onLinkClick?.(l.href)}
                    className="hover:underline underline-offset-4 hover:text-[var(--site-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded"
                  >
                    {l.label}
                  </a>
                </li>
                {i < links.length - 1 && (
                  <li aria-hidden className="text-slate-400">·</li>
                )}
              </>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
