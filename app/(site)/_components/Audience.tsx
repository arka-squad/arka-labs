/* eslint-disable @next/next/no-img-element */
import { CheckCircle, Briefcase, GraduationCap, Users } from 'lucide-react';

export type AudienceItem = {
  id: string;
  icon?: React.ReactNode;
  title: string;
  points?: string[];
  long?: string;
  glow?: 'A'|'B'|'C'|'D';
};

export type AudienceProps = {
  title?: string;
  subtitle?: string;
  image?: { src: string; alt: string };
  items?: AudienceItem[];
};

const DEFAULT_ITEMS: AudienceItem[] = [
  { id: 'rh', icon: <Users className="w-5 h-5" aria-hidden />, title: 'RH solo et petites équipes', points: ['Décharger le quotidien', 'Sans embaucher'], glow: 'A' },
  { id: 'pme', icon: <Briefcase className="w-5 h-5" aria-hidden />, title: 'PME et directions', points: ['Piloter missions & preuves', 'Décider en confiance'], glow: 'B' },
  { id: 'ecoles', icon: <GraduationCap className="w-5 h-5" aria-hidden />, title: 'Écoles et formations', points: ['Scénarios guidés', '10× plus vite', 'Sans données sensibles'], glow: 'C' },
  { id: 'extensions', icon: <CheckCircle className="w-5 h-5" aria-hidden />, title: 'Extensions', long: 'Compta, Finance, Marketing, Support. La squad s’installe, documente et tient la durée.', glow: 'D' },
];

export default function Audience({ title = 'Pour qui', subtitle = 'Aujourd’hui et demain', image = { src: '/assets/hero/arkabox-board.avif', alt: 'Publics visés par Arka' }, items = DEFAULT_ITEMS }: AudienceProps) {
  return (
    <section id="who" aria-labelledby="who-title" className="py-16">
      <div className="mx-auto max-w-[1440px] px-6">
        <header className="text-center max-w-4xl mx-auto">
          <h2 id="who-title" className="text-3xl md:text-4xl font-semibold" style={{ color: 'var(--site-text)' }}>{title}</h2>
          <p className="mt-2" style={{ color: 'var(--site-muted)' }}>{subtitle}</p>
        </header>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 relative">
            <img src={image.src} alt={image.alt} className="w-full h-auto object-contain" loading="lazy" decoding="async" />
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 blur-3xl opacity-50 [background:radial-gradient(30%_30%_at_30%_60%,#FAB65233,transparent),radial-gradient(30%_30%_at_70%_40%,#E0026D22,transparent)]" />
          </div>

          <div className="lg:col-span-7 grid md:grid-cols-2 gap-6 auto-rows-fr">
            {items.map((item, idx) => (
              <article key={item.id} className={`relative overflow-hidden rounded-[20px] bg-white ring-1 ring-black/5 shadow-[0_12px_30px_rgba(15,23,42,.08)] p-6 ${item.glow ? `cardGlow${item.glow}` : ''}`}>
                <div className="relative">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-white" style={{ backgroundImage: 'var(--brand-grad)' }}>
                      {item.icon ?? <Users className="w-5 h-5" aria-hidden />}
                    </div>
                    <h3 className="text-base font-semibold" style={{ color: 'var(--site-text)' }}>{item.title}</h3>
                  </div>
                  <div className="mt-3 text-sm leading-relaxed" style={{ color: 'var(--site-muted)' }}>
                    {item.points ? (
                      <ul className="list-none space-y-1">
                        {item.points.map((p) => (
                          <li key={p} className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 mt-0.5" aria-hidden />
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>{item.long}</p>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

