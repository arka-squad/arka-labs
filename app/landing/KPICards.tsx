import React from "react";
import { TOKENS } from "./tokens";

const KPIS = [
  { k: "TTFT", v: "680ms" },
  { k: "RTT", v: "1380ms" },
  { k: "% erreurs", v: "0%" },
  { k: "Vélocité", v: "+30%" },
];

export default function KPICards() {
  return (
    <section className="mx-auto mt-16 grid max-w-7xl grid-cols-2 gap-6 px-6 md:grid-cols-4">
      {KPIS.map((i) => (
        <div
          key={i.k}
          tabIndex={0}
          className={`group relative overflow-hidden rounded-xl bg-slate-900/30 px-5 py-6 text-center shadow-sm ring-1 ${TOKENS.ringSoft} hover:ring-slate-500 focus:outline-none focus:ring-2`}
        >
          <div className="text-xs uppercase tracking-wide text-slate-400">{i.k}</div>
          <div className={`mt-2 text-xl font-extrabold bg-clip-text text-transparent ${TOKENS.gradTextClass}`}>
            {i.v}
          </div>
        </div>
      ))}
    </section>
  );
}
