import { Sparkles } from 'lucide-react';
import React from 'react';

export type ExampleItem = {
  title: string;
  command: string;
  status: 'PASS'|'WARN'|'FAIL'|'A_FAIRE'|'A_RISQUE';
  resultTitle: string;
  resultDesc: string;
};

export type ExamplesProps = {
  title?: string;
  tagline?: string;
  items: ExampleItem[];
};

const STATUS: Record<ExampleItem['status'], {label:string; classes:string}> = {
  PASS: { label: 'OK', classes: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20' },
  WARN: { label: 'Attention', classes: 'bg-amber-500/10 text-amber-700 ring-amber-500/20' },
  FAIL: { label: 'Bloquant', classes: 'bg-rose-500/10 text-rose-700 ring-rose-500/20' },
  A_FAIRE: { label: 'À faire', classes: 'bg-indigo-500/10 text-indigo-700 ring-indigo-500/20' },
  A_RISQUE: { label: 'À risque', classes: 'bg-rose-500/10 text-rose-700 ring-rose-500/20' },
};

function Pill({ status }: { status: ExampleItem['status'] }) {
  const cfg = STATUS[status] ?? STATUS.A_FAIRE;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ring-1 ${cfg.classes}`}>{cfg.label}</span>
  );
}

function ExampleCard({ item, glow }: { item: ExampleItem; glow: string }) {
  return (
    <article
      role="group"
      aria-label={`${item.title} — ${item.command}`}
      className={`example-card ${glow} relative p-6 md:p-8 rounded-[20px] bg-[#e3e0db] ring-1 ring-black/5 shadow-[0_8px_24px_rgba(15,23,42,.06)]`}
    >
      <div className="relative grid md:grid-cols-12 gap-6 items-start">
        <div className="md:col-span-5">
          <h3 className="text-xl font-semibold text-[#0F172A]">{item.title}</h3>
          <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white/80 px-3 py-2 font-mono text-[15px] text-[#0F172A]">
            <Sparkles aria-hidden="true" className="w-4 h-4" />
            {item.command}
          </div>
        </div>
        <div className="md:col-span-7">
          <Pill status={item.status} />
          <span className="ml-2 font-medium text-[#0F172A]">{item.resultTitle}</span>
          <p className="mt-2 text-[#334155]" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {item.resultDesc}
          </p>
        </div>
      </div>
    </article>
  );
}

export default function Examples({ title = 'Exemples', tagline = '1 commande = 1 résultat', items }: ExamplesProps) {
  return (
    <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-white">
      <section id="examples" aria-labelledby="examples-title" className="py-16">
        <div className="mx-auto max-w-[1440px] px-6">
          <header className="text-center max-w-3xl mx-auto">
            <h2 id="examples-title" className="text-3xl md:text-4xl font-semibold text-[#0F172A]">{title}</h2>
            <p className="mt-2 text-sm font-medium text-[#64748B]">{tagline}</p>
          </header>
          <div className="mt-8 grid gap-6">
            {items.map((item, idx) => (
              <ExampleCard key={item.command} item={item} glow={idx === 1 ? 'b-2' : idx === 2 ? 'b-3' : ''} />
            ))}
          </div>
        </div>
      </section>
      <style jsx global>{`
        .example-card::before{content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:radial-gradient(38% 30% at 10% 0%,#FAB65222,transparent 60%),radial-gradient(30% 26% at 95% 100%,#E0026D14,transparent 60%);}
        .example-card.b-2::before{background:radial-gradient(32% 28% at 85% 90%,#F256361a,transparent 60%),radial-gradient(26% 22% at 15% 80%,#FAB6521f,transparent 60%);}
        .example-card.b-3::before{background:radial-gradient(36% 26% at 20% 10%,#FAB65222,transparent 60%),radial-gradient(26% 22% at 80% 85%,#E0026D14,transparent 60%);}
      `}</style>
    </div>
  );
}

