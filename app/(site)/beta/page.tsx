'use client';

/* eslint-disable @next/next/no-img-element */
import React from 'react';

function StickyCTA() {
  const [show, setShow] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center">
      <a
        href="#form"
        className="rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg"
        style={{ background: 'var(--site-grad)' }}
        data-codex-id="cta_apply_sticky"
      >
        Candidater à la bêta
      </a>
    </div>
  );
}

export default function BetaPage() {
  return (
    <main className="min-h-screen">
      {/* Topbar minimal conforme Codex */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4" role="banner" aria-label="En-tête">
        <a href="/" data-codex-id="topbar_logo" className="text-2xl font-extrabold lowercase tracking-tight text-white">arka</a>
        <nav className="hidden items-center gap-6 md:flex" role="navigation" aria-label="Navigation principale">
          <a href="/#features" data-codex-id="link_fonctionnalites" className="text-sm text-slate-300 hover:text-white">Fonctionnalités</a>
          <a href="/beta" data-codex-id="link_beta" aria-current="page" className="text-sm text-white">Inscription à la bêta</a>
          <a href="/#pricing" data-codex-id="link_tarification" className="text-sm text-slate-300 hover:text-white">Tarification</a>
          <a href="/cockpit" data-codex-id="cta_open_console" className="rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg" style={{ background: 'var(--site-grad)' }}>Ouvrir le cockpit</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 pt-10">
        <h1 className="text-3xl md:text-4xl font-semibold" data-codex-id="hero_title">
          Rejoignez la bêta privée Arka
        </h1>
        <p className="mt-3 max-w-2xl text-slate-300" data-codex-id="hero_subtitle">
          Multipliez la vitesse de vos équipes tout en améliorant la rigueur.
        </p>
        <ul className="mt-4 grid gap-2 text-slate-300">
          <li data-codex-id="hero_b1">Console multi‑agents prête à l’emploi</li>
          <li data-codex-id="hero_b2">Observabilité intégrée (TTFT, RTT, erreurs)</li>
          <li data-codex-id="hero_b3">Flux outillés pour livrer sans improvisation</li>
        </ul>
        <small className="mt-3 block text-slate-400" data-codex-id="hero_micro">Ouverture limitée à 5 équipes sélectionnées.</small>
        <div className="mt-6">
          <a href="#form" data-codex-id="cta_apply_beta" className="rounded-full px-5 py-3 text-sm font-medium text-white shadow-lg" style={{ background: 'var(--site-grad)' }}>Candidater à la bêta</a>
        </div>
      </section>

      {/* Formulaire */}
      <section id="form" className="mx-auto max-w-3xl px-6 py-12">
        <form className="grid gap-4" onSubmit={(e) => { e.preventDefault(); }}>
          {/* Coordonnées */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="field_first_name" className="block text-sm text-slate-300">Prénom</label>
              <input id="field_first_name" data-codex-id="field_first_name" className="mt-1 w-full rounded-md bg-[var(--site-section)] px-3 py-2 ring-1" style={{ borderColor: 'var(--site-border)' }} required />
            </div>
            <div>
              <label htmlFor="field_last_name" className="block text-sm text-slate-300">Nom</label>
              <input id="field_last_name" data-codex-id="field_last_name" className="mt-1 w-full rounded-md bg-[var(--site-section)] px-3 py-2 ring-1" style={{ borderColor: 'var(--site-border)' }} required />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="field_email" className="block text-sm text-slate-300">Email</label>
              <input type="email" id="field_email" data-codex-id="field_email" aria-describedby="err_email" className="mt-1 w-full rounded-md bg-[var(--site-section)] px-3 py-2 ring-1" style={{ borderColor: 'var(--site-border)' }} required />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="field_org" className="block text-sm text-slate-300">Organisation</label>
              <input id="field_org" data-codex-id="field_org" className="mt-1 w-full rounded-md bg-[var(--site-section)] px-3 py-2 ring-1" style={{ borderColor: 'var(--site-border)' }} />
            </div>
          </div>

          {/* Projet */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="field_role" className="block text-sm text-slate-300">Rôle</label>
              <input id="field_role" data-codex-id="field_role" className="mt-1 w-full rounded-md bg-[var(--site-section)] px-3 py-2 ring-1" style={{ borderColor: 'var(--site-border)' }} />
            </div>
            <div>
              <label htmlFor="field_timezone" className="block text-sm text-slate-300">Fuseau horaire</label>
              <input id="field_timezone" data-codex-id="field_timezone" className="mt-1 w-full rounded-md bg-[var(--site-section)] px-3 py-2 ring-1" style={{ borderColor: 'var(--site-border)' }} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="field_problem" className="block text-sm text-slate-300">Problème principal</label>
              <textarea id="field_problem" data-codex-id="field_problem" className="mt-1 w-full rounded-md bg-[var(--site-section)] px-3 py-2 ring-1" style={{ borderColor: 'var(--site-border)' }} rows={3} />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="field_deliverable" className="block text-sm text-slate-300">Livrable attendu</label>
              <input id="field_deliverable" data-codex-id="field_deliverable" className="mt-1 w-full rounded-md bg-[var(--site-section)] px-3 py-2 ring-1" style={{ borderColor: 'var(--site-border)' }} />
            </div>
            <div>
              <label htmlFor="field_stack" className="block text-sm text-slate-300">Stack technique</label>
              <input id="field_stack" data-codex-id="field_stack" className="mt-1 w-full rounded-md bg-[var(--site-section)] px-3 py-2 ring-1" style={{ borderColor: 'var(--site-border)' }} />
            </div>
            <div>
              <label htmlFor="field_data_type" className="block text-sm text-slate-300">Type de données</label>
              <input id="field_data_type" data-codex-id="field_data_type" className="mt-1 w-full rounded-md bg-[var(--site-section)] px-3 py-2 ring-1" style={{ borderColor: 'var(--site-border)' }} />
            </div>
            <div>
              <label htmlFor="field_team_size" className="block text-sm text-slate-300">Taille d’équipe</label>
              <input id="field_team_size" data-codex-id="field_team_size" className="mt-1 w-full rounded-md bg-[var(--site-section)] px-3 py-2 ring-1" style={{ borderColor: 'var(--site-border)' }} />
            </div>
            <div>
              <label htmlFor="field_urgency" className="block text-sm text-slate-300">Urgence</label>
              <input id="field_urgency" data-codex-id="field_urgency" className="mt-1 w-full rounded-md bg-[var(--site-section)] px-3 py-2 ring-1" style={{ borderColor: 'var(--site-border)' }} />
            </div>
          </div>

          {/* Engagements */}
          <fieldset className="mt-4 grid gap-2">
            <legend className="text-sm text-slate-300">Engagements</legend>
            <label className="flex items-center gap-2">
              <input type="checkbox" id="field_referent_ok" data-codex-id="field_referent_ok" required aria-describedby="err_checkbox" />
              <span>Désigner un référent</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" id="field_kpi_ok" data-codex-id="field_kpi_ok" required aria-describedby="err_checkbox" />
              <span>Suivre des KPIs</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" id="field_privacy_ok" data-codex-id="field_privacy_ok" required aria-describedby="err_checkbox" />
              <span>Respecter la confidentialité</span>
            </label>
          </fieldset>

          {/* Zone d’état / erreurs (A11y) */}
          <div aria-live="polite" className="sr-only">
            <span id="state_sending" data-codex-id="state_sending">Envoi en cours…</span>
            <span id="state_sent" data-codex-id="state_sent">Candidature envoyée.</span>
            <span id="err_required" data-codex-id="err_required">Champ requis</span>
            <span id="err_email" data-codex-id="err_email">Format d’email invalide</span>
            <span id="err_checkbox" data-codex-id="err_checkbox">Merci de cocher les engagements nécessaires</span>
          </div>

          <button type="submit" data-codex-id="submit_apply" className="mt-2 rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg" style={{ background: 'var(--site-grad)' }}>
            Envoyer ma candidature
          </button>
        </form>
      </section>

      <StickyCTA />
    </main>
  );
}

