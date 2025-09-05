import React, { useEffect, useState } from "react";
import { Sun, Moon, Settings, Upload, FileText, CheckCircle2, XCircle, PlusCircle } from "lucide-react";

/**
 * Arka — Console (Preview marketing R1)
 * - Header: logo + "Console"
 * - Navigation fonctionnelle (onglets)
 * - Dashboard enrichi (squad digital KPIs)
 * - Documents: Dropzone (drag & drop + input fichier)
 * - Prompt Builder: démo avec bloc PMO wake-up pré-rempli
 * - Observabilité: SLO + barres de progression
 */

const GRADIENT = "linear-gradient(135deg, #FAB652 0%, #F25636 50%, #E0026D 100%)";

const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl border border-slate-700/60 shadow-sm ${className}`}
    style={{ backgroundColor: "#151F27" }}
  >
    {children}
  </div>
);

const KpiCard = ({ label, value, unit = "", bg }) => (
  <div className="rounded-2xl p-5 text-white" style={{ background: bg }}>
    <div className="text-xs opacity-90">{label}</div>
    <div className="mt-1 text-3xl font-bold">
      {value}
      {unit && <span className="text-base font-medium"> {unit}</span>}
    </div>
  </div>
);

const ProgressRow = ({ label, value }) => (
  <div>
    <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
      <span>{label}</span>
      <span className="font-semibold text-white">{value}%</span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
      <div className="h-full" style={{ width: `${value}%`, background: GRADIENT }} />
    </div>
  </div>
);

function useTheme() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap";
    document.head.appendChild(link);
    return () => {
      try { document.head.removeChild(link); } catch { /* no-op */ }
    };
  }, []);
  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark"); else root.classList.remove("dark");
  }, [dark]);
  return { dark, setDark };
}

export default function ArkaConsolePreview() {
  const { dark, setDark } = useTheme();
  const [tab, setTab] = useState("dashboard");

  // Projets (démo)
  const projects = ["Nova", "Orion", "Atlas"];
  const [project, setProject] = useState(projects[0]);

  // Documents
  const [docs, setDocs] = useState([
    { id: 1, name: "Plan Directeur — Arka R1.pdf", size: "1.2 Mo" },
    { id: 2, name: "Spécifications Fonctionnelles — R1.docx", size: "680 Ko" },
  ]);
  const [dragOver, setDragOver] = useState(false);
  const onDropFiles = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer?.files || e.target?.files;
    if (!files?.length) return;
    const added = Array.from(files).map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      size: `${Math.max(1, Math.round(f.size / 1024))} Ko`,
    }));
    setDocs((d) => [...added, ...d]);
  };

  // Prompt builder (démo)
  const [builder, setBuilder] = useState({
    wakeup:
      "Tu es PMO d'une squad digitale (AGO • QA • ARC • PMO • DEV). Objectif: réveil d'équipe et plan d'action hebdo. 1/ Statut livraison (scope livré/commit). 2/ Risques & blocages (owners, due dates). 3/ KPIs clés: Lead time, Deploy freq, CFR, MTTR. 4/ Priorités semaine (3 max). 5/ Décisions à arbitrer (qui, quand). Format: sections claires + bullets + TODOs actionnables.",
    cadre: "Contexte projet, contraintes, SLA, dépendances…",
    sources: "Repos Git/CI, Sonar, Sentry, Jira (JQL), Backstage/ADR…",
    regles: "Ton debrief = concis, mesurable, daté; pas de jargon inutile; propose 2 options si blocage.",
  });

  return (
    <div className="min-h-screen text-slate-100 antialiased" style={{ background: "#0C1319", fontFamily: "Poppins, sans-serif" }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b backdrop-blur" style={{ borderColor: "#151F27", background: "#0C1319CC" }}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img src="https://arka-liard.vercel.app/assets/logo/arka-logo-blanc.svg" alt="Arka logo" className="h-9 w-auto" />
            <h1 className="text-lg font-bold">Console</h1>
          </div>
          <div className="flex items-center gap-2">
            <select aria-label="Projet actif" value={project} onChange={(e) => setProject(e.target.value)} className="rounded-xl border px-3 py-2 text-sm" style={{ background: "#151F27", borderColor: "#1F2A33" }}>
              {projects.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
            <button onClick={() => setDark(!dark)} className="rounded-xl border p-2" style={{ background: "#151F27", borderColor: "#1F2A33" }} aria-label="Basculer le thème">{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</button>
            <button className="rounded-xl border p-2" style={{ background: "#151F27", borderColor: "#1F2A33" }} aria-label="Paramètres"><Settings className="h-4 w-4" /></button>
          </div>
        </div>
      </header>

      {/* Layout */}
      <main className="mx-auto grid max-w-7xl grid-cols-12 gap-4 px-4 py-6">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3">
          <Card className="p-4">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-white">Navigation</h3>
            <ul className="space-y-2 text-sm">
              {[
                { id: "dashboard", label: "Dashboard" },
                { id: "chat", label: "Chat" },
                { id: "documents", label: "Documents" },
                { id: "prompt", label: "Prompt Builder" },
                { id: "obs", label: "Observabilité" },
              ].map((i) => (
                <li key={i.id}>
                  <button
                    onClick={() => setTab(i.id)}
                    aria-current={tab === i.id ? "page" : undefined}
                    className={`w-full rounded-xl px-3 py-2 text-left outline-none ring-2 ring-transparent ${tab === i.id ? "text-white shadow" : ""}`}
                    style={tab === i.id ? { background: GRADIENT, border: "1px solid transparent" } : { background: "#151F27", border: "1px solid #1F2A33", color: "#E5E7EB" }}
                  >
                    {i.label}
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          {/* Bloc additionnel sous le menu */}
          <Card className="mt-4 p-4">
            <h3 className="text-sm font-bold uppercase tracking-wide">Quick stats</h3>
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between"><span>Commits (7j)</span><span className="font-semibold text-white">134</span></div>
              <div className="flex items-center justify-between"><span>Déploiements</span><span className="font-semibold text-white">12</span></div>
              <div className="flex items-center justify-between"><span>Incidents ouverts</span><span className="font-semibold text-white">2</span></div>
            </div>
          </Card>
        </aside>

        {/* Main content */}
        <section className="col-span-12 md:col-span-9">
          {/* Dashboard */}
          {tab === "dashboard" && (
            <div className="space-y-4">
              <Card className="p-5">
                <h2 className="text-lg font-semibold">Dashboard — KPIs Squad Digital · Projet: {project}</h2>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
                  <KpiCard label="Lead Time (p90)" value={3.4} unit="j" bg="linear-gradient(135deg,#FAB652 0%, #F25636 60%)" />
                  <KpiCard label="Deployment Freq." value={12} unit="/sem." bg="linear-gradient(135deg,#F25636 0%, #E0026D 100%)" />
                  <KpiCard label="CFR" value={8} unit="%" bg="linear-gradient(135deg,#E0026D 0%, #E0026D 100%)" />
                  <KpiCard label="MTTR P1" value={2.5} unit="h" bg="linear-gradient(135deg,#FAB652 0%, #E0026D 100%)" />
                </div>
              </Card>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card className="p-5">
                  <h3 className="text-sm font-bold uppercase tracking-wide">Activité récente</h3>
                  <ul className="mt-3 space-y-2 text-sm text-slate-300">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" />Déploiement prod service Auth · succès</li>
                    <li className="flex items-center gap-2"><XCircle className="h-4 w-4 text-pink-400" />Rollback service Billing (bug CI)</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" />ADR #42 validée · SLA OK</li>
                  </ul>
                </Card>
                <Card className="p-5">
                  <h3 className="text-sm font-bold uppercase tracking-wide">Lots actifs</h3>
                  <div className="mt-3 space-y-3">
                    <ProgressRow label="Release R1.M3" value={78} />
                    <ProgressRow label="Squad Persona" value={41} />
                    <ProgressRow label="Tests E2E" value={92} />
                  </div>
                </Card>
              </div>

              <Card className="p-5">
                <h3 className="text-sm font-bold uppercase tracking-wide">KPIs QA / DEV</h3>
                <div className="mt-3 overflow-hidden rounded-xl border" style={{ borderColor: "#1F2A33", background: "#0C1319" }}>
                  <div className="grid grid-cols-12 border-b px-3 py-2 text-xs font-semibold" style={{ borderColor: "#1F2A33", background: "#151F27" }}>
                    <div className="col-span-6">KPI</div>
                    <div className="col-span-3">Valeur</div>
                    <div className="col-span-3">Seuil</div>
                  </div>
                  {[
                    { kpi: "Cycle Time PR (p90)", val: "2.1 j", seuil: "< 3 j" },
                    { kpi: "Pass rate CI/E2E (main)", val: "96%", seuil: "≥ 95%" },
                    { kpi: "Coverage new code", val: "72%", seuil: "≥ 70%" },
                    { kpi: "Escape Rate (prod)", val: "12%", seuil: "≤ 20%" },
                    { kpi: "Quality Gate OK (jours)", val: "6/7", seuil: "≥ 6/7" },
                    { kpi: "PR ouvertes (>48h)", val: "4", seuil: "≤ 5" },
                    { kpi: "WIP aging > SLA", val: "14%", seuil: "≤ 20%" },
                    { kpi: "Prédictibilité (scope livré/commit)", val: "92%", seuil: "≥ 85%" },
                    { kpi: "MTTR P2 (p50)", val: "10 h", seuil: "< 24 h" },
                    { kpi: "Deployment Frequency (services actifs)", val: "12/sem.", seuil: ">= 2/sem./svc" },
                  ].map((row, i) => (
                    <div key={i} className="grid grid-cols-12 border-t px-3 py-2 text-sm" style={{ borderColor: "#1F2A33" }}>
                      <div className="col-span-6 text-slate-300">{row.kpi}</div>
                      <div className="col-span-3 font-semibold text-white">{row.val}</div>
                      <div className="col-span-3 text-slate-300">{row.seuil}</div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* Chat (placeholder marketing) */}
          {tab === "chat" && (
            <Card className="p-5">
              <h2 className="text-lg font-semibold">Chat</h2>
              <p className="mt-2 text-sm text-slate-300">Demo marketing : conversations multi‑agents, SSE et mémoire courte. (Visuel non connecté)</p>
            </Card>
          )}

          {/* Documents */}
          {tab === "documents" && (
            <div className="space-y-4">
              <Card className="p-5">
                <h2 className="text-lg font-semibold">Documents · Projet: {project}</h2>
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDropFiles}
                  className={`mt-3 grid place-items-center rounded-2xl border-2 border-dashed p-10 text-center ${dragOver ? "border-pink-500 bg-pink-500/10" : ""}`}
                  style={{ borderColor: dragOver ? "#E0026D" : "#1F2A33", background: "#0C1319" }}
                >
                  <Upload className="h-6 w-6 opacity-80" />
                  <p className="mt-2 text-sm text-slate-300">Glisser‑déposer vos fichiers ici ou</p>
                  <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white" style={{ background: GRADIENT }}>
                    <FileText className="h-4 w-4" />
                    <span>Choisir des fichiers</span>
                    <input type="file" className="hidden" multiple onChange={onDropFiles} />
                  </label>
                </div>
                <ul className="mt-4 space-y-2 text-sm">
                  {docs.map((d) => (
                    <li key={d.id} className="flex items-center justify-between rounded-xl border px-3 py-2" style={{ borderColor: "#1F2A33", background: "#0C1319" }}>
                      <span className="text-slate-300">{d.name}</span>
                      <span className="text-slate-400">{d.size}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {/* Prompt Builder */}
          {tab === "prompt" && (
            <Card className="p-5">
              <h2 className="text-lg font-semibold">Prompt Builder — PMO Wake‑up</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {Object.entries(builder).map(([key, val]) => (
                  <label key={key} className="block text-sm">
                    <span className="mb-1 block font-semibold capitalize text-slate-200">{key}</span>
                    <textarea
                      value={val}
                      onChange={(e) => setBuilder((s) => ({ ...s, [key]: e.target.value }))}
                      rows={6}
                      className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                      style={{ background: "#151F27", borderColor: "#1F2A33" }}
                    />
                  </label>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <button className="rounded-xl px-4 py-2 text-sm font-semibold text-white" style={{ background: GRADIENT }}>
                  Générer le prompt
                </button>
                <button className="rounded-xl border px-4 py-2 text-sm font-semibold text-white" style={{ background: "#0C1319", borderColor: "#1F2A33" }}>
                  Enregistrer
                </button>
              </div>
            </Card>
          )}

          {/* Observabilité */}
          {tab === "obs" && (
            <div className="space-y-4">
              <Card className="p-5">
                <h2 className="text-lg font-semibold">Observabilité — Squad Digital · Projet: {project}</h2>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <KpiCard label="Success rate" value={99.6} unit="%" bg="linear-gradient(135deg,#FAB652 0%, #F25636 60%)" />
                  <KpiCard label="Latence p95 (chat)" value={3.2} unit="s" bg="linear-gradient(135deg,#F25636 0%, #E0026D 100%)" />
                  <KpiCard label="Trace complétude" value={99} unit="%" bg="linear-gradient(135deg,#E0026D 0%, #E0026D 100%)" />
                </div>
              </Card>
              <Card className="p-5">
                <h3 className="text-sm font-bold uppercase tracking-wide">SLOs critiques</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <ProgressRow label="Disponibilité IA" value={99} />
                  <ProgressRow label="Fraîcheur données" value={97} />
                  <ProgressRow label="Uptime connecteurs" value={99} />
                  <ProgressRow label="Drift embeddings" value={95} />
                </div>
              </Card>
            </div>
          )}
        </section>
      </main>

      <footer className="mx-auto max-w-7xl px-4 pb-8 text-center text-xs text-slate-500">
        Démo UI — Arka R1 · Palette #151F27 / #0C1319 + gradient CTA (#FAB652 → #F25636 → #E0026D) · WCAG AA
      </footer>
    </div>
  );
}
