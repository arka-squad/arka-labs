'use client';

import { useState, useEffect } from 'react';
import Leftbar from '../../components/leftbar';
import ChatPanel from '../../components/chat/ChatPanel';
import KpiCard from '../../components/kpis/KpiCard';
import RoadmapCard from '../../components/roadmap/RoadmapCard';
import RunsTable from '../../components/runs/RunsTable';
import RunsList from '../../components/runs/RunsList';
import AgentCard from '../../components/roster/AgentCard';
import DossiersPanel from '../../components/dossiers/DossiersPanel';
import { demoKpis, demoRoadmap, demoRuns, demoRoster, demoThreads, demoAgents, demoMessages } from './demo-data';
import ConsoleGuard from '../../components/ConsoleGuard';

export default function ConsoleDashboardPage() {
  const [view, setView] = useState<'dashboard'|'roadmap'|'builder'|'docs'|'observa'|'runs'|'roster'>('dashboard');
  const [activeThreadId, setActiveThreadId] = useState<string>(demoThreads[0]?.id || '');
  const [msgs, setMsgs] = useState<Record<string, any[]>>({ ...demoMessages });
  const handleSend = async (threadId: string, payload: { text: string }) => {
    const list = msgs[threadId] || [];
    const now = new Date();
    const newMsg = { id: 'loc_'+now.getTime(), from: 'Owner', role: 'human', at: now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}), text: payload.text, status: 'delivered' };
    setMsgs({ ...msgs, [threadId]: [...list, newMsg] });
  };

  // Append agent reply from streaming (dispatched by ChatPanel)
  useEffect(() => {
    function onAgentReply(e: any) {
      const { threadId, agentId, text } = (e as CustomEvent).detail || {};
      if (!threadId || !text) return;
      setMsgs(prev => {
        const arr = prev[threadId] || [];
        const now = new Date();
        const agentName = (demoAgents.find(a=>a.id===agentId)?.name) || 'Agent';
        const agentMsg = { id: 'agent_'+now.getTime(), from: agentName, role: 'agent', at: now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}), text, status: 'delivered' };
        return { ...prev, [threadId]: [...arr, agentMsg] };
      });
    }
    window.addEventListener('chat:agentReply', onAgentReply as EventListener);
    return () => window.removeEventListener('chat:agentReply', onAgentReply as EventListener);
  }, []);
  return (
    <div className="h-[calc(100dvh-56px)] grid gap-3 grid-cols-[72px_380px_minmax(0,1fr)] md:grid-cols-[72px_320px_minmax(0,1fr)] lg:grid-cols-[72px_380px_minmax(0,1fr)]">
      <ConsoleGuard />
      {/* Leftbar */}
      <aside className="h-full overflow-visible"><Leftbar value={view as any} onChange={(id:any)=>setView(id)} unread={2} presence="online" /></aside>
      {/* Chat panel (380px) */}
      <div className="h-full overflow-hidden pt-3 pb-6">
      <aside className="h-full overflow-hidden rounded-xl border border-soft elevated">
        <ChatPanel
          threads={demoThreads as any}
          messagesByThread={msgs as any}
          agents={demoAgents as any}
          activeThreadId={activeThreadId}
          onSelectThread={(id)=>setActiveThreadId(id)}
          onSelectAgent={()=>{}}
          onSend={handleSend}
        />
      </aside>
      </div>
      {/* Content */}
      <section className="h-full overflow-hidden pt-3 pb-6 pr-3">
        {/* Router views */}
        {view === 'dashboard' && (
          <div className="grid h-full grid-rows-[auto_1fr] gap-3">
            {/* KPIs row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {demoKpis.map(k => (
                <KpiCard key={k.id} label={k.label} value={k.value} unit={k.unit} trend={k.trend} />
              ))}
            </div>
            {/* Dashboard content grid 3 cols */}
            <div className="grid grid-cols-3 gap-3 h-full">
              <div className="col-span-2 grid grid-rows-[40%_1fr] gap-3 h-full">
                <div className="overflow-hidden"><RoadmapCard months={demoRoadmap.months} lanes={demoRoadmap.lanes} /></div>
              <div className="min-h-0 overflow-hidden pb-3"><RunsTable items={demoRuns} /></div>
              </div>
              <div className="min-h-0 overflow-hidden">
              <div className="h-full overflow-auto scroller rounded-xl border border-soft elevated p-3 flex flex-col gap-3">
                <div className="text-xs text-secondary">ROSTER · RISQUES</div>
                {demoRoster.map(a => (
                  <AgentCard key={a.id} a={{ id: a.id, name: a.name, role: a.role, load: a.load, missions: a.missions, doc: a.doc || null, kpis: a.kpis, status: 'green' }} />
                ))}
              </div>
              </div>
            </div>
          </div>
        )}
        {view === 'observa' && (
          <div className="p-4 h-full min-h-0 overflow-hidden grid grid-rows-[auto_1fr] gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {demoKpis.map(k => (
                <KpiCard key={k.id} label={`${k.label}`} value={k.value} unit={k.unit} trend={k.trend} />
              ))}
            </div>
            <div className="rounded-xl border border-soft elevated p-8 text-[var(--fgdim)]">
              Sélectionnez l’onglet <span className="text-[var(--fg)]">Runs</span> pour la liste détaillée paginée (20/l).
            </div>
          </div>
        )}
        {view === 'runs' && (
          <div className="p-4 h-full min-h-0 overflow-hidden">
            <RunsList data={demoRuns as any} />
          </div>
        )}
        {view === 'docs' && (
          <div className="h-full min-h-0 overflow-hidden">
            <DossiersPanel />
          </div>
        )}
      </section>
    </div>
  );
}
