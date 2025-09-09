'use client';

import { useState } from 'react';
import Leftbar from '../../components/leftbar';
import ChatDock from '../../components/ChatDock';

type TabType = 'squad' | 'agents' | 'projet' | 'clients' | 'analytics';
type NavId = 'chat' | 'agent' | 'system' | 'documents' | 'observabilite';

export default function BackofficePage() {
  const [activeTab, setActiveTab] = useState<TabType>('squad');
  const [leftbarNav, setLeftbarNav] = useState<NavId>('chat');

  const tabs = [
    { id: 'squad' as TabType, label: 'Squad' },
    { id: 'agents' as TabType, label: 'Agents' },
    { id: 'projet' as TabType, label: 'Projet' },
    { id: 'clients' as TabType, label: 'Clients' },
    { id: 'analytics' as TabType, label: 'Analytics' }
  ];

  const leftbarItems = [
    { id: 'chat' as NavId, label: 'Chat' },
    { id: 'agent' as NavId, label: 'Agent du fil' },
    { id: 'system' as NavId, label: 'System' },
    { id: 'documents' as NavId, label: 'Documents' },
    { id: 'observabilite' as NavId, label: 'Observabilité' }
  ];

  const renderBackofficeContent = () => {
    switch (activeTab) {
      case 'squad':
        return <SquadSection />;
      case 'agents':
        return <AgentsSection />;
      case 'projet':
        return <ProjetSection />;
      case 'clients':
        return <ClientsSection />;
      case 'analytics':
        return <AnalyticsSection />;
      default:
        return <SquadSection />;
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Left Sidebar */}
      <Leftbar 
        items={leftbarItems}
        value={leftbarNav}
        onChange={setLeftbarNav}
        unread={3}
        presence="online"
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Backoffice Zone */}
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Header with Tabs */}
            <div className="border-b border-[var(--border)] bg-[var(--surface)] px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold">🏢</span>
                    <h1 className="text-xl font-bold">Arka Backoffice Admin</h1>
                  </div>
                  <p className="text-sm text-[var(--fgdim)] mt-1">
                    Gestion des squads, agents, projets et clients
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Mini KPIs */}
                  <div className="flex space-x-3">
                    <div className="text-center">
                      <div className="text-xs text-[var(--fgdim)]">SQUADS</div>
                      <div className="text-lg font-bold text-[var(--success)]">12</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-[var(--fgdim)]">AGENTS</div>
                      <div className="text-lg font-bold text-[var(--primary)]">48</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-[var(--fgdim)]">PROJETS</div>
                      <div className="text-lg font-bold text-[var(--warn)]">8</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Tabs Navigation */}
              <div className="flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-[var(--primary)] text-[var(--primary)]'
                        : 'border-transparent text-[var(--fgdim)] hover:text-[var(--fg)] hover:border-[var(--muted)]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content - Scrollable with invisible scrollbar */}
            <div className="flex-1 overflow-y-auto bg-[var(--bg)] scrollbar-invisible">
              <div className="p-6">
                {renderBackofficeContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
      
      {/* Chat Dock */}
      <ChatDock />
    </div>
  );
}

