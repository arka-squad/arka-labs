import { COLOR } from "../../../src/ui/tokens"; import { NavItem } from "../../../src/ui/nav/NavItem"; import { ChatMessage } from "../../../src/ui/chat/ChatMessage"; import { PromptBlock } from "../../../src/ui/prompt/PromptBlock"; import { Dropzone } from "../../../src/ui/docs/Dropzone"; import { DocListItem } from "../../../src/ui/docs/DocListItem"; import { ObsKpiCard } from "../../../src/ui/obs/ObsKpiCard"; import { ObsTable } from "../../../src/ui/obs/ObsTable";
export default function ArkaR1Console(){
  const rows=[
    { axe:'Conformité contractuelle', kpi:"% d’endpoints conformes YAML au 1er jet", objectif:">80%" },
    { axe:'Cycles correctifs', kpi:"Nombre d’itérations QA avant PASS", objectif:"≤2" },
    { axe:'Performance', kpi:"P95 login / projects / health", objectif:"≤2s / ≤2s / ≤1.5s" },
    { axe:'Sécurité', kpi:"% de routes avec validation stricte (JSON Schema + RBAC)", objectif:"100%" },
    { axe:'Logs', kpi:"% de routes logguées avec champs obligatoires", objectif:"100%" },
    { axe:'Ratelimits', kpi:"Respect codes (200/202 vs 429)", objectif:"100%" },
  ];
  return (
    <div style={{ background: COLOR.body }} className="min-h-screen text-white">
      <div className="mx-auto grid max-w-7xl grid-cols-12 gap-4 p-4">
        <aside className="col-span-3 space-y-2">
          {["Dashboard","Chat","Documents","Prompt","Observabilité"].map((l,i)=> <NavItem key={l} active={i===0} label={l} />)}
          <div className="mt-8 grid grid-cols-3 gap-2">
            <div className="rounded-xl p-3 text-center" style={{ background: 'linear-gradient(135deg,#FAB652 0%,#F25636 50%)' }}><div className="text-[10px]">TTFT</div><div className="text-base font-bold">680<span className="ml-1 text-[10px] font-normal">ms</span></div></div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'linear-gradient(135deg,#F25636 0%,#E0026D 100%)' }}><div className="text-[10px]">RTT</div><div className="text-base font-bold">1450<span className="ml-1 text-[10px] font-normal">ms</span></div></div>
            <div className="rounded-xl p-3 text-center" style={{ background: 'linear-gradient(135deg,#E0026D 0%,#E0026D 100%)' }}><div className="text-[10px]">% Err</div><div className="text-base font-bold">1.2<span className="ml-1 text-[10px] font-normal">%</span></div></div>
          </div>
        </aside>
        <main className="col-span-9 space-y-4">
          {/* Chat */}
          <ul className="space-y-2">
            <ChatMessage role='user' content='Bonjour Arka' />
            <ChatMessage role='agent' content='Bonjour, je stream…' streaming />
          </ul>

          {/* Prompt */}
          <ul className="space-y-3">
            <PromptBlock titre="Cadre Général" valeur="Lorem ipsum" declencheur="Auto" role='owner' />
            <PromptBlock titre="Règles" valeur="—" declencheur="—" role='viewer' />
          </ul>

          {/* Documents */}
          <div className="grid gap-3">
            <Dropzone onFiles={()=>{}} />
            <ul className="rounded-xl border" style={{ borderColor: '#1F2A33' }}>
              <DocListItem name="Plan Directeur — Arka R1.pdf" type="application/pdf" size={120*1024} tags={["cadre","AGP"]} />
              <DocListItem name="Spécifications Fonctionnelles — R1.docx" type="application/vnd.openxmlformats-officedocument.wordprocessingml.document" size={300*1024} tags={["specs","PMO"]} />
            </ul>
          </div>

            {/* Observabilité */}
            <div className="grid gap-4 sm:grid-cols-3">
              <ObsKpiCard label="TTFT chat" value={680} unit="ms" />
              <ObsKpiCard label="RTT voix" value={1450} unit="ms" gradient="linear-gradient(135deg,#F25636 0%,#E0026D 100%)" />
              <ObsKpiCard label="% erreurs" value={1.2} unit="%" gradient="linear-gradient(135deg,#E0026D 0%,#E0026D 100%)" />
            </div>
            <ObsTable rows={rows} />
        </main>
      </div>
    </div>
  );
}
