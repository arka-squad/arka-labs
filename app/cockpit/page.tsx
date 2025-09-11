"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  BarChart3,
  Gauge,
  GitCommit,
  Users,
  AlertTriangle,
  Settings,
} from "lucide-react";
import ResponsiveWrapper from "./components/ResponsiveWrapper";

export default function CockpitPage() {
  const [loading, setLoading] = useState(true);

  const [metrics] = useState({
    ttft: { value: 1.5, unit: "ms", color: "#F59E0B" },
    rtt: { value: 3.2, unit: "ms", color: "#8B5CF6" },
    errors: { value: 0.8, unit: "%", color: "#A16207" },
  });

  const [roadmapData] = useState({
    months: [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Jun",
      "Jul",
      "Aoû",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ],
  });

  const [runs] = useState([
    {
      run_id: "R-1835",
      statut: "PASS",
      p95_ms: 1480,
      error_percent: 0.8,
      sprint: "S-15",
      trace_id: "ygy8r70",
    },
    {
      run_id: "R-1834",
      statut: "FAIL",
      p95_ms: 3100,
      error_percent: 2.1,
      sprint: "S-14",
      trace_id: "adm14x7",
    },
    {
      run_id: "R-1833",
      statut: "PASS",
      p95_ms: 1570,
      error_percent: 0.8,
      sprint: "S-15",
      trace_id: "ttotzms",
    },
    {
      run_id: "R-1832",
      statut: "PASS",
      p95_ms: 1540,
      error_percent: 0.8,
      sprint: "S-14",
      trace_id: "l9ntf0b",
    },
    {
      run_id: "R-1831",
      statut: "FAIL",
      p95_ms: 3100,
      error_percent: 2.1,
      sprint: "S-15",
      trace_id: "06a2qcc1",
    },
    {
      run_id: "R-1830",
      statut: "PASS",
      p95_ms: 1480,
      error_percent: 0.8,
      sprint: "S-14",
      trace_id: "sg4via9y",
    },
  ]);

  const [agents] = useState([
    {
      id: "1",
      name: "AGP — Arka v2.5",
      version: "AGP",
      tasks: ["EPIC-42", "EPIC-7"],
      charge: 85,
      status: "actif",
      ttft: "1.2j",
      gaia: "92%",
      bream: "Bream",
      progress: 78,
    },
    {
      id: "2",
      name: "QA-ARC — R2.5",
      version: "QA-ARC",
      tasks: ["EPIC-13"],
      charge: 80,
      status: "actif",
      ttft: "1.2j",
      gaia: "92%",
      bream: "Bream",
      progress: 45,
    },
    {
      id: "3",
      name: "PMO — Console",
      version: "PMO",
      tasks: ["EPIC-11", "PMO-7"],
      charge: 55,
      status: "actif",
      ttft: "1.2j",
      gaia: "92%",
      bream: "Bream",
      progress: 92,
    },
    {
      id: "4",
      name: "UX/UI — v12",
      version: "UX/UI",
      tasks: ["EPIC-68", "ADR-9"],
      charge: 40,
      status: "actif",
      ttft: "1.2j",
      gaia: "92%",
      bream: "Bream",
      progress: 23,
    },
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <ResponsiveWrapper
        currentPath="/cockpit"
        contentClassName="pl-0 sm:pl-0 md:pl-0 lg:pl-0"
        innerClassName="max-w-none mx-0"
      >
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <p className="text-gray-400">Initialisation du cockpit...</p>
          </div>
        </div>
      </ResponsiveWrapper>
    );
  }

  return (
    <ResponsiveWrapper
      currentPath="/cockpit"
      contentClassName="pl-0 sm:pl-0 md:pl-0 lg:pl-0"
      innerClassName="max-w-none mx-0"
    >
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Gauge size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Cockpit ARKA</h1>
                <p className="text-gray-400">Console de pilotage — Monitoring temps réel</p>
              </div>
            </div>
          </div>
        </div>

        {/* 3 metrics cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* TTFT */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-900/30 rounded-lg">
                  <Activity size={20} className="text-orange-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">TTFT (GDS)</h3>
                  <div className="text-xs text-gray-500">Min 1.6 • Max 1.7</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-orange-400">{metrics.ttft.value}</span>
                <span className="text-lg text-orange-300 ml-1">{metrics.ttft.unit}</span>
              </div>
            </div>
            <div className="relative h-12 mt-4">
              <svg viewBox="0 0 200 48" className="w-full h-full">
                <path d="M0,35 Q25,25 50,30 T100,28 Q125,24 150,26 T200,22" fill="none" stroke="#f1a43a" strokeWidth="1.5" className="opacity-90" />
                <path d="M0,35 Q25,25 50,30 T100,28 Q125,24 150,26 T200,22 L200,48 L0,48 Z" fill="#3b2a12" opacity="0.22" />
              </svg>
            </div>
          </div>

          {/* RTT */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-900/30 rounded-lg">
                  <Activity size={20} className="text-purple-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">RTT (GDS)</h3>
                  <div className="text-xs text-gray-500">Min 3.1 • Max 3.4</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-purple-400">{metrics.rtt.value}</span>
                <span className="text-lg text-purple-300 ml-1">{metrics.rtt.unit}</span>
              </div>
            </div>
            <div className="relative h-12 mt-4">
              <svg viewBox="0 0 200 48" className="w-full h-full">
                <path d="M0,30 Q30,15 60,20 T120,18 Q140,25 170,20 T200,15" fill="none" stroke="#b9a7ff" strokeWidth="1.5" className="opacity-90" />
                <path d="M0,30 Q30,15 60,20 T120,18 Q140,25 170,20 T200,15 L200,48 L0,48 Z" fill="#231b37" opacity="0.22" />
              </svg>
            </div>
          </div>

          {/* Errors */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-900/30 rounded-lg">
                  <AlertTriangle size={20} className="text-yellow-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Erreurs (GDS)</h3>
                  <div className="text-xs text-gray-500">Min 0.8 • Max 0.8</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-yellow-600">{metrics.errors.value}</span>
                <span className="text-lg text-yellow-500 ml-1">{metrics.errors.unit}</span>
              </div>
            </div>
            <div className="relative h-12 mt-4">
              <svg viewBox="0 0 200 48" className="w-full h-full">
                <path d="M0,38 Q20,42 40,38 T80,40 Q110,35 140,38 T200,36" fill="none" stroke="#e1b15e" strokeWidth="1.5" className="opacity-90" />
                <path d="M0,38 Q20,42 40,38 T80,40 Q110,35 140,38 T200,36 L200,48 L0,48 Z" fill="#3a2f18" opacity="0.22" />
              </svg>
            </div>
          </div>
        </div>

        {/* Roadmap + Roster */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Roadmap */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-900/30 rounded-lg">
                    <BarChart3 size={20} className="text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Roadmap — 12 mois</h2>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <span>3m</span> <span>6m</span> <span>12m</span>
                  <button className="text-blue-400 hover:text-blue-300 ml-4">Zoom →</button>
                </div>
              </div>

              {/* Mois (sans blocs colorés) */}
              <div className="grid grid-cols-12 gap-2 mb-4">
                {roadmapData.months.map((m) => (
                  <div key={m} className="text-center text-xs text-gray-400 truncate">
                    {m}
                  </div>
                ))}
              </div>

              {/* Lignes avec barres sobres (bordure 2px, fond 20%) */}
              <div className="space-y-4 mt-2">
                {/* Console core */}
                <div className="flex items-center space-x-4">
                  <div className="w-24 text-white text-sm font-medium truncate">Console core</div>
                  <div className="flex space-x-2 text-xs">
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded">EPIC-42</span>
                    <span className="px-2 py-1 bg-gray-700/30 text-gray-400 rounded">AGP</span>
                  </div>
                  <div className="flex-1 relative h-8 bg-gray-700/20 rounded-full flex items-center">
                    <div
                      className="h-6 rounded-full flex items-center px-4 text-white text-sm font-medium border border-teal-300 bg-teal-300/10"
                      style={{ width: "30%" }}
                    >
                      Console core
                    </div>
                  </div>
                </div>

                {/* Builder v1 */}
                <div className="flex items-center space-x-4">
                  <div className="w-24 text-white text-sm font-medium truncate">Builder v1</div>
                  <div className="flex space-x-2 text-xs">
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded">EPIC-7</span>
                    <span className="px-2 py-1 bg-gray-700/30 text-gray-400 rounded">UX/UI</span>
                  </div>
                  <div className="flex-1 relative h-8 bg-gray-700/20 rounded-full flex items-center">
                    <div
                      className="h-6 rounded-full flex items-center px-4 text-white text-sm font-medium border border-sky-300 bg-sky-300/10"
                      style={{ width: "40%", marginLeft: "20%" }}
                    >
                      Builder v1
                    </div>
                  </div>
                </div>

                {/* Policies */}
                <div className="flex items-center space-x-4">
                  <div className="w-24 text-white text-sm font-medium truncate">Policies</div>
                  <div className="flex space-x-2 text-xs">
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded">POL-12</span>
                    <span className="px-2 py-1 bg-gray-700/30 text-gray-400 rounded">PMO</span>
                  </div>
                  <div className="flex-1 relative h-8 bg-gray-700/20 rounded-full flex items-center">
                    <div
                      className="h-6 rounded-full flex items-center px-4 text-white text-sm font-medium border border-emerald-300 bg-emerald-300/10"
                      style={{ width: "25%", marginLeft: "50%" }}
                    >
                      Policies
                    </div>
                  </div>
                </div>

                {/* ADR set */}
                <div className="flex items-center space-x-4">
                  <div className="w-24 text-white text-sm font-medium truncate">ADR set</div>
                  <div className="flex space-x-2 text-xs">
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded">ADR-9</span>
                    <span className="px-2 py-1 bg-gray-700/30 text-gray-400 rounded">AGP</span>
                  </div>
                  <div className="flex-1 relative h-8 bg-gray-700/20 rounded-full flex items-center">
                    <div
                      className="h-6 rounded-full flex items-center px-4 text-white text-sm font-medium border border-violet-300 bg-violet-300/10"
                      style={{ width: "20%", marginLeft: "60%" }}
                    >
                      ADR set
                    </div>
                  </div>
                </div>

                {/* Process lib */}
                <div className="flex items-center space-x-4">
                  <div className="w-24 text-white text-sm font-medium truncate">Process lib</div>
                  <div className="flex space-x-2 text-xs">
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded">PRC-7</span>
                    <span className="px-2 py-1 bg-gray-700/30 text-gray-400 rounded">QA-ARC</span>
                  </div>
                  <div className="flex-1 relative h-8 bg-gray-700/20 rounded-full flex items-center">
                    <div
                      className="h-6 rounded-full flex items-center px-4 text-white text-sm font-medium border border-rose-300 bg-rose-300/10"
                      style={{ width: "35%", marginLeft: "50%" }}
                    >
                      Process lib
                    </div>
                  </div>
                </div>

                {/* Observabilité */}
                <div className="flex items-center space-x-4">
                  <div className="w-24 text-white text-sm font-medium truncate">Observabilité</div>
                  <div className="flex space-x-2 text-xs">
                    <span className="px-2 py-1 bg-blue-900/30 text-blue-300 rounded">OBS-2</span>
                    <span className="px-2 py-1 bg-gray-700/30 text-gray-400 rounded">AGP</span>
                  </div>
                  <div className="flex-1 relative h-8 bg-gray-700/20 rounded-full flex items-center">
                    <div
                      className="h-6 rounded-full flex items-center px-4 text-white text-sm font-medium border border-teal-300 bg-teal-300/10"
                      style={{ width: "45%", marginLeft: "40%" }}
                    >
                      Observabilité
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Derniers runs */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-900/30 rounded-lg">
                    <GitCommit size={20} className="text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">DERNIERS RUNS (20/L)</h2>
                </div>
                <button className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors text-sm">
                  <Settings size={16} />
                  <span>Filtres</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700 text-left">
                      <th className="py-2 px-3 text-gray-400 font-medium text-sm">run_id</th>
                      <th className="py-2 px-3 text-gray-400 font-medium text-sm">statut</th>
                      <th className="py-2 px-3 text-gray-400 font-medium text-sm">p95 (ms)</th>
                      <th className="py-2 px-3 text-gray-400 font-medium text-sm">error %</th>
                      <th className="py-2 px-3 text-gray-400 font-medium text-sm">sprint</th>
                      <th className="py-2 px-3 text-gray-400 font-medium text-sm">trace_id</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runs.map((run) => (
                      <tr key={run.run_id} className="border-b border-gray-700/30 hover:bg-gray-700/20">
                        <td className="py-2 px-3 text-white font-mono text-sm">{run.run_id}</td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              run.statut === "PASS"
                                ? "bg-green-900/30 text-green-400"
                                : "bg-red-900/30 text-red-400"
                            }`}
                          >
                            {run.statut}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-gray-300 font-mono text-sm">{run.p95_ms}</td>
                        <td className="py-2 px-3 text-gray-300 text-sm">{run.error_percent}</td>
                        <td className="py-2 px-3 text-blue-400 font-medium text-sm">{run.sprint}</td>
                        <td className="py-2 px-3 text-blue-300 font-mono text-xs cursor-pointer hover:text-blue-200">
                          {run.trace_id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Roster à droite */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-green-900/30 rounded-lg">
                    <Users size={20} className="text-green-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">ROSTER REQUISES</h2>
                </div>
              </div>

              <div className="space-y-4">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="p-4 bg-gray-700/30 rounded-lg border border-gray-600/30"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-xs font-bold text-white">
                          {agent.version.slice(0, 2)}
                        </div>
                        <div>
                          <h3 className="text-white font-medium text-sm">{agent.name}</h3>
                          <div className="text-xs text-gray-500">{agent.version}</div>
                        </div>
                      </div>
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor:
                            agent.status === "actif" ? "#10B981" : "#6B7280",
                        }}
                      />
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {agent.tasks.map((task, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded"
                        >
                          {task}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">Charge:</span>
                        <span
                          className="font-medium"
                          style={{
                            color:
                              agent.charge >= 80
                                ? "#EF4444"
                                : agent.charge >= 60
                                ? "#F59E0B"
                                : "#10B981",
                          }}
                        >
                          {agent.charge}%
                        </span>
                      </div>

                      {/* Barre de progression */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Tâche en cours</span>
                          <span className="text-blue-300">{agent.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700/50 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 ease-out relative"
                            style={{
                              width: `${agent.progress}%`,
                              background: `linear-gradient(90deg, #3B82F6 0%, #60A5FA 50%, #93C5FD 100%)`,
                            }}
                          >
                            <div
                              className="absolute inset-0 rounded-full opacity-75 animate-pulse"
                              style={{
                                background:
                                  "linear-gradient(90deg, transparent 0%, #3B82F680 50%, transparent 100%)",
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-xs text-gray-500">
                        TTFT {agent.ttft} • Gaia {agent.gaia} • {agent.bream}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveWrapper>
  );
}
