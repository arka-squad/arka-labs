/* eslint-disable @next/next/no-img-element */
import { Command, AlertTriangle } from 'lucide-react';

export type EnClairItem = {
  icon: 'Command' | 'AlertTriangle' | string;
  title: string;
  text: string;
};

export type EnClairProps = {
  title?: string;
  subtitle?: string;
  items?: EnClairItem[]; // 2 items
};

const DEFAULT_SUBTITLE =
  "Pas un robot, une équipe coordonnée. Vous gardez la main, ils exécutent et s’améliorent ensemble.";

const DEFAULT_ITEMS: EnClairItem[] = [
  {
    icon: 'Command',
    title: 'Un poste de commande',
    text:
      'Vous donnez la direction. Les agents experts s’organisent entre eux : assignations, validations, corrections.',
  },
  {
    icon: 'AlertTriangle',
    title: 'Retour d’état immédiat',
    text:
      'La squad vous répond : OK ou À risque. Et si besoin, propose déjà une alternative.',
  },
];

function Icon({ name }: { name: string }) {
  if (name === 'Command') return <Command className="w-5 h-5 opacity-80" aria-hidden />;
  if (name === 'AlertTriangle') return <AlertTriangle className="w-5 h-5 opacity-80" aria-hidden />;
  return <span aria-hidden className="w-5 h-5" />;
}

export default function EnClair({ title = 'En clair', subtitle = DEFAULT_SUBTITLE, items = DEFAULT_ITEMS }: EnClairProps) {
  return (
    <section id="what" aria-labelledby="what-title" className="py-16">
      <div className="mx-auto max-w-[1440px] px-6">
        <header className="text-center max-w-3xl mx-auto">
          <h2 id="what-title" className="text-3xl font-semibold" style={{ color: 'var(--site-text)' }}>
            {title}
          </h2>
          <p className="mt-2 mx-auto" style={{ color: 'var(--site-muted)', maxWidth: '60ch' }}>
            {subtitle}
          </p>
        </header>

        <div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {items.slice(0, 2).map((it, idx) => (
            <article
              key={it.title}
              className={`card ${idx === 0 ? 'glow-a' : 'glow-b'} p-6 md:p-8 rounded-[20px] border relative overflow-hidden shadow-[0_12px_24px_rgba(15,23,42,.08)]`}
              style={{ borderColor: 'rgba(0,0,0,.06)', background: 'var(--site-section)' }}
            >
              <div className="grid [grid-template-rows:auto_auto_1fr] gap-3">
                <div className="flex items-center justify-center gap-3 text-center">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-full text-white shadow-[0_6px_16px_rgba(226,2,109,.18)]" style={{ backgroundImage: 'var(--brand-grad)' }} aria-hidden="true">
                    <Icon name={it.icon} />
                  </div>
                  <h3 className="text-xl font-semibold text-center" style={{ color: 'var(--site-text)' }}>
                    {it.title}
                  </h3>
                </div>
                <p className="text-sm md:text-base leading-relaxed text-center" style={{ color: 'var(--site-muted)' }}>
                  {it.text}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
