export default function BetaThanksPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16 text-white">
      <h1 className="text-3xl font-semibold" data-codex-id="thanks_title">Merci pour votre candidature</h1>
      <p className="mt-3 text-slate-300" data-codex-id="thanks_text">
        Nous analysons votre demande et revenons vers vous rapidement.
      </p>
      <ul className="mt-6 grid gap-2 text-slate-300">
        <li data-codex-id="thanks_c1">Vous recevrez un email de confirmation.</li>
        <li data-codex-id="thanks_c2">Nous planifierons un court échange si nécessaire.</li>
        <li data-codex-id="thanks_c3">Accès anticipé progressif selon le volume.</li>
      </ul>
      <a href="/vision" data-codex-id="thanks_cta" className="mt-8 inline-block rounded-full px-5 py-3 text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg,#FAB652 0%,#F25636 35%,#E0026D 100%)' }}>
        Découvrir la vision Arka
      </a>
    </main>
  );
}

