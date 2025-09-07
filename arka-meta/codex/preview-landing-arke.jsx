"use client";
import React, { useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  PlayCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Command,
  AlertTriangle,
  FileText,
  Share2,
  MessageSquare,
  Route,
  BookOpen,
  Settings,
  Users,
  Activity,
  HardDrive,
  ClipboardList,
  Briefcase,
  GraduationCap,
  Building2,
} from "lucide-react";

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean; error?: any}> {
  constructor(props: any) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, info: any) { console.error('Preview error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '16px', background: '#fff', border: '1px solid rgba(0,0,0,.1)', borderRadius: 12 }}>
          <h2 style={{ fontWeight: 700, marginBottom: 8 }}>Aperçu indisponible</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 12, opacity: .8 }}>{String(this.state.error)}</pre>
          <p style={{ fontSize: 12, opacity: .7 }}>Le reste de la page continue de se charger.</p>
        </div>
      );
    }
    return this.props.children as any;
  }
}

/**
 * Arka — Landing Preview (light theme)
 * - BG body: #e3e0db (fourni)
 * - Typeface: Poppins (400/600/700/900)
 * - Gradient brand: #FAB652 → #F25636 → #E0026D
 */

const gradient = "bg-gradient-to-tr from-[#FAB652] via-[#F25636] to-[#E0026D]";
const chip =
  "inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-3 py-1 text-sm text-slate-800 backdrop-blur";
const card =
  "rounded-2xl bg-white/80 backdrop-blur shadow-[0_8px_24px_rgba(15,23,42,.06)] ring-1 ring-black/5";