// Section Components
function SquadSection() {
  const [selectedSquad, setSelectedSquad] = useState<any>(mockSquads[0]);
  const [createMode, setCreateMode] = useState(false);
  const [newSquad, setNewSquad] = useState({
    name: '',
    domain: '',
    visibility: 'Organisation',
    description: ''
  });

  const handleCreateSquad = () => {
    if (!newSquad.name || !newSquad.domain) {
      alert('Nom et domaine requis');
      return;
    }
    
    // Mock creation
    const squad = {
      id: mockSquads.length + 1,
      ...newSquad,
      status: 'active' as const,
      agents_count: 0
    };
    
    mockSquads.push(squad);
    setSelectedSquad(squad);
    setCreateMode(false);
    setNewSquad({
      name: '',
      domain: '',
      visibility: 'Organisation',
      description: ''
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--fg)]">🔷 SQUAD - CRÉATION & ÉDITION</h2>
        <div className="flex space-x-3">
          {!createMode && (
            <select 
              className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--fg)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              value={selectedSquad?.id || ''}
              onChange={(e) => {
                const squad = mockSquads.find(s => s.id === parseInt(e.target.value));
                setSelectedSquad(squad);
              }}
            >
              {mockSquads.map((squad) => (
                <option key={squad.id} value={squad.id}>{squad.name}</option>
              ))}
            </select>
          )}
          <button 
            className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 px-4 py-2 rounded-lg transition-colors text-sm text-white"
            onClick={() => {
              setCreateMode(true);
              setSelectedSquad(null);
            }}
          >
            + Créer Squad
          </button>
        </div>
      </div>
      
      {createMode ? (
        // Create New Squad Mode
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--fg)]">🔷 Nouvelle Squad</h3>
                <div className="flex space-x-2">
                  <button 
                    className="text-xs bg-[var(--success)] hover:bg-[var(--success)]/80 px-2 py-1 rounded text-white"
                    onClick={handleCreateSquad}
                  >
                    Créer
                  </button>
                  <button 
                    className="text-xs bg-[var(--muted)] hover:bg-[var(--muted)]/80 px-2 py-1 rounded text-[var(--fg)]"
                    onClick={() => setCreateMode(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Nom de la squad *</label>
                  <input
                    type="text"
                    value={newSquad.name}
                    onChange={(e) => setNewSquad({...newSquad, name: e.target.value})}
                    placeholder="ex. Squad RH Alpha"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Domaine *</label>
                  <input
                    type="text"
                    value={newSquad.domain}
                    onChange={(e) => setNewSquad({...newSquad, domain: e.target.value})}
                    placeholder="ex. RH, Tech, Marketing"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Visibilité</label>
                  <select 
                    value={newSquad.visibility}
                    onChange={(e) => setNewSquad({...newSquad, visibility: e.target.value})}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  >
                    <option>Organisation</option>
                    <option>Privée</option>
                    <option>Publique</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Description</label>
                <textarea
                  rows={3}
                  value={newSquad.description}
                  onChange={(e) => setNewSquad({...newSquad, description: e.target.value})}
                  placeholder="Description de la squad, ses missions, spécialités..."
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
          </div>
          <div className="col-span-4 space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">ℹ️ Informations</h3>
              <div className="space-y-3 text-sm">
                <p className="text-[var(--fgdim)]">
                  <strong className="text-[var(--fg)]">Ordre logique :</strong><br/>
                  1. Créer la squad<br/>
                  2. Ajouter les agents<br/>
                  3. Configurer documents contexte<br/>
                  4. Assigner aux projets
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : selectedSquad ? (
        // Edit Existing Squad Mode
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            {/* Basic Squad Info */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--fg)]">🔷 Informations Squad</h3>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${selectedSquad.status === 'active' ? 'bg-[var(--success)]/20 text-[var(--success)]' : 'bg-[var(--muted)]/20 text-[var(--fgdim)]'}`}>
                    {selectedSquad.status.toUpperCase()}
                  </span>
                  <button className="text-xs bg-[var(--muted)] hover:bg-[var(--muted)]/80 px-2 py-1 rounded text-[var(--fg)]">
                    {selectedSquad.status === 'active' ? 'Désactiver' : 'Activer'}
                  </button>
                  <button className="text-xs bg-[var(--danger)] hover:bg-[var(--danger)]/80 px-2 py-1 rounded text-white">Supprimer</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Nom</label>
                  <input
                    type="text"
                    defaultValue={selectedSquad.name}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Domaine</label>
                  <input
                    type="text"
                    defaultValue={selectedSquad.domain}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>
            </div>

          {/* Context Documents */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--fg)]">📄 Documents de contexte (admin Arka)</h3>
              <button className="text-xs bg-[var(--success)] hover:bg-[var(--success)]/80 px-2 py-1 rounded text-white">+ Ajouter</button>
            </div>
            <div className="space-y-2">
              {mockContextDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded border border-[var(--border)]">
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked={doc.active} className="rounded" />
                    <span className={`px-2 py-1 rounded text-xs ${doc.active ? 'bg-[var(--success)]/20 text-[var(--success)]' : 'bg-[var(--muted)]/20 text-[var(--fgdim)]'}`}>
                      {doc.active ? 'Actif' : 'Inactif'}
                    </span>
                    <span className="text-[var(--fg)]">{doc.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-xs text-[var(--fgdim)] hover:text-[var(--fg)]">Éditer</button>
                    <button className="text-xs text-[var(--danger)] hover:text-[var(--danger)]/80">Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agents Assignment */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--fg)]">👥 AGENTS DE LA SQUAD</h3>
              <button className="text-xs bg-[var(--primary)] hover:bg-[var(--primary)]/80 px-2 py-1 rounded text-white">+ Ajouter</button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded border border-[var(--border)]">
                <div>
                  <div className="text-[var(--fg)] font-medium">RH</div>
                  <div className="text-sm text-[var(--fgdim)]">Nom agent (ex. Héloïse)</div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-xs bg-[var(--muted)] hover:bg-[var(--muted)]/80 px-2 py-1 rounded text-[var(--fg)]">Désactiver</button>
                  <button className="text-xs bg-[var(--danger)] hover:bg-[var(--danger)]/80 px-2 py-1 rounded text-white">Supprimer</button>
                </div>
              </div>
              <div className="text-center text-[var(--fgdim)] py-8 border border-[var(--border)] rounded border-dashed">
                Aucun agent encore — ajouter Héloïse, AGP, Analyste...
              </div>
            </div>
          </div>

          {/* Instructions Block */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--fg)]">⚡ INSTRUCTIONS RAPIDES (MINI-PROMPT)</h3>
              <button className="text-xs bg-[var(--accent)] hover:bg-[var(--accent)]/80 px-2 py-1 rounded text-white">Envoyer à la squad</button>
            </div>
            <div className="space-y-4">
              <div className="p-3 rounded border border-[var(--primary)]/30 bg-[var(--primary)]/10">
                <div className="text-sm text-[var(--primary)] mb-2">Ex: Héloïse → préparer agenda atelier (2h) + liste participants</div>
                <div className="flex justify-between text-xs text-[var(--fgdim)]">
                  <span>Historique local</span>
                  <span>Taille contenu: 1-3 phrases</span>
                </div>
              </div>
              <textarea
                rows={3}
                placeholder="Nouvelle instruction rapide..."
                className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
              />
              <div className="text-xs text-[var(--fgdim)]">
                Aucune instruction envoyée.
              </div>
            </div>
          </div>
        </div>

          {/* Right Panel - Squad Stats */}
          <div className="col-span-4 space-y-6">
            {/* Squad Stats */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">📊 Statistiques Squad</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[var(--fgdim)]">Agents actifs</span>
                  <span className="text-[var(--success)] font-medium">{selectedSquad.agents_count}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fgdim)]">Instructions envoyées</span>
                  <span className="text-[var(--primary)] font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fgdim)]">Projets assignés</span>
                  <span className="text-[var(--warn)] font-medium">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fgdim)]">Documents contexte</span>
                  <span className="text-[var(--accent)] font-medium">{mockContextDocs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fgdim)]">Statut</span>
                  <span className={`font-medium ${selectedSquad.status === 'active' ? 'text-[var(--success)]' : 'text-[var(--fgdim)]'}`}>
                    {selectedSquad.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">🔄 Activité récente</h3>
              <div className="space-y-3 text-sm">
                <div className="p-3 rounded border border-[var(--border)]">
                  <div className="text-[var(--fg)]">Agent Héloïse ajouté</div>
                  <div className="text-xs text-[var(--fgdim)]">Il y a 2 jours • {selectedSquad.name}</div>
                </div>
                <div className="p-3 rounded border border-[var(--border)]">
                  <div className="text-[var(--fg)]">Document contexte mis à jour</div>
                  <div className="text-xs text-[var(--fgdim)]">Il y a 1 semaine • context_entreprise.md</div>
                </div>
                <div className="p-3 rounded border border-[var(--border)]">
                  <div className="text-[var(--fg)]">Squad assignée au projet</div>
                  <div className="text-xs text-[var(--fgdim)]">Il y a 2 semaines • Journée Coworking Q4</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">⚡ Actions Rapides</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-2 rounded hover:bg-[var(--muted)]/10 text-sm text-[var(--fg)]">
                  👤 Ajouter un agent
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-[var(--muted)]/10 text-sm text-[var(--fg)]">
                  📄 Configurer contexte
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-[var(--muted)]/10 text-sm text-[var(--fg)]">
                  ⚡ Envoyer instruction
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-[var(--muted)]/10 text-sm text-[var(--fg)]">
                  📋 Voir les projets
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-[var(--muted)]/10 text-sm text-[var(--fg)]">
                  📊 Analytics détaillées
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AgentsSection() {
  const [selectedAgent, setSelectedAgent] = useState<any>(mockAgents[0]);
  const [createMode, setCreateMode] = useState(false);
  const [newAgent, setNewAgent] = useState({
    name: '',
    role: '',
    squad: '',
    status: 'active',
    prompt: '',
    temperature: 0.7,
    max_tokens: 2048
  });
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'system', content: 'Agent de test initialisé - Héloïse RH prête pour discussion.' }
  ]);
  const [testMessage, setTestMessage] = useState('');

  const sendTestMessage = () => {
    if (!testMessage.trim()) return;
    
    setChatMessages(prev => [
      ...prev,
      { role: 'user', content: testMessage },
      { role: 'agent', content: 'Réponse simulée de l\'agent...', streaming: true }
    ]);
    setTestMessage('');

    // Simulate response
    setTimeout(() => {
      setChatMessages(prev => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        newMessages[lastIndex] = {
          role: 'agent',
          content: `En tant qu'agent RH, voici ma réponse à votre demande : "${testMessage}". Je peux vous aider avec la gestion des plannings, l'organisation d'ateliers, et les processus RH.`,
          streaming: false
        };
        return newMessages;
      });
    }, 1500);
  }

  const handleCreateAgent = () => {
    if (!newAgent.name || !newAgent.role) {
      alert('Nom et rôle requis');
      return;
    }
    
    // Mock creation
    const agent = {
      id: mockAgents.length + 1,
      ...newAgent
    };
    
    mockAgents.push(agent);
    setSelectedAgent(agent);
    setCreateMode(false);
    setNewAgent({
      name: '',
      role: '',
      squad: '',
      status: 'active',
      prompt: '',
      temperature: 0.7,
      max_tokens: 2048
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--fg)]">👤 AGENTS - CRÉATION & ÉDITION</h2>
        <div className="flex space-x-3">
          {!createMode && (
            <select 
              className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--fg)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              value={selectedAgent?.id || ''}
              onChange={(e) => {
                const agent = mockAgents.find(a => a.id === parseInt(e.target.value));
                setSelectedAgent(agent);
              }}
            >
              {mockAgents.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.name}</option>
              ))}
            </select>
          )}
          <button 
            className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 px-4 py-2 rounded-lg transition-colors text-sm text-white"
            onClick={() => {
              setCreateMode(true);
              setSelectedAgent(null);
            }}
          >
            + Créer Agent
          </button>
        </div>
      </div>

      {createMode ? (
        // Create New Agent Mode
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--fg)]">👤 Nouvel Agent</h3>
                <div className="flex space-x-2">
                  <button 
                    className="text-xs bg-[var(--success)] hover:bg-[var(--success)]/80 px-2 py-1 rounded text-white"
                    onClick={handleCreateAgent}
                  >
                    Créer
                  </button>
                  <button 
                    className="text-xs bg-[var(--muted)] hover:bg-[var(--muted)]/80 px-2 py-1 rounded text-[var(--fg)]"
                    onClick={() => setCreateMode(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Nom de l'agent *</label>
                  <input
                    type="text"
                    value={newAgent.name}
                    onChange={(e) => setNewAgent({...newAgent, name: e.target.value})}
                    placeholder="ex. Héloïse"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Rôle *</label>
                  <input
                    type="text"
                    value={newAgent.role}
                    onChange={(e) => setNewAgent({...newAgent, role: e.target.value})}
                    placeholder="ex. Assistant RH"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Squad assignée</label>
                  <select 
                    value={newAgent.squad}
                    onChange={(e) => setNewAgent({...newAgent, squad: e.target.value})}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  >
                    <option value="">Aucune squad</option>
                    {mockSquads.map((squad) => (
                      <option key={squad.id} value={squad.name}>{squad.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Statut</label>
                  <select 
                    value={newAgent.status}
                    onChange={(e) => setNewAgent({...newAgent, status: e.target.value})}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Prompt spécifique à cet agent</label>
                <textarea
                  rows={4}
                  value={newAgent.prompt}
                  onChange={(e) => setNewAgent({...newAgent, prompt: e.target.value})}
                  placeholder="Tu es [Nom], [spécialité]. Tu maîtrises [compétences]. Tu es [personnalité]..."
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Température</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={newAgent.temperature}
                    onChange={(e) => setNewAgent({...newAgent, temperature: parseFloat(e.target.value)})}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Max tokens</label>
                  <input
                    type="number"
                    value={newAgent.max_tokens}
                    onChange={(e) => setNewAgent({...newAgent, max_tokens: parseInt(e.target.value)})}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-4 space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">ℹ️ Informations</h3>
              <div className="space-y-3 text-sm">
                <p className="text-[var(--fgdim)]">
                  <strong className="text-[var(--fg)]">Ordre logique :</strong><br/>
                  1. Créer l'agent<br/>
                  2. Configurer prompt et paramètres<br/>
                  3. Assigner à une squad<br/>
                  4. Tester et ajuster
                </p>
                <div className="mt-4 p-3 border border-[var(--primary)]/30 bg-[var(--primary)]/10 rounded">
                  <div className="text-xs text-[var(--primary)] font-medium mb-1">💡 Conseil</div>
                  <div className="text-xs text-[var(--fgdim)]">
                    Un bon prompt définit clairement la personnalité, les compétences et le contexte d'utilisation de l'agent.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : selectedAgent ? (
        // Edit Existing Agent Mode (keep existing content)
        <div className="grid grid-cols-12 gap-6">
        {/* Main Form - Agent Details */}
        <div className="col-span-8 space-y-6">
          {/* Agent Info */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[var(--fg)]">Informations Agent</h3>
              <div className="flex space-x-2">
                <span className={`px-2 py-1 rounded text-xs ${
                  selectedAgent?.status === 'active' ? 'bg-[var(--success)]/20 text-[var(--success)]' : 'bg-[var(--danger)]/20 text-[var(--danger)]'
                }`}>
                  {selectedAgent?.status}
                </span>
                <button className="text-xs bg-[var(--danger)] hover:bg-[var(--danger)]/80 px-2 py-1 rounded text-white">Supprimer</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Nom</label>
                <input
                  type="text"
                  defaultValue={selectedAgent?.name}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Rôle</label>
                <input
                  type="text"
                  defaultValue={selectedAgent?.role}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Squad assignée</label>
                <select className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]">
                  <option>Squad RH Alpha</option>
                  <option>Squad Tech Core</option>
                  <option>Aucune squad</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Statut</label>
                <select className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]">
                  <option>active</option>
                  <option>inactive</option>
                  <option>maintenance</option>
                </select>
              </div>
            </div>
          </div>

          {/* Agent Context Documents */}
          <div className="rounded-xl border border-gray-700 bg-gray-800/30 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">📄 Documents contexte spécifiques</h3>
              <button className="text-xs bg-green-600 hover:bg-green-500 px-2 py-1 rounded">+ Ajouter</button>
            </div>
            <div className="space-y-2">
              {mockAgentDocs.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded border border-gray-600">
                  <div className="flex items-center space-x-3">
                    <input type="checkbox" defaultChecked={doc.active} className="rounded" />
                    <span className={`px-2 py-1 rounded text-xs ${doc.active ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                      {doc.active ? 'Actif' : 'Inactif'}
                    </span>
                    <span className="text-white">{doc.name}</span>
                    <span className="text-xs text-gray-500">({doc.type})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="text-xs text-gray-400 hover:text-white">Éditer</button>
                    <button className="text-xs text-red-400 hover:text-red-300">Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Agent Instructions */}
          <div className="rounded-xl border border-gray-700 bg-gray-800/30 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">⚡ Instructions personnalisées</h3>
              <button className="text-xs bg-purple-600 hover:bg-purple-500 px-2 py-1 rounded">Sauvegarder</button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Prompt spécifique à cet agent</label>
                <textarea
                  rows={6}
                  defaultValue="Tu es Héloïse, assistante RH experte. Tu maîtrises la gestion d'équipes, l'organisation d'événements et les processus administratifs. Tu es bienveillante, organisée et proactive."
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Température</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    defaultValue="0.7"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max tokens</label>
                  <input
                    type="number"
                    defaultValue="2048"
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Test Chat */}
          <div className="rounded-xl border border-gray-700 bg-gray-800/30 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">💬 Chat de test en édition</h3>
              <button 
                className="text-xs bg-gray-600 hover:bg-gray-500 px-2 py-1 rounded"
                onClick={() => setChatMessages([{ role: 'system', content: 'Chat réinitialisé.' }])}
              >
                Vider chat
              </button>
            </div>
            
            {/* Chat Messages */}
            <div className="h-64 overflow-y-auto space-y-3 mb-4 p-3 bg-[var(--bg)] rounded border border-[var(--border)] scrollbar-invisible">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs rounded-lg p-3 ${
                    msg.role === 'user' 
                      ? 'bg-[var(--primary)] text-white' 
                      : msg.role === 'system'
                        ? 'bg-[var(--surface)] text-[var(--fgdim)] text-xs'
                        : 'bg-[var(--surface)] text-[var(--fg)]'
                  }`}>
                    <div className="text-xs opacity-70 mb-1">
                      {msg.role === 'user' ? 'Vous' : msg.role === 'system' ? 'System' : selectedAgent?.name}
                    </div>
                    <div>{msg.content}</div>
                    {msg.streaming && <div className="text-xs opacity-70 mt-1">En cours...</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="flex space-x-2">
              <input
                type="text"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendTestMessage()}
                placeholder="Tester l'agent..."
                className="flex-1 bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
              <button
                onClick={sendTestMessage}
                className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 px-4 py-2 rounded transition-colors text-white"
              >
                Envoyer
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="col-span-4 space-y-6">
          {/* Agent Stats */}
          <div className="rounded-xl border border-gray-700 bg-gray-800/30 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">📊 Statistiques Agent</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Messages traités</span>
                <span className="text-blue-400 font-medium">127</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Temps de réponse moy.</span>
                <span className="text-green-400 font-medium">1.2s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Taux de satisfaction</span>
                <span className="text-purple-400 font-medium">94%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Projets actifs</span>
                <span className="text-yellow-400 font-medium">2</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-gray-700 bg-gray-800/30 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">🔄 Activité récente</h3>
            <div className="space-y-3 text-sm">
              <div className="p-3 rounded border border-gray-600">
                <div className="text-white">Message traité</div>
                <div className="text-xs text-gray-400">Il y a 5 min • Projet Coworking</div>
              </div>
              <div className="p-3 rounded border border-gray-600">
                <div className="text-white">Instruction reçue</div>
                <div className="text-xs text-gray-400">Il y a 1h • Squad RH Alpha</div>
              </div>
              <div className="p-3 rounded border border-gray-600">
                <div className="text-white">Document mis à jour</div>
                <div className="text-xs text-gray-400">Il y a 3h • context_rh.md</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      ) : null}
    </div>
  );
}

function ProjetSection() {
  const [selectedProject, setSelectedProject] = useState<any>(mockProjects[0]);
  const [createMode, setCreateMode] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    client: '',
    status: 'active',
    priority: 'medium',
    budget: '',
    deadline: '',
    description: ''
  });

  const handleCreateProject = () => {
    if (!newProject.name || !newProject.client) {
      alert('Nom et client requis');
      return;
    }
    
    // Mock creation
    const project = {
      id: mockProjects.length + 1,
      ...newProject,
      created_at: new Date().toISOString(),
      assigned_squads: []
    };
    
    mockProjects.push(project);
    setSelectedProject(project);
    setCreateMode(false);
    setNewProject({
      name: '',
      client: '',
      status: 'active',
      priority: 'medium', 
      budget: '',
      deadline: '',
      description: ''
    });
  };

  const handleAssignSquad = (squadId: number) => {
    // Mock squad assignment
    if (selectedProject && !selectedProject.assigned_squads.includes(squadId)) {
      selectedProject.assigned_squads.push(squadId);
      setSelectedProject({...selectedProject});
    }
  };

  const handleUnassignSquad = (squadId: number) => {
    if (selectedProject) {
      selectedProject.assigned_squads = selectedProject.assigned_squads.filter((id: number) => id !== squadId);
      setSelectedProject({...selectedProject});
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--fg)]">📋 PROJETS - GESTION & ASSIGNATION</h2>
        <div className="flex space-x-3">
          <select 
            className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--fg)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            value={selectedProject?.id || ''}
            onChange={(e) => {
              const project = mockProjects.find(p => p.id === parseInt(e.target.value));
              setSelectedProject(project);
              setCreateMode(false);
            }}
          >
            {mockProjects.map((project) => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
          <button 
            className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 px-4 py-2 rounded-lg transition-colors text-sm text-white"
            onClick={() => {
              setCreateMode(true);
              setSelectedProject(null);
            }}
          >
            + Créer Projet
          </button>
        </div>
      </div>

      {createMode ? (
        // Create New Project Mode
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--fg)]">📋 Nouveau Projet</h3>
                <div className="flex space-x-2">
                  <button 
                    className="text-xs bg-[var(--success)] hover:bg-[var(--success)]/80 px-2 py-1 rounded text-white"
                    onClick={handleCreateProject}
                  >
                    Créer
                  </button>
                  <button 
                    className="text-xs bg-[var(--muted)] hover:bg-[var(--muted)]/80 px-2 py-1 rounded text-[var(--fg)]"
                    onClick={() => setCreateMode(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Nom du projet *</label>
                  <input
                    type="text"
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                    placeholder="ex. Journée Coworking Q4"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Client *</label>
                  <select 
                    value={newProject.client}
                    onChange={(e) => setNewProject({...newProject, client: e.target.value})}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  >
                    <option value="">Sélectionner un client</option>
                    {mockClients.map((client) => (
                      <option key={client.id} value={client.name}>{client.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Statut</label>
                  <select 
                    value={newProject.status}
                    onChange={(e) => setNewProject({...newProject, status: e.target.value})}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  >
                    <option value="active">Actif</option>
                    <option value="paused">En pause</option>
                    <option value="completed">Terminé</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Priorité</label>
                  <select 
                    value={newProject.priority}
                    onChange={(e) => setNewProject({...newProject, priority: e.target.value})}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  >
                    <option value="low">Basse</option>
                    <option value="medium">Moyenne</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Budget estimé</label>
                  <input
                    type="text"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({...newProject, budget: e.target.value})}
                    placeholder="ex. 15 000€"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Date limite</label>
                  <input
                    type="date"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({...newProject, deadline: e.target.value})}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Description</label>
                <textarea
                  rows={4}
                  value={newProject.description}
                  onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  placeholder="Description du projet, objectifs, livrables attendus..."
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>
          </div>
          <div className="col-span-4 space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">ℹ️ Informations</h3>
              <div className="space-y-3 text-sm">
                <p className="text-[var(--fgdim)]">
                  <strong className="text-[var(--fg)]">Ordre logique :</strong><br/>
                  1. Créer le projet<br/>
                  2. Assigner une ou plusieurs squads<br/>
                  3. Ajouter les documents clients<br/>
                  4. Lancer les instructions
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : selectedProject ? (
        // Edit Existing Project Mode
        <div className="grid grid-cols-12 gap-6">
          {/* Main Project Details */}
          <div className="col-span-8 space-y-6">
            {/* Basic Project Info */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--fg)]">📋 Informations Projet</h3>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    selectedProject.status === 'active' ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                    selectedProject.status === 'paused' ? 'bg-[var(--warn)]/20 text-[var(--warn)]' :
                    selectedProject.status === 'completed' ? 'bg-[var(--primary)]/20 text-[var(--primary)]' :
                    'bg-[var(--danger)]/20 text-[var(--danger)]'
                  }`}>
                    {selectedProject.status.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs border ${
                    selectedProject.priority === 'urgent' ? 'border-[var(--danger)] text-[var(--danger)]' :
                    selectedProject.priority === 'high' ? 'border-[var(--warn)] text-[var(--warn)]' :
                    selectedProject.priority === 'medium' ? 'border-[var(--primary)] text-[var(--primary)]' :
                    'border-[var(--muted)] text-[var(--fgdim)]'
                  }`}>
                    {selectedProject.priority.toUpperCase()}
                  </span>
                  <button className="text-xs bg-[var(--danger)] hover:bg-[var(--danger)]/80 px-2 py-1 rounded text-white">
                    Supprimer
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Nom</label>
                  <input
                    type="text"
                    defaultValue={selectedProject.name}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Client</label>
                  <input
                    type="text"
                    defaultValue={selectedProject.client}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Budget</label>
                  <input
                    type="text"
                    defaultValue={selectedProject.budget}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Date limite</label>
                  <input
                    type="date"
                    defaultValue={selectedProject.deadline}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Description</label>
                <textarea
                  rows={3}
                  defaultValue={selectedProject.description}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                />
              </div>
            </div>

            {/* Squad Assignment */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--fg)]">👥 SQUADS ASSIGNÉES</h3>
                <button className="text-xs bg-[var(--primary)] hover:bg-[var(--primary)]/80 px-2 py-1 rounded text-white">
                  + Assigner Squad
                </button>
              </div>
              <div className="space-y-3">
                {selectedProject.assigned_squads && selectedProject.assigned_squads.length > 0 ? (
                  selectedProject.assigned_squads.map((squadId: number) => {
                    const squad = mockSquads.find(s => s.id === squadId);
                    return squad ? (
                      <div key={squadId} className="flex items-center justify-between p-3 rounded border border-[var(--border)]">
                        <div className="flex items-center space-x-3">
                          <span className={`px-2 py-1 rounded text-xs ${squad.status === 'active' ? 'bg-[var(--success)]/20 text-[var(--success)]' : 'bg-[var(--muted)]/20 text-[var(--fgdim)]'}`}>
                            {squad.status}
                          </span>
                          <span className="text-[var(--fg)] font-medium">{squad.name}</span>
                          <span className="text-xs text-[var(--fgdim)]">({squad.domain})</span>
                          <span className="text-xs text-[var(--fgdim)]">{squad.agents_count} agents</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="text-xs text-[var(--primary)] hover:text-[var(--primary)]/80">
                            Voir détail
                          </button>
                          <button 
                            className="text-xs text-[var(--danger)] hover:text-[var(--danger)]/80"
                            onClick={() => handleUnassignSquad(squadId)}
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    ) : null;
                  })
                ) : (
                  <div className="text-center text-[var(--fgdim)] py-8 border border-[var(--border)] rounded border-dashed">
                    Aucune squad assignée — assigner Squad RH Alpha, Tech Core...
                  </div>
                )}
                
                {/* Available Squads for Assignment */}
                <div className="border-t border-[var(--border)] pt-4">
                  <div className="text-sm text-[var(--fgdim)] mb-3">Squads disponibles :</div>
                  <div className="flex flex-wrap gap-2">
                    {mockSquads.filter(squad => !selectedProject.assigned_squads?.includes(squad.id)).map((squad) => (
                      <button
                        key={squad.id}
                        onClick={() => handleAssignSquad(squad.id)}
                        className="text-xs bg-[var(--muted)]/20 hover:bg-[var(--primary)]/20 px-2 py-1 rounded border border-[var(--border)] hover:border-[var(--primary)] transition-colors"
                      >
                        + {squad.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Client Documents */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--fg)]">📄 DOCUMENTS CLIENT</h3>
                <button className="text-xs bg-[var(--success)] hover:bg-[var(--success)]/80 px-2 py-1 rounded text-white">
                  + Upload Document
                </button>
              </div>
              <div className="space-y-2">
                {selectedProject.client_documents?.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded border border-[var(--border)]">
                    <div className="flex items-center space-x-3">
                      <input type="checkbox" defaultChecked={doc.active} className="rounded" />
                      <span className={`px-2 py-1 rounded text-xs ${doc.active ? 'bg-[var(--success)]/20 text-[var(--success)]' : 'bg-[var(--muted)]/20 text-[var(--fgdim)]'}`}>
                        {doc.active ? 'Actif' : 'Inactif'}
                      </span>
                      <span className="text-[var(--fg)]">{doc.name}</span>
                      <span className="text-xs text-[var(--fgdim)]">({doc.type})</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-xs text-[var(--fgdim)] hover:text-[var(--fg)]">Télécharger</button>
                      <button className="text-xs text-[var(--primary)] hover:text-[var(--primary)]/80">Éditer</button>
                      <button className="text-xs text-[var(--danger)] hover:text-[var(--danger)]/80">Supprimer</button>
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-[var(--fgdim)] py-8 border border-[var(--border)] rounded border-dashed">
                    Aucun document — ajouter planning.xlsx, checklist.pdf, brief.docx...
                  </div>
                )}
              </div>
            </div>

            {/* Instructions & Communication */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--fg)]">⚡ INSTRUCTIONS PROJET</h3>
                <button className="text-xs bg-[var(--accent)] hover:bg-[var(--accent)]/80 px-2 py-1 rounded text-white">
                  Envoyer aux squads
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Instruction pour toutes les squads assignées</label>
                  <textarea
                    rows={3}
                    placeholder="ex. Préparer la journée coworking Q4 : organisation, logistique, communication..."
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--fgdim)]">
                  <span>Historique des instructions : 3 envoyées</span>
                  <span>Dernière instruction : il y a 2h</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Stats & Timeline */}
          <div className="col-span-4 space-y-6">
            {/* Project Stats */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">📊 Statistiques Projet</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[var(--fgdim)]">Squads assignées</span>
                  <span className="text-[var(--primary)] font-medium">{selectedProject.assigned_squads?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fgdim)]">Agents mobilisés</span>
                  <span className="text-[var(--success)] font-medium">
                    {selectedProject.assigned_squads?.reduce((total: number, squadId: number) => {
                      const squad = mockSquads.find(s => s.id === squadId);
                      return total + (squad?.agents_count || 0);
                    }, 0) || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fgdim)]">Instructions envoyées</span>
                  <span className="text-[var(--accent)] font-medium">8</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fgdim)]">Documents client</span>
                  <span className="text-[var(--warn)] font-medium">{selectedProject.client_documents?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fgdim)]">Progression</span>
                  <span className="text-[var(--success)] font-medium">65%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fgdim)]">Budget utilisé</span>
                  <span className="text-[var(--warn)] font-medium">7 500€ / {selectedProject.budget}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">📅 Timeline Projet</h3>
              <div className="space-y-3">
                <div className="border-l-2 border-[var(--primary)] pl-3 py-2">
                  <div className="text-sm text-[var(--fg)] font-medium">Projet créé</div>
                  <div className="text-xs text-[var(--fgdim)]">{new Date(selectedProject.created_at).toLocaleDateString()}</div>
                </div>
                <div className="border-l-2 border-[var(--success)] pl-3 py-2">
                  <div className="text-sm text-[var(--fg)] font-medium">Squad RH assignée</div>
                  <div className="text-xs text-[var(--fgdim)]">Il y a 5 jours</div>
                </div>
                <div className="border-l-2 border-[var(--warn)] pl-3 py-2">
                  <div className="text-sm text-[var(--fg)] font-medium">Documents uploadés</div>
                  <div className="text-xs text-[var(--fgdim)]">Il y a 3 jours</div>
                </div>
                <div className="border-l-2 border-[var(--accent)] pl-3 py-2">
                  <div className="text-sm text-[var(--fg)] font-medium">Instruction envoyée</div>
                  <div className="text-xs text-[var(--fgdim)]">Il y a 2h</div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">⚡ Actions Rapides</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-2 rounded hover:bg-[var(--muted)]/10 text-sm text-[var(--fg)]">
                  📝 Créer une instruction
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-[var(--muted)]/10 text-sm text-[var(--fg)]">
                  👥 Assigner une squad
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-[var(--muted)]/10 text-sm text-[var(--fg)]">
                  📄 Ajouter un document
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-[var(--muted)]/10 text-sm text-[var(--fg)]">
                  📊 Voir les métriques
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-[var(--muted)]/10 text-sm text-[var(--fg)]">
                  💬 Chat avec les squads
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ClientsSection() {
  const [selectedClient, setSelectedClient] = useState<any>(mockClients[0]);
  const [createMode, setCreateMode] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    sector: '',
    contact_person: '',
    email: '',
    phone: '',
    status: 'active'
  });

  const handleCreateClient = () => {
    if (!newClient.name || !newClient.contact_person) {
      alert('Nom et contact requis');
      return;
    }
    
    // Mock creation
    const client = {
      id: mockClients.length + 1,
      ...newClient
    };
    
    mockClients.push(client);
    setSelectedClient(client);
    setCreateMode(false);
    setNewClient({
      name: '',
      sector: '',
      contact_person: '',
      email: '',
      phone: '',
      status: 'active'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--fg)]">🏢 CLIENTS - GESTION & CONTACT</h2>
        <div className="flex space-x-3">
          {!createMode && (
            <select 
              className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--fg)] text-sm focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              value={selectedClient?.id || ''}
              onChange={(e) => {
                const client = mockClients.find(c => c.id === parseInt(e.target.value));
                setSelectedClient(client);
              }}
            >
              {mockClients.map((client) => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          )}
          <button 
            className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 px-4 py-2 rounded-lg transition-colors text-sm text-white"
            onClick={() => {
              setCreateMode(true);
              setSelectedClient(null);
            }}
          >
            + Nouveau Client
          </button>
        </div>
      </div>

      {createMode ? (
        // Create New Client Mode
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--fg)]">🏢 Nouveau Client</h3>
                <div className="flex space-x-2">
                  <button 
                    className="text-xs bg-[var(--success)] hover:bg-[var(--success)]/80 px-2 py-1 rounded text-white"
                    onClick={handleCreateClient}
                  >
                    Créer
                  </button>
                  <button 
                    className="text-xs bg-[var(--muted)] hover:bg-[var(--muted)]/80 px-2 py-1 rounded text-[var(--fg)]"
                    onClick={() => setCreateMode(false)}
                  >
                    Annuler
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Nom de l'entreprise *</label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    placeholder="ex. TechStart Inc"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Secteur d'activité</label>
                  <select 
                    value={newClient.sector}
                    onChange={(e) => setNewClient({...newClient, sector: e.target.value})}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  >
                    <option value="">Sélectionner un secteur</option>
                    <option value="Technologie">Technologie</option>
                    <option value="Services B2B">Services B2B</option>
                    <option value="Créatif & Design">Créatif & Design</option>
                    <option value="Banque & Finance">Banque & Finance</option>
                    <option value="Environnement">Environnement</option>
                    <option value="Santé">Santé</option>
                    <option value="Éducation">Éducation</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Contact principal *</label>
                  <input
                    type="text"
                    value={newClient.contact_person}
                    onChange={(e) => setNewClient({...newClient, contact_person: e.target.value})}
                    placeholder="ex. Marie Dubois"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Email</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    placeholder="marie@techstart.com"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Téléphone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    placeholder="+33 1 23 45 67 89"
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Statut</label>
                  <select 
                    value={newClient.status}
                    onChange={(e) => setNewClient({...newClient, status: e.target.value})}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="prospect">Prospect</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-4 space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">ℹ️ Informations</h3>
              <div className="space-y-3 text-sm">
                <p className="text-[var(--fgdim)]">
                  <strong className="text-[var(--fg)]">Gestion clients :</strong><br/>
                  1. Créer la fiche client<br/>
                  2. Associer aux projets<br/>
                  3. Gérer les documents<br/>
                  4. Suivre la relation
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : selectedClient ? (
        // Edit Existing Client Mode
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            {/* Client Info */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--fg)]">🏢 Informations Client</h3>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${selectedClient.status === 'active' ? 'bg-[var(--success)]/20 text-[var(--success)]' : selectedClient.status === 'prospect' ? 'bg-[var(--warn)]/20 text-[var(--warn)]' : 'bg-[var(--muted)]/20 text-[var(--fgdim)]'}`}>
                    {selectedClient.status.toUpperCase()}
                  </span>
                  <button className="text-xs bg-[var(--danger)] hover:bg-[var(--danger)]/80 px-2 py-1 rounded text-white">Supprimer</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Nom entreprise</label>
                  <input
                    type="text"
                    defaultValue={selectedClient.name}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Secteur</label>
                  <input
                    type="text"
                    defaultValue={selectedClient.sector}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Contact principal</label>
                  <input
                    type="text"
                    defaultValue={selectedClient.contact_person}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={selectedClient.email}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Téléphone</label>
                  <input
                    type="tel"
                    defaultValue={selectedClient.phone}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--fgdim)] mb-2">Statut</label>
                  <select 
                    defaultValue={selectedClient.status}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded px-3 py-2 text-[var(--fg)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
                  >
                    <option value="active">Actif</option>
                    <option value="inactive">Inactif</option>
                    <option value="prospect">Prospect</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Client Projects */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--fg)]">📋 PROJETS DU CLIENT</h3>
                <button className="text-xs bg-[var(--primary)] hover:bg-[var(--primary)]/80 px-2 py-1 rounded text-white">+ Créer Projet</button>
              </div>
              <div className="space-y-3">
                {mockProjects.filter(project => project.client === selectedClient.name).map((project) => (
                  <div key={project.id} className="flex items-center justify-between p-3 rounded border border-[var(--border)]">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        project.status === 'active' ? 'bg-[var(--success)]/20 text-[var(--success)]' :
                        project.status === 'paused' ? 'bg-[var(--warn)]/20 text-[var(--warn)]' :
                        project.status === 'completed' ? 'bg-[var(--primary)]/20 text-[var(--primary)]' :
                        'bg-[var(--danger)]/20 text-[var(--danger)]'
                      }`}>
                        {project.status}
                      </span>
                      <span className="text-[var(--fg)] font-medium">{project.name}</span>
                      <span className="text-xs text-[var(--fgdim)]">{project.budget}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-xs text-[var(--primary)] hover:text-[var(--primary)]/80">Voir</button>
                      <button className="text-xs text-[var(--fgdim)] hover:text-[var(--fg)]">Éditer</button>
                    </div>
                  </div>
                ))}
                {mockProjects.filter(project => project.client === selectedClient.name).length === 0 && (
                  <div className="text-center text-[var(--fgdim)] py-8 border border-[var(--border)] rounded border-dashed">
                    Aucun projet — créer un nouveau projet pour ce client
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="col-span-4 space-y-6">
            {/* Client Stats */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">📊 Statistiques Client</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-[var(--fgdim)]">Projets actifs</span>
                  <span className="text-[var(--success)] font-medium">
                    {mockProjects.filter(p => p.client === selectedClient.name && p.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fgdim)]">Projets terminés</span>
                  <span className="text-[var(--primary)] font-medium">
                    {mockProjects.filter(p => p.client === selectedClient.name && p.status === 'completed').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fgdim)]">Budget total</span>
                  <span className="text-[var(--warn)] font-medium">
                    {mockProjects.filter(p => p.client === selectedClient.name)
                      .reduce((total, project) => total + parseInt(project.budget.replace(/[^\d]/g, '')), 0).toLocaleString()}€
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--fgdim)]">Secteur</span>
                  <span className="text-[var(--fg)] font-medium">{selectedClient.sector}</span>
                </div>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <h3 className="text-lg font-semibold text-[var(--fg)] mb-4">📞 Contact</h3>
              <div className="space-y-2">
                <button className="w-full text-left p-2 rounded hover:bg-[var(--muted)]/10 text-sm text-[var(--fg)]">
                  📧 Envoyer un email
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-[var(--muted)]/10 text-sm text-[var(--fg)]">
                  📞 Planifier un appel
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-[var(--muted)]/10 text-sm text-[var(--fg)]">
                  📋 Créer un projet
                </button>
                <button className="w-full text-left p-2 rounded hover:bg-[var(--muted)]/10 text-sm text-[var(--fg)]">
                  📄 Exporter les données
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function AnalyticsSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[var(--fg)]">📊 Analytics</h2>
      </div>
      
      <div className="text-[var(--fgdim)]">
        Section Analytics - En cours de développement...
      </div>
    </div>
  );
}

// Mock Data
const mockSquads = [
  {
    id: 1,
    name: 'Squad RH Alpha',
    domain: 'RH',
    status: 'active' as const,
    agents_count: 5
  },
  {
    id: 2,
    name: 'Squad Tech Core',
    domain: 'Tech',
    status: 'active' as const,
    agents_count: 8
  },
  {
    id: 3,
    name: 'Squad Marketing Beta',
    domain: 'Marketing',
    status: 'inactive' as const,
    agents_count: 3
  }
];

const mockContextDocs = [
  {
    id: 1,
    name: 'context_entreprise.md',
    active: true,
    type: 'mission'
  },
  {
    id: 2,
    name: 'scope_intervention.md',
    active: true,
    type: 'périmètre'
  },
  {
    id: 3,
    name: 'roles_responsabilites.md',
    active: false,
    type: 'rôle'
  },
  {
    id: 4,
    name: 'output_template.md',
    active: true,
    type: 'squelette'
  }
];

const mockClientDocs = [
  {
    id: 1,
    name: 'planning.xlsx',
    active: true
  },
  {
    id: 2,
    name: 'checklist_materiel.pdf',
    active: true
  },
  {
    id: 3,
    name: 'budget_previsionnel.pdf',
    active: false
  }
];

const mockAgents = [
  {
    id: 1,
    name: 'Héloïse',
    role: 'Assistant RH',
    status: 'active',
    squad: 'Squad RH Alpha'
  },
  {
    id: 2,
    name: 'AGP',
    role: 'Analyste Tech',
    status: 'active',
    squad: 'Squad Tech Core'
  },
  {
    id: 3,
    name: 'Marketing Pro',
    role: 'Content Manager',
    status: 'inactive',
    squad: 'Squad Marketing Beta'
  }
];

const mockAgentDocs = [
  {
    id: 1,
    name: 'context_rh_heloise.md',
    active: true,
    type: 'personnalité'
  },
  {
    id: 2,
    name: 'processus_recrutement.md',
    active: true,
    type: 'processus'
  },
  {
    id: 3,
    name: 'templates_emails_rh.md',
    active: false,
    type: 'template'
  }
];

// Mock Projects Data
const mockProjects = [
  {
    id: 1,
    name: 'Journée Coworking Q4',
    client: 'TechStart Inc',
    status: 'active',
    priority: 'high',
    budget: '15 000€',
    deadline: '2024-12-15',
    description: 'Organisation d\'une journée coworking pour renforcer la cohésion d\'équipe et favoriser l\'innovation collaborative.',
    created_at: '2024-11-01T10:00:00Z',
    assigned_squads: [1], // Squad RH Alpha
    client_documents: [
      {
        id: 1,
        name: 'planning_coworking.xlsx',
        active: true,
        type: 'planning'
      },
      {
        id: 2,
        name: 'checklist_materiel.pdf',
        active: true,
        type: 'logistique'
      },
      {
        id: 3,
        name: 'budget_previsionnel.pdf',
        active: true,
        type: 'budget'
      }
    ]
  },
  {
    id: 2,
    name: 'Migration Cloud Azure',
    client: 'Enterprise Corp',
    status: 'active',
    priority: 'urgent',
    budget: '85 000€',
    deadline: '2024-11-30',
    description: 'Migration complète de l\'infrastructure vers Azure avec optimisation des coûts et mise en place des bonnes pratiques DevOps.',
    created_at: '2024-10-15T09:00:00Z',
    assigned_squads: [2], // Squad Tech Core
    client_documents: [
      {
        id: 4,
        name: 'architecture_actuelle.docx',
        active: true,
        type: 'technique'
      },
      {
        id: 5,
        name: 'specifications_azure.pdf',
        active: true,
        type: 'specifications'
      },
      {
        id: 6,
        name: 'timeline_migration.mpp',
        active: true,
        type: 'planning'
      }
    ]
  },
  {
    id: 3,
    name: 'Campagne Brand Awareness',
    client: 'Creative Studio',
    status: 'paused',
    priority: 'medium',
    budget: '25 000€',
    deadline: '2025-02-28',
    description: 'Développement d\'une stratégie de marque complète avec création de contenu multi-canal et campagnes digitales.',
    created_at: '2024-09-20T14:30:00Z',
    assigned_squads: [3], // Squad Marketing Beta
    client_documents: [
      {
        id: 7,
        name: 'brief_client.pdf',
        active: true,
        type: 'brief'
      },
      {
        id: 8,
        name: 'personas_cibles.pptx',
        active: true,
        type: 'marketing'
      }
    ]
  },
  {
    id: 4,
    name: 'Audit Sécurité IT',
    client: 'SecureBank',
    status: 'completed',
    priority: 'high',
    budget: '45 000€',
    deadline: '2024-10-31',
    description: 'Audit complet de sécurité avec test de pénétration et recommandations de mise en conformité RGPD.',
    created_at: '2024-08-01T08:00:00Z',
    assigned_squads: [2], // Squad Tech Core
    client_documents: [
      {
        id: 9,
        name: 'perimetre_audit.docx',
        active: true,
        type: 'scope'
      },
      {
        id: 10,
        name: 'rapport_final.pdf',
        active: true,
        type: 'livrable'
      }
    ]
  }
];

// Mock Clients Data
const mockClients = [
  {
    id: 1,
    name: 'TechStart Inc',
    sector: 'Technologie',
    contact_person: 'Marie Dubois',
    email: 'marie.dubois@techstart.com',
    phone: '+33 1 23 45 67 89',
    status: 'active'
  },
  {
    id: 2,
    name: 'Enterprise Corp',
    sector: 'Services B2B',
    contact_person: 'Jean Martin',
    email: 'j.martin@enterprise-corp.fr',
    phone: '+33 1 98 76 54 32',
    status: 'active'
  },
  {
    id: 3,
    name: 'Creative Studio',
    sector: 'Créatif & Design',
    contact_person: 'Sophie Laurent',
    email: 'sophie@creativestudio.com',
    phone: '+33 1 11 22 33 44',
    status: 'active'
  },
  {
    id: 4,
    name: 'SecureBank',
    sector: 'Banque & Finance',
    contact_person: 'Pierre Moreau',
    email: 'p.moreau@securebank.fr',
    phone: '+33 1 55 66 77 88',
    status: 'active'
  },
  {
    id: 5,
    name: 'GreenTech Solutions',
    sector: 'Environnement',
    contact_person: 'Laura Chen',
    email: 'laura.chen@greentech.eco',
    phone: '+33 1 44 55 66 77',
    status: 'active'
  }
];