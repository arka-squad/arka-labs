"use client";

type Proof = {
  ref: string;
  issued_at_iso: string;
  actions: string[];
  results: string[];
  version_ref?: string;
  digest: { algo: 'sha256'; value: string };
  status: 'VALIDATED' | 'RISK' | 'DRAFT';
  issuer?: string;
  signature?: { type: 'ed25519' | 'rsa'; signer: string; valid: boolean } | null;
};

type EvidenceProps = {
  proof: Proof;
  onCopyDigest?: (value: string) => void;
};

function formatLocalDate(iso: string): string | null {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day}\u202F${hh}:${mm}`; // YYYY‑MM‑DD HH:mm
  } catch {
    return null;
  }
}

function isSha256Hex(v: string): boolean {
  return /^[a-fA-F0-9]{64}$/.test(v);
}

function EvidenceCard({ proof, onCopyDigest }: EvidenceProps) {
  const issued = formatLocalDate(proof.issued_at_iso);
  const digestOk = proof.digest?.algo === 'sha256' && isSha256Hex(proof.digest?.value || '');

  async function doCopy() {
    if (!digestOk) return;
    const text = `sha256: ${proof.digest.value}`;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      onCopyDigest?.(proof.digest.value);
      const el = document.getElementById('copy-feedback');
      if (el) {
        el.textContent = 'Copié';
        setTimeout(() => {
          el.textContent = '';
        }, 1200);
      }
    } catch {}
  }

  const statusBadge = (s: Proof['status']) => {
    if (s === 'VALIDATED') {
      return (
        <div className="bg-gradient-to-tr from-[#FAB652] via-[#F25636] to-[#E0026D] text-white inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
          Validé
        </div>
      );
    }
    if (s === 'RISK') {
      return (
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm text-amber-700 bg-amber-500/10 ring-1 ring-amber-500/20">
          À risque
        </div>
      );
    }
    return (
      <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm text-slate-700 bg-slate-500/10 ring-1 ring-slate-500/20">
        Brouillon
      </div>
    );
  };

  return (
    <article className="lg:col-span-6 relative card evidence-card p-6 overflow-hidden shadow-[0_20px_50px_rgba(15,23,42,.12)]" aria-label="Preuve d’exécution">
      <header className="relative flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-[#FAB652] via-[#F25636] to-[#E0026D] text-white inline-flex h-9 w-9 items-center justify-center rounded-full" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>
          </div>
          <div className="font-semibold text-slate-900">Preuve d’exécution</div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 text-emerald-700 ring-1 ring-emerald-600/20 px-3 py-1 text-sm">OFFICIEL</span>
      </header>

      <div className="relative mt-4 grid gap-2 text-slate-800 text-[15px]">
        <div>
          <span className="font-medium">Réf.</span> : {proof.ref}
          {issued && (<>
            {' '}• <span className="font-medium">Émis le</span> : {issued}
          </>)}
        </div>
        {proof.actions?.length > 0 && (
          <div><span className="font-medium">Actions</span> : {proof.actions.join(' · ')}</div>
        )}
        {proof.results?.length > 0 && (
          <div><span className="font-medium">Résultats</span> : {proof.results.join(' · ')}</div>
        )}
        <div className="font-mono text-sm text-slate-600">
          <span className="font-medium not-italic">Empreinte</span> : {digestOk ? (
            <>
              sha256: {proof.digest.value}
              <button onClick={doCopy} className="ml-2 text-xs underline decoration-dotted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded" aria-label="Copier l’empreinte">Copier</button>
              <span id="copy-feedback" className="ml-2 text-xs" aria-live="polite" />
            </>
          ) : (
            <span className="italic text-slate-500">Empreinte indisponible</span>
          )}
        </div>
      </div>

      <footer className="relative mt-6 flex items-center justify-between border-t border-slate-200 pt-3">
        <div className="text-xs text-slate-500">Document signé • Intégrité vérifiée</div>
        {statusBadge(proof.status)}
      </footer>

      <div aria-hidden className="pointer-events-none absolute -right-10 -bottom-6 rotate-[-15deg] text-[72px] font-black text-slate-900/5 select-none">ARKA</div>
    </article>
  );
}

export default function SectionPreuve() {
  const demo: Proof = {
    ref: 'cockpit@0.1.0-demo',
    issued_at_iso: new Date().toISOString(),
    actions: ['/kit onboarding', '/assign Proc-23'],
    results: ['OK', 'À faire', 'Décision validée'],
    digest: { algo: 'sha256', value: '9f8c1a0b9e4d3c2f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f' },
    status: 'VALIDATED',
    issuer: 'Arka Cockpit',
  };

  return (
    <section id="evidence" aria-labelledby="evidence-title" className="py-16">
      <div className="container grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Colonne gauche : texte */}
        <div className="lg:col-span-6">
          <h2 id="evidence-title" className="text-3xl md:text-4xl font-semibold text-[#0F172A]">C’est quoi une “preuve” ?</h2>
          <p className="mt-3 text-[#334155] max-w-2xl">Une preuve, c’est un petit dossier qui résume ce qui a été fait et validé — concret, pas techno.</p>

          {/* Liste graphique avec pictos brand */}
          <ul className="mt-4 grid gap-3 text-[#334155]">
            <li className="flex items-start gap-3">
              <span aria-hidden className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white bg-gradient-to-tr from-[#FAB652] via-[#F25636] to-[#E0026D] ring-1 ring-black/5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              </span>
              <span>Les actions clés (qui, quoi, quand).</span>
            </li>
            <li className="flex items-start gap-3">
              <span aria-hidden className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white bg-gradient-to-tr from-[#FAB652] via-[#F25636] to-[#E0026D] ring-1 ring-black/5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 6L9 17l-5-5"/></svg>
              </span>
              <span>Les résultats (OK / À risque, décisions).</span>
            </li>
            <li className="flex items-start gap-3">
              <span aria-hidden className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white bg-gradient-to-tr from-[#FAB652] via-[#F25636] to-[#E0026D] ring-1 ring-black/5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>
              </span>
              <span>La version livrée (référence horodatée).</span>
            </li>
            <li className="flex items-start gap-3">
              <span aria-hidden className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white bg-gradient-to-tr from-[#FAB652] via-[#F25636] to-[#E0026D] ring-1 ring-black/5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 12a3 3 0 0 1 3 3c0 2.5 1 4 1 4"/><path d="M9 12a6 6 0 0 1 6 6"/><path d="M7 12a8 8 0 0 1 8 8"/><path d="M12 12V8"/><path d="M12 2a10 10 0 0 0-7 17"/></svg>
              </span>
              <span>Une empreinte numérique pour garantir l’intégrité.</span>
            </li>
          </ul>

          <p className="mt-3 text-[#334155] max-w-2xl">Lisible et rejouable. Utile pour un client, un audit, un dossier de subvention… Ou simplement pour garder la mémoire claire.</p>
        </div>

        {/* Colonne droite : carte */}
        <div className="lg:col-span-6">
          <EvidenceCard proof={demo} />
        </div>
      </div>
    </section>
  );
}