function KPIBlock({
  label,
  value,
  unit,
  series,
}: {
  label: string;
  value: number;
  unit: string;
  series: number[];
}) {
  const min = Math.min(...series);
  const max = Math.max(...series);
  const fmt = (n: number) => (Math.round(n * 10) / 10).toFixed(1);
  const w = 300,
    h = 60;
  const step = series.length > 1 ? w / (series.length - 1) : w;
  const y = (v: number) => {
    const denom = max - min || 1;
    const t = (v - min) / denom;
    return (1 - t) * (h - 10) + 5;
  };
  const idBase = label.replace(/[^a-zA-Z0-9]/g, "");
  const pathLine = series
    .map((v, i) => `${i === 0 ? "M" : "L"} ${i * step} ${y(v)}`)
    .join(" ");
  const pathArea = `${pathLine} L ${w} ${h} L 0 ${h} Z`;
  return (
    <div className="rounded-2xl bg-white shadow-[0_8px_24px_rgba(15,23,42,.06)] ring-1 ring-black/5 p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
          <div className="mt-1 flex items-baseline gap-1">
            <div className="text-3xl font-semibold text-slate-900">{fmt(value)}</div>
            <div className="text-sm text-slate-500">{unit}</div>
          </div>
        </div>
        <div className="text-xs text-slate-500">Min {fmt(min)} • Max {fmt(max)}</div>
      </div>
      <div className="mt-2 h-16">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="none"
          className="w-full h-full"
          aria-hidden
        >
          <defs>
            <linearGradient id={`${idBase}Line`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#FAB652" />
              <stop offset="50%" stopColor="#F25636" />
              <stop offset="100%" stopColor="#E0026D" />
            </linearGradient>
            <linearGradient id={`${idBase}Area`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#FAB652" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#E0026D" stopOpacity="0.10" />
              <stop offset="100%" stopColor="#E0026D" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={pathArea} fill={`url(#${idBase}Area)`} />
          <path
            d={pathLine}
            fill="none"
            stroke={`url(#${idBase}Line)`}
            strokeWidth={2}
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-[#e3e0db]/80">
      <div className="mx-auto max-w-[90rem] px-6 h-14 flex items-center justify-between">
        <a href="#" className="text-xl font-extrabold tracking-tight text-slate-900">
          <span className={`${gradient} bg-clip-text text-transparent`}>arka</span>
        </a>
        <nav className="hidden md:flex items-center gap-6 text-slate-700">
          <a href="#features" className="hover:text-slate-900">
            Fonctionnalités
          </a>
          <a href="#how" className="hover:text-slate-900">
            Comment ça marche
          </a>
          <a href="#pricing" className="hover:text-slate-900">
            Tarifs
          </a>
          <a href="#faq" className="hover:text-slate-900">FAQ</a>
        </nav>
        <div className="flex items-center gap-3">
          <button className="rounded-full border border-black/10 bg-white px-4 py-1.5 text-sm font-medium hover:bg-slate-50">
            Se connecter
          </button>
          <button
            className={`hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm text-white ${gradient}`}
          >
            Ouvrir le cockpit
          </button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  const ttft = [1.9, 1.7, 1.6, 1.5, 1.6, 1.5];
  const rtt = [3.4, 3.3, 3.2, 3.2, 3.3, 3.2];
  const err = [0.9, 0.8, 0.8, 0.9, 0.8, 0.8];
  return (
    <section id="hero" className="mx-auto max-w-[90rem] px-6 pt-12">
      <div className="bg-[#0b1015] text-white ring-1 ring-white/10 shadow-[0_20px_60px_rgba(0,0,0,.35)] px-6 md:px-10 py-10 md:py-14">
        <div className="flex items-start justify-between">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/90 backdrop-blur">
            Cockpit v0.1.0-demo • Données de démo
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Col gauche */}
          <div className="lg:col-span-7 max-w-2xl">
            <h1 className="max-w-[28ch] text-3xl md:text-4xl lg:text-5xl font-medium leading-[1.15] tracking-tight">
              Pilotez une équipe d’
              <span className="font-black not-italic bg-clip-text text-transparent bg-gradient-to-tr from-[#FAB652] via-[#F25636] to-[#E0026D]">
                agents IA experts
              </span>
              — pas un assistant isolé.
            </h1>
            <p className="mt-4 font-medium text-slate-300 max-w-xl">
              Avec Arka, vous ne dialoguez pas avec une machine. Vous dirigez une squad spécialisée : RH, Formation, Qualité, Organisation. Chaque agent IA est un expert dans son domaine, et tous travaillent ensemble, en ping‑pong, pour livrer mieux.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/90 backdrop-blur">
                <Check size={14} /> Experts, pas généralistes
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/90 backdrop-blur">
                <Check size={14} /> Collaboration multi‑rôles
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/90 backdrop-blur">
                <Check size={14} /> Mémoire souveraine
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="#try"
                className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-white ${gradient}`}
              >
                Entrer dans le cockpit <ArrowRight size={16} />
              </a>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-5 py-3 text-white/90 hover:bg-white/15"
              >
                <PlayCircle size={16} /> Voir la démo 90s
              </a>
            </div>
          </div>

          {/* Col droite: image */}
          <div className="lg:col-span-5 relative">
            <span className="absolute right-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/90 backdrop-blur">
              Données de démo
            </span>
            <img
              src="https://arka-squad.app/assets/hero/arkabox-board.png?v=20250904"
              alt="Aperçu Cockpit Arka"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <KPIBlock label="TTFT P95" value={1.5} unit="ms" series={ttft} />
        <KPIBlock label="RTT P95" value={3.2} unit="ms" series={rtt} />
        <KPIBlock label="Erreurs P95" value={0.8} unit="%" series={err} />
      </div>
    </section>
  );
}

function EnClair() {
  return (
    <section id="what" className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-slate-900">En clair</h2>
        <p className="mt-3 text-lg md:text-xl text-slate-700 font-medium">
          Pas un robot, une équipe coordonnée. Vous gardez la main, ils exécutent et s’améliorent ensemble.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-black/5 shadow-[0_20px_60px_rgba(15,23,42,.08)] p-8 md:p-12 text-center">
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(40%_35%_at_15%_10%,#FAB65222,transparent),radial-gradient(35%_30%_at_85%_20%,#E0026D1a,transparent)]" />
          <div className="relative max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3">
              <span className={`${gradient} text-white inline-flex items-center justify-center h-10 w-10 rounded-full shadow`}>
                <Command size={18} />
              </span>
              <h3 className="text-xl font-semibold text-slate-900">Un poste de commande</h3>
            </div>
            <p className="mt-2 text-slate-700">
              Vous donnez la direction. Les agents experts s’organisent entre eux : assignations, validations, corrections.
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-white ring-1 ring-black/5 shadow-[0_20px_60px_rgba(15,23,42,.08)] p-8 md:p-12 text-center">
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(40%_35%_at_85%_90%,#F256361f,transparent),radial-gradient(35%_30%_at_20%_80%,#E0026D14,transparent)]" />
          <div className="relative max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3">
              <span className={`${gradient} text-white inline-flex items-center justify-center h-10 w-10 rounded-full shadow`}>
                <AlertTriangle size={18} />
              </span>
              <h3 className="text-xl font-semibold text-slate-900">Retour d’état immédiat</h3>
            </div>
            <p className="mt-2 text-slate-700">
              La squad vous répond : OK ou À risque. Et si besoin, propose déjà une alternative.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AgentCarousel() {
  const railRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [active, setActive] = useState(0);
  const [immersive, setImmersive] = useState(false);

  const items: Array<{
    id: string;
    title: string;
    role: string;
    image: string;
    summary: string;
    skills: string[];
    cta?: { label: string; href: string };
  }> = [
    {
      id: "rh",
      title: "Conseiller RH",
      role: "RH",
      image: "/site/agents/rh@2x.jpg",
      summary: "Prépare dossiers, contrats, onboarding.",
      skills: ["Dossiers RH", "Contrats", "Onboarding"],
    },
    {
      id: "org",
      title: "Coach Organisation",
      role: "Organisation",
      image: "/site/agents/organisation@2x.jpg",
      summary: "Structure missions, épics, deadlines.",
      skills: ["Missions", "Epics", "Deadlines"],
    },
    {
      id: "qualite",
      title: "Qualité & Conformité",
      role: "Qualité",
      image: "/site/agents/qualite@2x.jpg",
      summary: "Vérifie risques, conformité légale, process.",
      skills: ["Risques", "Conformité", "Process"],
    },
    {
      id: "formation",
      title: "Formateur Pédagogique",
      role: "Formation",
      image: "/site/agents/formation@2x.jpg",
      summary: "Crée supports, scénarios, check‑lists.",
      skills: ["Supports", "Scénarios", "Check‑lists"],
    },
    {
      id: "analyste",
      title: "Analyste Données",
      role: "Analyste",
      image: "/site/agents/analyste@2x.jpg",
      summary: "Synthétise indicateurs et tableaux clairs.",
      skills: ["Indicateurs", "Tableaux", "Synthèses"],
    },
    {
      id: "support",
      title: "Support & Communication",
      role: "Support",
      image: "/site/agents/support@2x.jpg",
      summary: "Transforme livrables en docs lisibles.",
      skills: ["Docs", "Présentations", "Comms"],
    },
    {
      id: "owner",
      title: "Owner (vous)",
      role: "Owner",
      image: "/site/agents/owner@2x.jpg",
      summary: "Arbitre, tranche, garde la main.",
      skills: ["Priorités", "Décisions", "Go/No‑Go"],
      cta: { label: "En savoir plus", href: "#agents-detail" },
    },
  ];

  const railPad = "max(calc((100vw - 90rem)/2 + 24px), 16px)";
  const railId = "agents-rail";
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max));

  const snapTo = (index: number, smooth = true) => {
    const rail = railRef.current;
    const card = cardRefs.current[index];
    if (!rail || !card) return;
    const pl = parseFloat(getComputedStyle(rail).paddingLeft || "0");
    const target = card.offsetLeft - pl;
    const max = rail.scrollWidth - rail.clientWidth;
    rail.scrollTo({ left: clamp(target, 0, max), behavior: smooth ? "smooth" : "auto" });
  };

  const go = (dir: number) => {
    const next = Math.min(Math.max(active + dir, 0), items.length - 1);
    setActive(next);
    if (!immersive) setImmersive(true);
    snapTo(next);
  };

  const onKeyNav = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
    if (e.key === "Enter") {
      setActive(index);
      setImmersive(true);
      snapTo(index);
    }
    if (e.key === "Escape") {
      setImmersive(false);
    }
    if (e.key === "ArrowRight") {
      go(1);
    }
    if (e.key === "ArrowLeft") {
      go(-1);
    }
  };

  const RoleImage = ({
    src,
    alt,
    eager,
    label,
  }: {
    src: string;
    alt: string;
    eager: boolean;
    label: string;
  }) => {
    const [failed, setFailed] = useState(false);
    return (
      <div className="relative overflow-hidden rounded-t-[16px] bg-slate-100 h-28 md:h-36 lg:h-44 xl:h-48">
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
        <div
          className={`absolute inset-0 ${failed ? "flex" : "hidden"} items-center justify-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200`}
        >
          {label}
        </div>
      </div>
    );
  };

  return (
    <section aria-labelledby="agents" className="mx-auto max-w-[90rem] px-6 py-16" id="agents">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            Nos agents experts
          </h2>
          <p className="mt-2 text-slate-600 font-medium">
            Une squad où chaque rôle est clair, et où chacun connaît ses collègues.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button
            aria-controls={railId}
            aria-label="Carte précédente"
            onClick={() => go(-1)}
            className="h-11 w-11 rounded-full bg-white ring-1 ring-black/10 shadow-sm hover:bg-slate-50"
          >
            <ChevronLeft className="mx-auto" />
          </button>
          <button
            aria-controls={railId}
            aria-label="Carte suivante"
            onClick={() => go(1)}
            className="h-11 w-11 rounded-full bg-white ring-1 ring-black/10 shadow-sm hover:bg-slate-50"
          >
            <ChevronRight className="mx-auto" />
          </button>
        </div>
      </div>

      {/* Rail full‑bleed aligné à gauche */}
      <div className="mt-6 w-screen relative left-1/2 right-1/2 -mx-[50vw]">
        <div
          id={railId}
          ref={railRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 [scrollbar-width:none] [-ms-overflow-style:none]"
          style={{
            paddingLeft: railPad,
            paddingRight: railPad,
            scrollPaddingLeft: railPad,
            scrollPaddingRight: railPad,
          }}
        >
          {items.map((it, i) => {
            const isActive = i === active;
            const eager = i === 0;
            return (
              <article
                key={it.id}
                ref={(el) => (cardRefs.current[i] = el)}
                role="region"
                aria-label={`${it.role} — ${it.title}`}
                aria-expanded={immersive && isActive}
                tabIndex={0}
                onKeyDown={(e) => onKeyNav(e, i)}
                onClick={() => {
                  setActive(i);
                  setImmersive(true);
                  snapTo(i);
                }}
                className={
                  "w-full sm:w-[55%] md:w-[240px] lg:w-[320px] xl:w-[360px] flex-none snap-start snap-always rounded-[16px] bg-white ring-1 ring-black/5 shadow-[0_12px_24px_rgba(15,23,42,.08)] transition-transform duration-200 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
                }
              >
                <RoleImage
                  src={it.image}
                  alt={`${it.role} — ${it.title}, illustration`}
                  eager={eager}
                  label={it.role}
                />
                <div className="p-6 grid [grid-template-rows:auto_auto_1fr_auto] min-h-[180px] md:min-h-[190px]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-slate-900">{it.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold text-white ${gradient}`}>
                      {it.role}
                    </span>
                  </div>
                  <p className="mt-2 text-slate-700 line-clamp-2">{it.summary}</p>
                  <ul className="mt-4 grid grid-cols-3 gap-2 text-sm text-slate-700">
                    {it.skills.slice(0, 3).map((s, j) => (
                      <li
                        key={j}
                        className="col-span-3 sm:col-span-1 flex items-center gap-2"
                      >
                        <Check size={16} className="text-emerald-600/80" /> {s}
                      </li>
                    ))}
                  </ul>
                  {it.cta && (
                    <a
                      href={it.cta.href}
                      className="mt-4 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
                    >
                      {it.cta.label}
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Bullets + fraction */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <div className="flex items-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              aria-label={`Aller à la carte ${i + 1}`}
              className={`h-2.5 w-2.5 rounded-full ${
                i === active ? "bg-slate-800" : "bg-slate-400/40"
              }`}
              onClick={() => {
                setActive(i);
                snapTo(i);
              }}
            />
          ))}
        </div>
        <span className="ml-2 text-sm text-slate-600">
          {active + 1} / {items.length}
        </span>
      </div>

      <style>{`@media (prefers-reduced-motion: reduce){ #${railId}{ scroll-behavior: auto; } }`}</style>
    </section>
  );
}

function Pill({ label, tone = "slate" }: { label: string; tone?: "emerald" | "amber" | "rose" | "indigo" | "slate" }) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-600/10 text-emerald-700 ring-emerald-600/20",
    amber: "bg-amber-500/10 text-amber-700 ring-amber-500/20",
    rose: "bg-rose-500/10 text-rose-700 ring-rose-500/20",
    indigo: "bg-indigo-500/10 text-indigo-700 ring-indigo-500/20",
    slate: "bg-slate-500/10 text-slate-700 ring-slate-500/20",
  };
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm ring-1 ${tones[tone]}`}>
      {label}
    </span>
  );
}

function ExampleCard({
  title,
  command,
  resultTitle,
  resultDesc,
  status,
  variant = "default",
}: {
  title: string;
  command: string;
  resultTitle: string;
  resultDesc: string;
  status: "PASS" | "WARN" | "FAIL" | "A_FAIRE" | "A_RISQUE";
  variant?: "default" | "muted";
}) {
  const statusMap = {
    PASS: <Pill label="OK" tone="emerald" />,
    WARN: <Pill label="Attention" tone="amber" />,
    FAIL: <Pill label="Bloquant" tone="rose" />,
    A_FAIRE: <Pill label="À faire" tone="indigo" />,
    A_RISQUE: <Pill label="À risque" tone="rose" />,
  } as const;
  const containerClass =
    variant === "muted"
      ? "rounded-2xl bg-[#e3e0db] ring-1 ring-black/5 shadow-[0_8px_24px_rgba(15,23,42,.06)]"
      : `${card}`;
  return (
    <article className={`relative ${containerClass} p-6 md:p-8`}>
      {variant === "default" && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-40 [background:radial-gradient(40%_30%_at_10%_0%,#FAB65222,transparent),radial-gradient(30%_25%_at_95%_100%,#E0026D14,transparent)]" />
      )}
      <div className="relative grid gap-6 md:grid-cols-12 items-start">
        <div className="md:col-span-5">
          <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
          <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white/70 px-3 py-2 font-mono text-[15px] text-slate-800 shadow-sm">
            <Sparkles size={16} className="opacity-70" /> {command}
          </div>
        </div>
        <div className="md:col-span-7">
          <div className="flex items-center gap-3 flex-wrap">
            {statusMap[status]}
            <span className="text-slate-900 font-medium">{resultTitle}</span>
          </div>
          <p className="mt-2 text-slate-700">{resultDesc}</p>
        </div>
      </div>
    </article>
  );
}

function ExamplesSection() {
  return (
    <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] bg-white">
      <section id="examples" className="mx-auto max-w-[90rem] px-6 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            Exemples
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            Une commande → une mission prise en main par toute la squad.
          </p>
        </div>
        <div className="mt-8 grid gap-6">
          <ExampleCard
            title="Préparer un onboarding RH"
            command="/kit onboarding"
            resultTitle="Onboarding"
            resultDesc="Le Conseiller RH prépare le kit, le Coach organisation vérifie les étapes, le Qualité valide la conformité. Résultat : checklist complète J‑7 à J+7."
            status="A_FAIRE"
            variant="muted"
          />
          <ExampleCard
            title="Mettre une procédure à jour"
            command="/assign Proc-23"
            resultTitle="Procédure mise à jour"
            resultDesc="Le Coach prend la tâche, le Qualité revoit la cohérence, le Support la publie. Résultat : procédure à jour, validée."
            status="A_FAIRE"
            variant="muted"
          />
          <ExampleCard
            title="Signaler un risque conformité"
            command="/gate conformité"
            resultTitle="Conformité"
            resultDesc="Le Qualité évalue, l’Analyste propose des correctifs, le Coach les intègre. Résultat : livrable marqué À risque avec actions proposées."
            status="A_RISQUE"
            variant="muted"
          />
        </div>
      </section>
    </div>
  );
}

function FeatureRow({ title, desc, icon }: { title: string; desc: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`mt-1 ${gradient} text-white inline-flex h-8 w-8 flex-none items-center justify-center rounded-full`}>
        {icon ?? <Check size={16} />}
      </div>
      <div>
        <div className="font-medium text-slate-900">{title}</div>
        <p className="text-slate-600">{desc}</p>
      </div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section id="features" className="mx-auto max-w-[90rem] px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5">
          <div className="relative">
            <img
              src="https://arka-squad.app/assets/hero/arkabox-board.png?v=20250904"
              alt="Aperçu du cockpit Arka : chat multi‑assistants, recettes, observabilité et preuves"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
        <div className="lg:col-span-7">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            Tout piloter depuis un seul endroit
          </h2>
          <p className="mt-3 text-slate-700 max-w-2xl">
            Le cockpit Arka réunit : le chat orchestrateur multi‑agents, des recettes métiers prêtes à l’emploi, la visibilité en direct des résultats, et une mémoire souveraine (ArkaMeta).
          </p>
          <p className="mt-2 text-slate-700 max-w-2xl">
            Vous donnez la direction, les agents experts se relaient pour exécuter. Les indicateurs se mettent à jour en direct. À la fin, une preuve formelle est générée : claire, lisible, exportable.
          </p>

          <div className="mt-8 grid gap-6">
            <FeatureRow
              title="Chat multi‑agents experts"
              desc="RH, Qualité, Organisation répondent et déclenchent des actions concrètes."
              icon={<Sparkles size={16} />}
            />
            <FeatureRow
              title="Recettes métiers"
              desc="Onboarding, Formation, Conformité, Process internes — prêtes à l’emploi."
            />
            <FeatureRow
              title="ArkaMeta — mémoire souveraine"
              desc="Historique, décisions, livrables — hébergés chez vous, contrôlés par vous."
            />
            <FeatureRow
              title="Preuves exportables"
              desc="Dossiers clairs pour audits, clients, subventions — en un clic."
              icon={<FileText size={16} />}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className={chip}>
              <Check size={14} /> Assigner
            </span>
            <span className={chip}>
              <Check size={14} /> Vérifier
            </span>
            <span className={chip}>
              <Check size={14} /> Lier un doc
            </span>
            <span className={chip}>
              <Share2 size={14} /> Exporter la preuve
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectMapCarousel() {
  const items = [
    { id: "chat", icon: <MessageSquare size={20} />, title: "Chat", desc: "Là où l’on décide et déclenche." },
    { id: "roadmap", icon: <Route size={20} />, title: "Roadmap", desc: "Missions et jalons." },
    { id: "doc", icon: <BookOpen size={20} />, title: "DocDesk", desc: "Documents, contrats, supports versionnés." },
    { id: "sop", icon: <Settings size={20} />, title: "Builder Gouvernance", desc: "Règles et check‑lists." },
    { id: "roster", icon: <Users size={20} />, title: "Roster", desc: "Les rôles de votre squad, leurs charges." },
    { id: "obs", icon: <Activity size={20} />, title: "Observabilité", desc: "Santé et indicateurs clés." },
    { id: "arkameta", icon: <HardDrive size={20} />, title: "ArkaMeta", desc: "Mémoire souveraine, toujours chez vous." },
    { id: "evidence", icon: <ClipboardList size={20} />, title: "Evidence", desc: "Le paquet de preuves à partager." },
  ];

  const railRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [active, setActive] = useState(0);
  const railId = "workspace-rail";
  const railPad = "max(calc((100vw - 90rem)/2 + 24px), 16px)";
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(v, max));
  const snapTo = (index: number, smooth = true) => {
    const rail = railRef.current;
    const card = cardRefs.current[index];
    if (!rail || !card) return;
    const pl = parseFloat(getComputedStyle(rail).paddingLeft || "0");
    const target = card.offsetLeft - pl;
    const max = rail.scrollWidth - rail.clientWidth;
    rail.scrollTo({ left: clamp(target, 0, max), behavior: smooth ? "smooth" : "auto" });
  };
  const go = (dir: number) => {
    const next = Math.min(Math.max(active + dir, 0), items.length - 1);
    setActive(next);
    snapTo(next);
  };

  return (
    <section id="workspace" className="mx-auto max-w-[90rem] px-6 py-16">
      <div className="flex items-end justify-between gap-4">
        <div className="max-w-2xl">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            Où vit le projet
          </h2>
          <p className="mt-2 text-slate-600 font-medium">Tout est visible, rien n’est perdu</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <button
            aria-controls={railId}
            aria-label="Précédent"
            onClick={() => go(-1)}
            className="h-11 w-11 rounded-full bg-white ring-1 ring-black/10 shadow-sm hover:bg-slate-50"
          >
            <ChevronLeft className="mx-auto" />
          </button>
          <button
            aria-controls={railId}
            aria-label="Suivant"
            onClick={() => go(1)}
            className="h-11 w-11 rounded-full bg-white ring-1 ring-black/10 shadow-sm hover:bg-slate-50"
          >
            <ChevronRight className="mx-auto" />
          </button>
        </div>
      </div>

      <div className="mt-6 w-screen relative left-1/2 right-1/2 -mx-[50vw]">
        <div
          id={railId}
          ref={railRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-6 [scrollbar-width:none] [-ms-overflow-style:none]"
          style={{
            paddingLeft: railPad,
            paddingRight: railPad,
            scrollPaddingLeft: railPad,
            scrollPaddingRight: railPad,
          }}
        >
          {items.map((it, i) => (
            <article
              key={it.id}
              ref={(el) => (cardRefs.current[i] = el)}
              className="flex-none snap-start snap-always w-[88%] sm:w-[60%] md:w-[340px] lg:w-[380px] xl:w-[420px] rounded-[20px] bg-white ring-1 ring-black/5 shadow-[0_12px_24px_rgba(15,23,42,.08)] p-6"
            >
              <div className="flex items-start gap-4">
                <div className={`${gradient} text-white inline-flex h-12 w-12 flex-none items-center justify-center rounded-2xl`}>
                  {it.icon}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{it.title}</h3>
                  <p className="mt-2 text-slate-700">{it.desc}</p>
                </div>
              </div>
              <button
                aria-label="Ouvrir"
                className="mt-6 ml-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white/90 hover:opacity-90"
              >
                <ArrowRight size={16} />
              </button>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            aria-label={`Aller à l’élément ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full ${
              i === active ? "bg-slate-800" : "bg-slate-400/40"
            }`}
            onClick={() => {
              setActive(i);
              snapTo(i);
            }}
          />
        ))}
      </div>
    </section>
  );
}

function EvidenceSection() {
  return (
    <section id="evidence" className="mx-auto max-w-[90rem] px-6 py-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-6">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">
            C’est quoi une “preuve” ?
          </h2>
          <p className="mt-3 text-slate-700 max-w-2xl">
            Une preuve, c’est un petit dossier qui résume ce qui a été fait et validé — concret, pas techno.
          </p>
          <ul className="mt-4 space-y-2 text-slate-700">
            <li className="flex items-start gap-2">
              <Check className="mt-1" size={16} /> Les actions clés (qui, quoi, quand).
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-1" size={16} /> Les résultats (OK / À risque, décisions).
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-1" size={16} /> La version livrée (référence horodatée).
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-1" size={16} /> Une empreinte numérique pour garantir l’intégrité.
            </li>
          </ul>
          <p className="mt-3 text-slate-700 max-w-2xl">
            Lisible et rejouable. Utile pour un client, un audit, un dossier de subvention… Ou simplement pour garder la mémoire claire.
          </p>
        </div>
        <div className="lg:col-span-6">
          <div className="relative rounded-2xl bg-white ring-1 ring-black/5 shadow-[0_20px_50px_rgba(15,23,42,.12)] p-6 overflow-hidden">
            <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_60%_at_120%_-10%,#F2563622,transparent),radial-gradient(30%_30%_at_0%_100%,#E0026D14,transparent)]" />
            <header className="relative flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <div className={`${gradient} text-white inline-flex h-9 w-9 items-center justify-center rounded-full`}>
                  <FileText size={16} />
                </div>
                <div className="font-semibold text-slate-900">Preuve d’exécution</div>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-600/10 text-emerald-700 ring-1 ring-emerald-600/20 px-3 py-1 text-sm">
                OFFICIEL
              </span>
            </header>
            <div className="relative mt-4 grid gap-2 text-slate-800 text-[15px]">
              <div>
                <span className="font-medium">Réf.</span> : cockpit@0.1.0-demo • <span className="font-medium">Émis le</span> : 2025‑09‑05 14:32
              </div>
              <div>
                <span className="font-medium">Actions</span> : /kit onboarding · /assign Proc‑23
              </div>
              <div>
                <span className="font-medium">Résultats</span> : OK · À faire · Décision validée
              </div>
              <div className="font-mono text-sm text-slate-600">
                <span className="font-medium not-italic">Empreinte</span> : sha256: 9f8c…e21
              </div>
            </div>
            <footer className="relative mt-6 flex items-center justify-between border-t border-slate-200 pt-3">
              <div className="text-xs text-slate-500">Document signé • Intégrité vérifiée</div>
              <div className={`${gradient} text-white inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm`}>
                <Check size={14} /> Validé
              </div>
            </footer>
            <div
              aria-hidden
              className="pointer-events-none absolute -right-10 -bottom-6 rotate-[-15deg] text-[72px] font-black text-slate-900/5 select-none"
            >
              ARKA
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AudienceCard({
  icon,
  title,
  points,
  long,
  glow,
}: {
  icon: React.ReactNode;
  title: string;
  points?: string[];
  long?: string;
  glow?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 shadow-[0_12px_30px_rgba(15,23,42,.08)] p-6 md:p-7">
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl"
        style={{
          background:
            glow ||
            "radial-gradient(30% 24% at 10% 8%, #FAB6521A, transparent), radial-gradient(22% 18% at 90% 88%, #E0026D12, transparent)",
        }}
      />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className={`${gradient} text-white inline-flex h-9 w-9 flex-none items-center justify-center rounded-xl`}>
            {icon}
          </div>
          <div className="font-semibold text-slate-900">{title}</div>
        </div>
        {points && (
          <ul className="mt-3 space-y-2 text-slate-700">
            {points.map((p, i) => (
              <li key={i} className="flex items-start gap-2">
                <Check className="mt-1" size={16} /> {p}
              </li>
            ))}
          </ul>
        )}
        {long && <p className="mt-3 text-slate-700">{long}</p>}
      </div>
    </div>
  );
}

function AudienceSection() {
  return (
    <section id="who" className="mx-auto max-w-[90rem] px-6 py-16">
      <div className="text-center max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900">Pour qui</h2>
        <p className="mt-2 text-slate-600 font-medium">Aujourd’hui et demain</p>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5">
          <div className="relative">
            <img
              src="https://arka-squad.app/assets/hero/arkabox-board.png?v=20250904"
              alt="Publics visés par Arka"
              className="w-full h-auto object-contain"
            />
            <div className="pointer-events-none absolute -z-10 inset-0 blur-3xl opacity-50 [background:radial-gradient(30%_30%_at_30%_60%,#FAB65233,transparent),radial-gradient(30%_30%_at_70%_40%,#E0026D22,transparent)]" />
          </div>
        </div>

        <div className="lg:col-span-7 grid gap-6 md:grid-cols-2 auto-rows-fr">
          <AudienceCard
            icon={<Users size={18} />}
            title="RH solo et petites équipes"
            points={["Décharger le quotidien", "Sans embaucher"]}
            glow={
              "radial-gradient(38% 32% at 12% 10%, #FAB65226, transparent), radial-gradient(26% 24% at 82% 86%, #E0026D1a, transparent)"
            }
          />
          <AudienceCard
            icon={<Building2 size={18} />}
            title="PME et directions"
            points={["Piloter missions & preuves", "Décider en confiance"]}
            glow={
              "radial-gradient(36% 30% at 88% 12%, #FAB65226, transparent), radial-gradient(24% 22% at 18% 82%, #E0026D14, transparent)"
            }
          />
          <AudienceCard
            icon={<GraduationCap size={18} />}
            title="Écoles et formations"
            points={["Scénarios guidés", "10× plus vite", "Sans données sensibles"]}
            glow={
              "radial-gradient(40% 30% at 14% 88%, #FAB65226, transparent), radial-gradient(24% 22% at 86% 24%, #E0026D14, transparent)"
            }
          />
          <AudienceCard
            icon={<Briefcase size={18} />}
            title="Extensions"
            long="Compta, Finance, Marketing, Support. La squad s’installe, documente et tient la durée."
            glow={
              "radial-gradient(48% 38% at 78% 52%, #FAB6521f, transparent), radial-gradient(24% 20% at 22% 20%, #E0026D12, transparent)"
            }
          />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mt-24 border-t border-black/10">
      <div className="mx-auto max-w-[90rem] px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
        <div className="text-xl font-extrabold tracking-tight text-slate-900">
          <span className={`${gradient} bg-clip-text text-transparent`}>arka</span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <a href="/legal/mentions" className="hover:text-slate-900">
            Mentions
          </a>
          <span className="text-slate-400">·</span>
          <a href="/contact" className="hover:text-slate-900">
            Contact
          </a>
          <span className="text-slate-400">·</span>
          <a href="/status" className="hover:text-slate-900">
            Statut
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default function LandingPreview() {
  return (
    <ErrorBoundary>
      <div
      className="min-h-screen text-slate-900"
      style={{ background: "#e3e0db" }}
    >
      <style>{`*{font-family:Poppins,ui-sans-serif,system-ui,Arial}`}</style>
      <Header />
      <Hero />
      <EnClair />
      <AgentCarousel />
      <ExamplesSection />
      <FeaturesSection />
      <ProjectMapCarousel />
      <EvidenceSection />
      <AudienceSection />
      <Footer />
    </div>
    </ErrorBoundary>
  );
}
