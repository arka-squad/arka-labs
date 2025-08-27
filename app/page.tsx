'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { uiLog } from '../lib/ui-log';
import { useRole } from '../src/role-context';

const features = [
  { key: 'Rapide', text: 'Des performances optimisées.' },
  { key: 'Sécurisé', text: 'RBAC intégré.' },
  { key: 'Extensible', text: 'Composants réutilisables.' },
];

export default function Page() {
  const router = useRouter();
  const { role } = useRole();
  useEffect(() => {
    uiLog('mount', { role });
  }, [role]);
  return (
    <main className="mx-auto max-w-3xl p-6 text-white">
      <section className="text-center">
        <h1 className="mb-4 text-3xl font-bold">Arka Labs</h1>
        <p className="mb-6 text-slate-300">Accélérez vos workflows IA.</p>
        <button
          onClick={() => {
            uiLog('cta_click', { cta: 'open_console', role });
            router.push('/login');
          }}
          className="rounded-xl px-6 py-3 font-medium text-white focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--arka-bg)]"
          style={{ background: 'var(--arka-grad-cta)' }}
        >
          Ouvrir la console
        </button>
      </section>
      <section className="mt-16 grid gap-8 sm:grid-cols-3">
        {features.map(({ key, text }) => (
          <div key={key} className="space-y-2">
            <Image src="/placeholder.svg" alt={key} width={80} height={80} loading="lazy" />
            <h2 className="font-semibold">{key}</h2>
            <p className="text-sm text-slate-300">{text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
