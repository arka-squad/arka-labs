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
  'Pas un robot, une Ã©quipe coordonnÃ©e. Vous gardez la main, ils exÃ©cutent et sâ€™amÃ©liorent ensemble.';

const DEFAULT_ITEMS: EnClairItem[] = [
  {
    icon: 'Command',
    title: 'Un poste de commande',
    text:
      'Vous donnez la direction. Les agents experts sâ€™organisent entre eux : assignations, validations, corrections.',
  },
  {
    icon: 'AlertTriangle',
    title: 'Retour dâ€™Ã©tat immÃ©diat',
    text:
      'La squad vous rÃ©pond : OK ou Ã€ risque. Et si besoin, propose dÃ©jÃ  une alternative.',
  },
];

function Icon({ name }: { name: string }) {
  if (name === 'Command') return <Command className="w-5 h-5 text-white" aria-hidden />;
  if (name === 'AlertTriangle') return <AlertTriangle className="w-5 h-5 text-white" aria-hidden />;
  return <span aria-hidden className="w-5 h-5" />;
}

export default function EnClair({ title = 'En clair', subtitle = DEFAULT_SUBTITLE, items = DEFAULT_ITEMS }: EnClairProps) {
  return (
    <section id="what" aria-labelledby="what-title" className="py-16">
      <div className="mx-auto max-w-[1440px] px-6">
        <header className="text-center max-w-3xl mx-auto">
          <h2 id="what-title" className="text-3xl md:text-4xl font-semibold text-[var(--site-text)]">
            {title}
          </h2>
          <p className="mt-2 mx-auto max-w-[60ch] text-[var(--site-muted)] text-lg md:text-xl">{subtitle}</p>
        </header>

        <div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {items.slice(0, 2).map((it, idx) => (
            <article
              key={it.title}
              className={`card ${idx === 0 ? 'glow-a' : 'glow-b'} p-8 md:p-12 relative overflow-hidden h-full`}
            >
              <div className="h-full flex flex-col items-center text-center gap-3">
                <div className="flex items-center justify-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full grid place-items-center shadow-sm text-white"
                    aria-hidden="true"
                    style={{ backgroundImage: 'var(--brand-grad)' }}
                  >
                    <Icon name={it.icon} />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold text-[var(--site-text)]">{it.title}</h3>
                </div>
                <p className="text-[var(--site-muted)] leading-relaxed max-w-[58ch]">{it.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

