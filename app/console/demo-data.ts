export const demoKpis = [
  { id: 'ttft_p95', label: 'TTFT (p95)', value: 1.5, unit: 'ms', trend: [1.6, 1.7, 1.5, 1.6, 1.5, 1.5] },
  { id: 'rtt_p95', label: 'RTT (p95)', value: 3.2, unit: 'ms', trend: [3.4, 3.1, 3.3, 3.3, 3.2, 3.2] },
  { id: 'errors_p95', label: 'Erreurs (p95)', value: 0.8, unit: '%', trend: [0.9, 0.8, 0.8, 0.9, 0.8, 0.8] },
];

export const demoRoadmap = {
  months: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  lanes: [
    { id: 'RM-1', name: 'Console core', tags: [], start: 'Jan', end: 'Mar', chip: 'EPIC-42', owner: 'AGP' },
    { id: 'RM-2', name: 'Builder v1', tags: ['EPIC-7'], start: 'Feb', end: 'May', owner: 'UX/UI' },
    { id: 'RM-3', name: 'Policies', tags: ['POL-12'], start: 'May', end: 'Jun', owner: 'PMO' },
    { id: 'RM-4', name: 'ADR set', tags: ['ADR-9'], start: 'Jun', end: 'Jul', owner: 'AGP' },
    { id: 'RM-5', name: 'Process lib', tags: ['PRC-7'], start: 'May', end: 'Sep', owner: 'QA-ARC' },
    { id: 'RM-6', name: 'Observabilité', tags: ['OBS-2'], start: 'Mar', end: 'Aug', owner: 'AGP' },
  ],
};

export type Run = { run_id: string; status: 'PASS'|'FAIL'|'WARN'; p95_ms: number; error_pct: number; sprint: string; trace_id: string };

export const demoRuns: Run[] = [
  { run_id: 'R-1824', status: 'FAIL', p95_ms: 3100, error_pct: 2.1, sprint: 'S-14', trace_id: 'adm14xk7' },
  { run_id: 'R-1825', status: 'PASS', p95_ms: 1480, error_pct: 0.8, sprint: 'S-15', trace_id: 'ox1iizx0' },
  { run_id: 'R-1826', status: 'PASS', p95_ms: 1510, error_pct: 0.8, sprint: 'S-14', trace_id: '7zxf9qm' },
  { run_id: 'R-1827', status: 'PASS', p95_ms: 1540, error_pct: 0.8, sprint: 'S-15', trace_id: 'annn7e3' },
  { run_id: 'R-1828', status: 'PASS', p95_ms: 1570, error_pct: 0.8, sprint: 'S-14', trace_id: 'qn15aey' },
  { run_id: 'R-1829', status: 'PASS', p95_ms: 1450, error_pct: 0.8, sprint: 'S-15', trace_id: '1chc09e' },
  { run_id: 'R-1830', status: 'PASS', p95_ms: 1480, error_pct: 0.8, sprint: 'S-14', trace_id: 'sg4via9y' },
  { run_id: 'R-1831', status: 'FAIL', p95_ms: 3100, error_pct: 2.1, sprint: 'S-15', trace_id: '06a2qcc1' },
  { run_id: 'R-1832', status: 'PASS', p95_ms: 1540, error_pct: 0.8, sprint: 'S-14', trace_id: 'l9h1f0b' },
  { run_id: 'R-1833', status: 'PASS', p95_ms: 1570, error_pct: 0.8, sprint: 'S-15', trace_id: 'tto1zms' },
  { run_id: 'R-1834', status: 'PASS', p95_ms: 1450, error_pct: 0.8, sprint: 'S-14', trace_id: 'ygz87l0' },
  { run_id: 'R-1835', status: 'PASS', p95_ms: 1480, error_pct: 0.8, sprint: 'S-15', trace_id: 't19e4leh' },
  { run_id: 'R-1836', status: 'PASS', p95_ms: 1540, error_pct: 0.8, sprint: 'S-14', trace_id: 'jry34vp7' },
  { run_id: 'R-1837', status: 'WARN', p95_ms: 1620, error_pct: 1.2, sprint: 'S-15', trace_id: 'x8m0pa9' },
  { run_id: 'R-1838', status: 'PASS', p95_ms: 1490, error_pct: 0.7, sprint: 'S-14', trace_id: 'qw90as1' },
  { run_id: 'R-1839', status: 'PASS', p95_ms: 1520, error_pct: 0.8, sprint: 'S-15', trace_id: '1aa29bd' },
  { run_id: 'R-1840', status: 'PASS', p95_ms: 1500, error_pct: 0.8, sprint: 'S-14', trace_id: 's8d7kpa' },
  { run_id: 'R-1841', status: 'PASS', p95_ms: 1530, error_pct: 0.8, sprint: 'S-15', trace_id: 'k9p7nq2' },
  { run_id: 'R-1842', status: 'PASS', p95_ms: 1550, error_pct: 0.8, sprint: 'S-14', trace_id: 'pp02mnb' },
  { run_id: 'R-1843', status: 'PASS', p95_ms: 1510, error_pct: 0.8, sprint: 'S-15', trace_id: 'z9mv73w' },
];

