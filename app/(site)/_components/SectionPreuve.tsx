export default function SectionPreuve() {
  return (
    <section aria-labelledby="preuve" className="py-16">
      <div className="mx-auto max-w-[1440px] px-6 grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
        <div className="md:col-span-6">
          <h2 id="preuve" className="text-3xl md:text-4xl font-semibold" style={{ color: '#0F172A' }}>C’est quoi une « preuve »</h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: '#334155' }}>
            Une archive texte qui rassemble vos éléments vérifiables: logs NDJSON, manifeste, checksums `sha256`. Partageable en un clic.
          </p>
          <ul className="mt-4 text-sm space-y-1" style={{ color: '#0F172A' }}>
            <li>— Zéro image requise (texte d’abord)</li>
            <li>— Signatures et empreintes</li>
            <li>— Lisible par un humain, vérifiable par une machine</li>
          </ul>
        </div>
        <div className="md:col-span-6">
          <article className="rounded-[20px] bg-white ring-1 ring-black/5 shadow-[0_12px_30px_rgba(15,23,42,.08)] p-6">
            <h3 className="text-base font-semibold" style={{ color: '#0F172A' }}>Paquet Evidence</h3>
            <p className="mt-2 text-sm" style={{ color: '#334155' }}>evidence.zip
              <br/> ├─ logs/ui_network.json
              <br/> ├─ health.json, kpis.json, runs.json
              <br/> └─ sha256sums.txt
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}

