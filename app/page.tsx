'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import { uiLog } from '../lib/ui-log';

export default function LandingPage() {
  const router = useRouter();
  useEffect(() => {
    uiLog('mount');
  }, []);
  return (
    <main className="mx-auto max-w-3xl p-6 text-white">
      <section className="text-center">
        <h1 className="mb-4 text-3xl font-bold">Arka Labs</h1>
        <p className="mb-6 text-slate-300">Accélérez vos workflows IA.</p>
        <button
          onClick={() => {
            uiLog('cta_click', { cta: 'open_console' });
            router.push('/login');
          }}
          className="rounded-xl bg-gradient-to-r from-[#FAB652] via-[#F25636] to-[#E0026D] px-6 py-3 font-medium text-white"
        >
          Ouvrir la console
        </button>
      </section>
      <section className="mt-16 grid gap-8 sm:grid-cols-3">
        <div className="space-y-2">
          <Image src="/placeholder.svg" alt="Rapide" width={80} height={80} loading="lazy" />
          <h2 className="font-semibold">Rapide</h2>
          <p className="text-sm text-slate-300">Des performances optimisées.</p>
        </div>
        <div className="space-y-2">
          <Image src="/placeholder.svg" alt="Sécurisé" width={80} height={80} loading="lazy" />
          <h2 className="font-semibold">Sécurisé</h2>
          <p className="text-sm text-slate-300">RBAC intégré.</p>
        </div>
        <div className="space-y-2">
          <Image src="/placeholder.svg" alt="Extensible" width={80} height={80} loading="lazy" />
          <h2 className="font-semibold">Extensible</h2>
          <p className="text-sm text-slate-300">Composants réutilisables.</p>
        </div>
      </section>
    </main>
  );
}
