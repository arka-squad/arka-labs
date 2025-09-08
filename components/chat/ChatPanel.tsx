"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { MessageSquare, Link2, Plus, SquareDashedMousePointer, ArrowUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ChatHeaderControls from './ChatHeaderControls';
import { streamChat } from '../../lib/chat/stream';
import { getCurrentRole, UIRole } from '../../lib/auth/role';
import { handleIntent } from '../../src/chat/intents';

export type Thread = { id: string; title: string; squad?: string; last_msg_at?: string };
export type ChatMsg = { id: string; from: string; role?: 'human'|'agent'|'system'; at: string; text: string; status?: 'queued'|'sending'|'delivered'|'failed' };
export type Agent = { id: string; name: string; role?: string; tz?: string; load?: number; status?: 'green'|'orange'|'red'; missions?: string[]; risk?: string|null; doc?: string|null; kpis?: { ttft:number; pass:number; commits:number } };

type Props = {
  threads: Thread[];
  messagesByThread: Record<string, ChatMsg[]>;
  agents: Agent[];
  activeThreadId: string;
  onSelectThread?: (id: string) => void;
  onSelectAgent?: (id: string) => void;
  onSend?: (threadId: string, payload: { text: string }) => Promise<void> | void;
};

export default function ChatPanel({ threads, messagesByThread, agents, activeThreadId, onSelectThread, onSelectAgent, onSend }: Props) {
  const [agentId, setAgentId] = useState<string>(agents[0]?.id || '');
  const a = useMemo(() => agents.find(x => x.id === agentId) || agents[0], [agents, agentId]);
  const msgs = messagesByThread[activeThreadId] || [];
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [providerMap, setProviderMap] = useState<Record<string, { providerId?: string; modelId?: string }>>({});

  const [role, setRole] = useState<UIRole>(getCurrentRole());
  useEffect(() => {
    const id = setInterval(() => setRole(getCurrentRole()), 2000);
    return () => clearInterval(id);
  }, []);
  const readOnly = role === 'viewer';

  const [streamingText, setStreamingText] = useState('');
  const [streaming, setStreaming] = useState(false);

  const draftRef = useRef('');

  const [toasts, setToasts] = useState<{id:string;level:'info'|'warn'|'error';msg:string}[]>([]);


  useEffect(() => {
    function onProviderChange(e: CustomEvent) {
      const { agent, provider, model } = e.detail as any;
      setProviderMap((m) => ({ ...m, [agent]: { providerId: provider, modelId: model } }));
    }
    window.addEventListener('providerChange', onProviderChange as EventListener);
    return () => window.removeEventListener('providerChange', onProviderChange as EventListener);
  }, []);


  // Toasts listener (trace copiée, erreurs, etc.)
  useEffect(() => {
    function onToast(e: CustomEvent) {
      const id = Math.random().toString(36).slice(2);
      const { level, msg } = e.detail as any;
      setToasts((t) => [...t, { id, level, msg }]);
      setTimeout(() => setToasts((t) => t.filter(x => x.id !== id)), 1500);
    }
    function onTraceCopied() { onToast({ detail: { level:'info', msg:'Trace copiée' } } as any as CustomEvent); }
    window.addEventListener('chat:toast', onToast as EventListener);
    window.addEventListener('chat:traceCopied', onTraceCopied as EventListener);
    return () => {
      window.removeEventListener('chat:toast', onToast as EventListener);
      window.removeEventListener('chat:traceCopied', onTraceCopied as EventListener);
    };
  }, []);


  // Nettoyage du draft agent lors d'un changement de fil
  useEffect(() => {
    setStreaming(false);
    setStreamingText('');
    draftRef.current = '';
  }, [activeThreadId]);



  const send = async () => {
    const val = (inputRef.current?.value || '').trim();
    if (!val) return;
    // Intents: if starts with '/'
    if (val.startsWith('/')) {
      const jwt = localStorage.getItem('jwt') || localStorage.getItem('RBAC_TOKEN') || '';
      const handled = await handleIntent(val, { threadId: activeThreadId, agentId, jwt });
      if (handled) {
        if (inputRef.current) inputRef.current.value = '';
        return;
      }
      try {
        await fetch('/api/chat/intents', { method:'POST', headers: { 'Content-Type':'application/json', ...(jwt?{Authorization:`Bearer ${jwt}`}:{}) }, body: JSON.stringify({ t: val.split(' ')[0], payload: { text: val, threadId: activeThreadId }, trace_id: crypto?.randomUUID?.() || Math.random().toString(36).slice(2) }) });
      } catch {}
      const now = new Date();
      const agentName = (a?.name)||'Agent';
      const echo = { id: 'intent_'+now.getTime(), from: agentName, role: 'agent', at: now.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}), text: `Intent reçu: ${val}`, status: 'delivered' } as any;
      window.dispatchEvent(new CustomEvent('chat:agentReply', { detail: { threadId: activeThreadId, agentId, text: echo.text } }));
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    await onSend?.(activeThreadId, { text: val });
    if (inputRef.current) inputRef.current.value = '';
    // scroll to bottom after inserting own message
    requestAnimationFrame(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); });
    // Start SSE stream for TTFT/Trace (B13)
    const mapping = providerMap[agentId] || {};
    const sessionId = localStorage.getItem('session_token');
    if (!mapping.providerId || !mapping.modelId || !sessionId) {

      window.dispatchEvent(new CustomEvent('chat:toast', { detail: { level: 'warn', msg: 'Connectez un fournisseur pour cet agent' } }));
      return;
    }
    try {
      setStreaming(true);
      setStreamingText('');

      await streamChat({
        agentId,
        threadId: activeThreadId,
        providerId: mapping.providerId,
        modelId: mapping.modelId,
        sessionId,

        role: getCurrentRole(),

        onToken: (chunk) => {
          draftRef.current = draftRef.current + (chunk || '');
          setStreamingText((s) => s + (chunk || ''));
        },
        onDone: () => {
          const text = draftRef.current;
          // Persiste la réponse agent dans le fil
          window.dispatchEvent(new CustomEvent('chat:agentReply', { detail: { threadId: activeThreadId, agentId, text } }));
          draftRef.current = '';
          setStreaming(false);
          setStreamingText('');
          requestAnimationFrame(()=> endRef.current?.scrollIntoView({ behavior:'smooth', block:'end' }));
        },

      });
    } catch (e: any) {
      setStreaming(false);
      const msg = String(e?.message||'');
      if (msg.includes('401') || msg.includes('unauthorized')) {
        window.dispatchEvent(new CustomEvent('chat:toast', { detail: { level: 'error', msg: 'Session expirée' } }));
        window.dispatchEvent(new CustomEvent('chat:openTokenModal'));

      } else if (msg.includes('429')) {
        window.dispatchEvent(new CustomEvent('chat:toast', { detail: { level: 'warn', msg: 'Limite atteinte' } }));

      } else {
        window.dispatchEvent(new CustomEvent('chat:toast', { detail: { level: 'error', msg: 'Erreur flux' } }));
      }
    }

  };

  // Auto-scroll on new messages or streaming updates
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [activeThreadId, msgs.length, streamingText]);

  return (
    <div className="h-full flex flex-col w-full">
      {/* Header 56px */}
      <div className="h-14 px-3 border-b border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-2 min-w-0 text-[var(--fg)]">
          <MessageSquare className="w-4 h-4" aria-hidden />
          <span className="text-sm">Chat</span>
          <select
            aria-label="Sélection du fil"
            value={activeThreadId}
            onChange={(e)=> onSelectThread?.(e.target.value)}
            className="bg-transparent text-[var(--fg)] border border-[var(--border)] rounded px-2 py-1 text-xs max-w-[260px] whitespace-normal leading-tight"
            style={{ whiteSpace:'normal' }}
          >
            {threads.map(t => <option key={t.id} value={t.id} className="bg-[var(--surface)]">{t.title}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--fgdim)]">Squad</span>
          <span className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-[var(--fg)]">{threads.find(t=>t.id===activeThreadId)?.squad || 'Alpha'}</span>
        </div>
      </div>

      {/* Agent header compact */}
      <div className="p-3 border-b border-[var(--border)] bg-white/\[0.02\] shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[var(--primary)]" aria-hidden />
            <span className="text-xs text-[var(--fgdim)]">Agent du fil</span>
          </div>
          <select
            aria-label="Sélection de l’agent"
            value={agentId}
            onChange={(e)=>{ setAgentId(e.target.value); onSelectAgent?.(e.target.value); }}
            className="bg-transparent text-[var(--fg)] border border-[var(--border)] rounded px-2 py-1 text-xs max-w-[260px] whitespace-normal leading-tight"
            style={{ whiteSpace:'normal' }}
          >
            {agents.map(ag => <option key={ag.id} value={ag.id} className="bg-[var(--surface)]">{ag.name} · {ag.role}</option>)}
          </select>
        </div>
        <div className="mt-1 text-[10px] leading-4 text-[var(--fgdim)] break-words max-w-full">{a?.name} · {a?.role}</div>
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <div className="relative w-5 h-5 rounded-full bg-white/10 grid place-items-center text-[10px]">{(a?.name||'?').split(' ')[0][0]}</div>
            <div className="text-sm text-[var(--fg)]">{a?.name}</div>
            <div className="text-xs text-[var(--fgdim)]">— {a?.role}</div>
            <span className={`ml-auto w-2 h-2 rounded-full ${a?.status==='green'?'bg-[var(--success)]':a?.status==='orange'?'bg-[var(--warn)]':'bg-[var(--danger)]'}`} aria-label={`status ${a?.status||'green'}`}/>
            <div className="text-xs text-[var(--fgdim)]">UTC{a?.tz||'+01'}</div>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-2 rounded bg-white/10 overflow-hidden">
              <div className="h-2" style={{ backgroundImage: 'var(--brand-grad)', width: `${Math.round((a?.load||0)*100)}%` }} />
            </div>
            <span className="tabular-nums text-[var(--fg)]/90 text-xs">{Math.round((a?.load||0)*100)}%</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs">
            {(a?.missions||[]).slice(0,2).map(m => <span key={m} className="px-1.5 py-0.5 rounded bg-white/5 text-[var(--fg)]/90 font-mono">{m}</span>)}
            {a?.risk && <span className="px-1.5 py-0.5 rounded bg-[var(--warn)]/10 text-[var(--warn)]">⚠ perf</span>}
            {a?.doc && <span className="px-1.5 py-0.5 rounded bg-white/5 text-[var(--fg)]/90">📄 {a.doc}</span>}
          </div>
          <div className="mt-1 text-xs text-[var(--fgdim)]">TTFT {a?.kpis?.ttft ?? 1.2}j · Gate {a?.kpis?.pass ?? 92}% · {a?.kpis?.commits ?? 8}/sem</div>
        </div>
      </div>

      {/* Chat controls: provider select, token, TTFT, trace */}
      <ChatHeaderControls agentId={agentId} />

      {/* Feed */}
      <div role="log" aria-live="polite" className="flex-1 flex flex-col min-h-0">
        <div ref={feedRef} className="flex-1 overflow-auto scroller p-3 space-y-3">
          {msgs.map((m) => (
            <div key={m.id} className={`text-sm flex ${m.from.toLowerCase()==='owner' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[75%]">
                <div className={`mb-1 flex items-center gap-2 text-xs ${m.from.toLowerCase()==='owner' ? 'justify-end' : 'justify-start'}`}>
                  {m.from.toLowerCase()!=='owner' && <div className="w-5 h-5 rounded-full bg-white/10 grid place-items-center text-[10px]">{m.from[0]}</div>}
                  <span className={`font-medium ${m.from.toLowerCase()==='owner' ? 'text-[var(--fg)]/90' : 'text-[var(--fg)]'}`}>{m.from}</span>
                  <span className="text-[var(--fgdim)]">{m.at}</span>
                  {m.status==='failed' && (
                    <span title="Échec"><AlertTriangle className="w-3 h-3 text-[var(--danger)]" aria-hidden /></span>
                  )}
                  {m.status==='delivered' && (
                    <span title="Livré"><CheckCircle2 className="w-3 h-3 text-[var(--success)]" aria-hidden /></span>
                  )}
                </div>
                {m.from.toLowerCase()==='owner' ? (
                  <div className="px-3 py-2 rounded-[12px] text-[var(--fg)] shadow" style={{ background: 'var(--bubble)' }}>
                    <div className="whitespace-pre-wrap">{highlightMotifs(m.text)}</div>
                  </div>
                ) : (
                  <div className="whitespace-pre-wrap text-[var(--fg)]/90 border-l-2 border-[var(--border)] pl-3">
                    {highlightMotifs(m.text)}
                  </div>
                )}
              </div>
            </div>
          ))}

          {(streamingText.length > 0) && (

            <div className="text-sm flex justify-start">
              <div className="max-w-[75%] whitespace-pre-wrap text-[var(--fg)]/90 border-l-2 border-[var(--border)] pl-3">
                {streamingText || '…'}
              </div>
            </div>
          )}

          <div ref={endRef} />

        </div>
        {/* Composer 96px */}
        <div className="p-3 border-t border-[var(--border)]">
          <div className="relative rounded-[20px] bg-[var(--elevated)]/80 border border-[var(--border)] px-4 py-4 focus-within:ring-1 focus-within:ring-[var(--ring-soft)]">
            <textarea
              ref={inputRef}
              className="w-full h-24 resize-none bg-transparent outline-none text-sm leading-relaxed pr-16 text-[var(--fg)] placeholder:text-[var(--fgdim)]/70"
              placeholder={`Message à squad ${threads.find(t=>t.id===activeThreadId)?.squad || 'alpha'}…`}
              onKeyDown={(e) => { if (!readOnly && e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              readOnly={readOnly}
              disabled={readOnly}
            />
            {!readOnly && (
              <div className="absolute left-3 bottom-3 flex items-center gap-2">
                <button className="w-8 h-8 rounded-full bg-white/5 border border-[var(--border)] grid place-items-center" title="Ajouter"><Plus className="w-4 h-4"/></button>
                <button className="h-8 px-3 rounded-full bg-white/5 border border-[var(--border)] text-sm flex items-center gap-1" title="Auto">
                  <SquareDashedMousePointer className="w-4 h-4"/>
                  <span>Auto</span>
                </button>
              </div>
            )}
            <button
              onClick={send}
              disabled={readOnly}
              className={`absolute right-3 bottom-3 w-8 h-8 rounded-full grid place-items-center border border-[var(--border)] ${readOnly ? 'bg-[var(--fgdim)]/20 opacity-50 cursor-not-allowed' : 'bg-[var(--fgdim)]/20 hover:bg-[var(--fgdim)]/30'}`}
              title="Envoyer"
            ><ArrowUp className="w-4 h-4"/></button>
          </div>
        </div>
      </div>
      {/* Toasts container */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto rounded px-3 py-2 text-sm border ${t.level==='error'?'bg-red-500/20 text-red-200 border-red-500/30': t.level==='warn'?'bg-amber-500/20 text-amber-200 border-amber-500/30':'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'}`}>{t.msg}</div>
        ))}
      </div>
    </div>
  );
}

function highlightMotifs(text: string) {
  const motifs = [/(^|\b)(Action:)/g, /(\b)(\d+\s+fichiers\s+lus)/g];
  let out: (string | JSX.Element)[] = [text];
  motifs.forEach((re) => {
    const next: (string | JSX.Element)[] = [];
    out.forEach((chunk) => {
      if (typeof chunk !== 'string') return next.push(chunk);
      let last = 0; let m: RegExpExecArray | null;
      const r = new RegExp(re);
      while ((m = r.exec(chunk))) {
        if (m.index > last) next.push(chunk.slice(last, m.index));
        next.push(<span key={m.index} className="text-[var(--primary)] font-medium">{m[2] || m[0]}</span>);
        last = m.index + (m[0]?.length || 0);
      }
      if (last < chunk.length) next.push(chunk.slice(last));
    });
    out = next;
  });
  return <>{out}</>;
}
