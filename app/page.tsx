'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uiLog } from '../lib/ui-log';
import { useRole } from '../src/role-context';
import { Hero } from '../src/ui/Hero';
import { PillarCard } from '../src/ui/PillarCard';

const pillars = [
  { icon: '⚡', label: 'Efficacité', desc: 'Accélérez vos workflows IA.' },
  { icon: '🛡️', label: 'Sécurité', desc: 'RBAC intégré.' },
  { icon: '📊', label: 'Clarté', desc: 'Des insights consolidés.' },
];

export default function Page() {
  const router = useRouter();
  const { role } = useRole();

  useEffect(() => {
    uiLog('mount', { role });
  }, [role]);

  return (
    <main className="mx-auto max-w-5xl p-6">
      <Hero
        onTry={() => {
          uiLog('cta_click', { cta: 'try', role });
          router.push('/login');
        }}
        onConsole={() => {
          uiLog('cta_click', { cta: 'open_console', role });
          router.push('/login');
        }}
      />
      <section className="mt-16 grid gap-8 sm:grid-cols-3">
        {pillars.map((p) => (
          <PillarCard key={p.label} {...p} />
        ))}
      </section>
    </main>
  );
}