export type RosterAgent = { id: string; name: string; role: string; load: number; missions: string[]; risk?: boolean; doc?: string; kpis: { ttft: number; pass: number; commits: number } };

export const demoRoster: RosterAgent[] = [
  { id: 'agp', name: 'AGP — Arka v2.5', role: 'AGP', load: 0.65, missions: ['EPIC-42', 'EPIC-7'], risk: true, kpis: { ttft: 1.2, pass: 92, commits: 8 } },
  { id: 'qa', name: 'QA-ARC — R2.5', role: 'QA-ARC', load: 0.8, missions: ['EPIC-13'], kpis: { ttft: 1.2, pass: 92, commits: 8 } },
  { id: 'pmo', name: 'PMO — Console', role: 'PMO', load: 0.55, missions: ['EPIC-31', 'PROC-7'], kpis: { ttft: 1.2, pass: 92, commits: 8 } },
  { id: 'ux', name: 'UX/UI — v12', role: 'UX/UI', load: 0.4, missions: ['EPIC-68'], doc: 'ADR-9', kpis: { ttft: 1.2, pass: 92, commits: 8 } },
];

export const demoThreads = [
  { id: 't3', title: 'Chat — Arka 2.6 — AGP | Actif — Alpha', squad: 'Alpha' },
  { id: 't2', title: 'Sprint S-15 — QA-ARC sync', squad: 'Beta' },
  { id: 't1', title: 'PMO — Releases & ADRs', squad: 'Gamma' },
];

export const demoAgents = [
  { id: 'agp', name: 'AGP — Arka v2.5', role: 'AGP', tz: '+01', load: 0.65, status: 'green', missions: ['EPIC-42', 'EPIC-7'], kpis: { ttft: 1.2, pass: 92, commits: 8 } },
  { id: 'qa', name: 'QA-ARC — R2.5', role: 'QA-ARC', tz: '+01', load: 0.80, status: 'orange', missions: ['EPIC-13'], kpis: { ttft: 1.2, pass: 92, commits: 8 } },
  { id: 'pmo', name: 'PMO — Console', role: 'PMO', tz: '+01', load: 0.55, status: 'green', missions: ['EPIC-31', 'PROC-7'], kpis: { ttft: 1.2, pass: 92, commits: 8 } },
  { id: 'ux', name: 'UX/UI — v12', role: 'UX/UI', tz: '+01', load: 0.40, status: 'green', missions: ['EPIC-68'], kpis: { ttft: 1.2, pass: 92, commits: 8 } },
];

export const demoMessages: Record<string, { id: string; from: 'owner'|'agent'; text: string; at: string }[]> = {
  t3: [
    { id: 'm1', from: 'agent', at: '09:41', text: 'Élaboration d’un plan structuré' },
    { id: 'm2', from: 'agent', at: '09:42', text: '2 fichiers générés: Livrable-AGP_Objectifs-Fonctionnels-Prioritaires-Arka.md (x2).' },
    { id: 'm3', from: 'agent', at: '09:44', text: "On prépare l’ossature de la PR Vague 1 (répertoires + README), duplication des scripts CI sous infra/ci, + placeholders tests/docs. Un CR résumera les changements." },
    { id: 'm4', from: 'agent', at: '09:46', text: "Je crée l’ossature cible non destructive (dossiers + README) et duplique les scripts CI sous infra/ci/ sans toucher aux imports." },
    { id: 'm5', from: 'agent', at: '09:49', text: 'Reco: prise de connaissance faite — 9 fichiers lus, contenu cohérent; quelques artefacts d’encodage FR mineurs visibles. Action: souhaitez-vous que je normalise l’UTF‑8 (sans BOM) sur ces docs ou que je passe au lot suivant Socle OPS/Repo ?' },
    { id: 'm6', from: 'agent', at: '09:50', text: "Action: j’ouvre local/100-repo-map-audit.md pour poursuivre le lot OPS/Repo." },
  ],
};

