"use client";

import React, { useState, useEffect } from 'react';
import Leftbar from '../../components/leftbar';
import ChatDock from '../../components/ChatDock';
import { 
  Activity, Users, Briefcase, Building2, BarChart3, 
  Plus, Search, Filter, Calendar, AlertCircle, 
  CheckCircle, Clock, Zap, Target, TrendingUp
} from 'lucide-react';

// Types selon les spécifications B23
interface Projet {
  id: number;
  nom: string;
  client: {
    id: string;
    nom: string;
    secteur: string;
  };
  statut: 'actif' | 'inactif' | 'archive' | 'termine';
  priorite: 'basse' | 'normale' | 'haute' | 'urgente';
  budget?: number;
  deadline?: string;
  agents_count: number;
  squads_count: number;
  deadline_alert?: 'ok' | 'proche' | 'depassee';
  created_at: string;
}

interface Client {
  id: string;
  nom: string;
  secteur: string;
  taille: 'TPE' | 'PME' | 'ETI' | 'GE';
  projets_count: number;
  projets_actifs: number;
  budget_total: number;
  statut: 'actif' | 'inactif' | 'archive';
}

interface Agent {
  id: string;
  name: string;
  domaine: string;
  version: string;
  is_template: boolean;
  projets_actifs: number;
  projets_total: number;
  performance_score: number;
}

export default function BackofficePage() {
  // Navigation state
  const [leftbarNav, setLeftbarNav] = useState<'dashboard'|'roadmap'|'builder'|'gouv'|'docdesk'|'docs'|'observa'|'obs'|'runs'|'roster'>('dashboard');
  const [activeSection, setActiveSection] = useState<'projets' | 'clients' | 'agents' | 'analytics'>('projets');
  
  // Data states
  const [projets, setProjets] = useState<Projet[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Projet | null>(null);

  // Leftbar configuration pour le backoffice
  const leftbarItems = [
    { id: 'dashboard' as const, label: 'Dashboard' },
    { id: 'roadmap' as const, label: 'Projets' },
    { id: 'builder' as const, label: 'Clients' },
    { id: 'gouv' as const, label: 'Agents' },
    { id: 'docs' as const, label: 'Analytics' }
  ];

  // Load initial data
  useEffect(() => {
    loadData();
  }, [activeSection]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeSection === 'projets') {
        const response = await fetch('/api/backoffice/projets');
        const data = await response.json();
        setProjets(data.items || []);
      } else if (activeSection === 'clients') {
        const response = await fetch('/api/backoffice/clients');
        const data = await response.json();
        setClients(data.items || []);
      } else if (activeSection === 'agents') {
        const response = await fetch('/api/backoffice/agents');
        const data = await response.json();
        setAgents(data.items || []);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Navigation handler
  const handleLeftbarChange = (nav: typeof leftbarNav) => {
    setLeftbarNav(nav);
    switch (nav) {
      case 'dashboard':
        setActiveSection('projets');
        break;
      case 'roadmap':
        setActiveSection('projets');
        break;
      case 'builder':
        setActiveSection('clients');
        break;
      case 'gouv':
        setActiveSection('agents');
        break;
      case 'docs':
        setActiveSection('analytics');
        break;
    }
  };

  // Priority badge colors
  const getPriorityBadge = (priorite: string) => {
    const colors = {
      'basse': 'bg-gray-100 text-gray-800',
      'normale': 'bg-blue-100 text-blue-800',
      'haute': 'bg-orange-100 text-orange-800',
      'urgente': 'bg-red-100 text-red-800'
    };
    return colors[priorite] || colors['normale'];
  };

  // Status badge colors
  const getStatusBadge = (statut: string) => {
    const colors = {
      'actif': 'bg-green-100 text-green-800',
      'inactif': 'bg-gray-100 text-gray-800',
      'archive': 'bg-purple-100 text-purple-800',
      'termine': 'bg-blue-100 text-blue-800'
    };
    return colors[statut] || colors['actif'];
  };

  // Deadline alert colors
  const getDeadlineAlert = (alert?: string) => {
    if (alert === 'depassee') return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (alert === 'proche') return <Clock className="w-4 h-4 text-orange-500" />;
    return <CheckCircle className="w-4 h-4 text-green-500" />;
  };

  // Render Dashboard Section
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* KPIs Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--fgdim)]">Projets Actifs</p>
              <p className="text-2xl font-semibold text-[var(--fg)]">
                {projets.filter(p => p.statut === 'actif').length}
              </p>
            </div>
            <Target className="w-8 h-8 text-[var(--primary)]" />
          </div>
        </div>
        
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--fgdim)]">Clients</p>
              <p className="text-2xl font-semibold text-[var(--fg)]">
                {clients.filter(c => c.statut === 'actif').length}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-[var(--success)]" />
          </div>
        </div>
        
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--fgdim)]">Agents Mobilisés</p>
              <p className="text-2xl font-semibold text-[var(--fg)]">
                {projets.reduce((sum, p) => sum + p.agents_count, 0)}
              </p>
            </div>
            <Users className="w-8 h-8 text-[var(--accent)]" />
          </div>
        </div>
        
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--fgdim)]">Alertes</p>
              <p className="text-2xl font-semibold text-[var(--fg)]">
                {projets.filter(p => p.deadline_alert === 'proche' || p.deadline_alert === 'depassee').length}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-[var(--warn)]" />
          </div>
        </div>
      </div>

      {/* Projets Récents */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg">
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[var(--fg)]">Projets Récents</h2>
            <button
              onClick={() => setActiveSection('projets')}
              className="text-sm text-[var(--primary)] hover:underline"
            >
              Voir tous
            </button>
          </div>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {projets.slice(0, 5).map(projet => (
            <div key={projet.id} className="p-4 hover:bg-[var(--bg)] cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-medium text-[var(--fg)]">{projet.nom}</h3>
                    <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(projet.statut)}`}>
                      {projet.statut}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${getPriorityBadge(projet.priorite)}`}>
                      {projet.priorite}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--fgdim)] mt-1">
                    {projet.client.nom} • {projet.agents_count} agents
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {getDeadlineAlert(projet.deadline_alert)}
                  {projet.deadline && (
                    <span className="text-sm text-[var(--fgdim)]">
                      {new Date(projet.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Projects Section
  const renderProjets = () => (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--fg)]">📋 Projets</h1>
          <p className="text-[var(--fgdim)] mt-1">Gestion des projets clients avec squads et agents assignés</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:opacity-90"
        >
          <Plus className="w-4 h-4" />
          <span>Créer Projet</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--fgdim)]" />
            <input
              type="text"
              placeholder="Rechercher des projets..."
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--fg)]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--fg)]"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tous les statuts</option>
            <option value="actif">Actif</option>
            <option value="inactif">Inactif</option>
            <option value="archive">Archivé</option>
            <option value="termine">Terminé</option>
          </select>
          <select
            className="bg-[var(--bg)] border border-[var(--border)] rounded-lg px-3 py-2 text-[var(--fg)]"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">Toutes priorités</option>
            <option value="urgente">Urgente</option>
            <option value="haute">Haute</option>
            <option value="normale">Normale</option>
            <option value="basse">Basse</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--bg)] border-b border-[var(--border)]">
              <tr>
                <th className="text-left p-4 font-medium text-[var(--fg)]">Projet</th>
                <th className="text-left p-4 font-medium text-[var(--fg)]">Client</th>
                <th className="text-left p-4 font-medium text-[var(--fg)]">Statut</th>
                <th className="text-left p-4 font-medium text-[var(--fg)]">Priorité</th>
                <th className="text-left p-4 font-medium text-[var(--fg)]">Agents</th>
                <th className="text-left p-4 font-medium text-[var(--fg)]">Deadline</th>
                <th className="text-left p-4 font-medium text-[var(--fg)]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[var(--fgdim)]">
                    Chargement des projets...
                  </td>
                </tr>
              ) : projets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[var(--fgdim)]">
                    Aucun projet trouvé
                  </td>
                </tr>
              ) : (
                projets.map(projet => (
                  <tr key={projet.id} className="hover:bg-[var(--bg)] cursor-pointer">
                    <td className="p-4">
                      <div>
                        <h3 className="font-medium text-[var(--fg)]">{projet.nom}</h3>
                        <p className="text-sm text-[var(--fgdim)]">ID #{projet.id}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-[var(--fg)]">{projet.client.nom}</p>
                        <p className="text-sm text-[var(--fgdim)]">{projet.client.secteur}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded ${getStatusBadge(projet.statut)}`}>
                        {projet.statut}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 text-xs rounded ${getPriorityBadge(projet.priorite)}`}>
                        {projet.priorite}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-[var(--fgdim)]" />
                        <span className="text-[var(--fg)]">{projet.agents_count}</span>
                        {projet.squads_count > 0 && (
                          <span className="text-xs text-[var(--fgdim)]">
                            ({projet.squads_count} squads)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        {getDeadlineAlert(projet.deadline_alert)}
                        <span className="text-sm text-[var(--fg)]">
                          {projet.deadline 
                            ? new Date(projet.deadline).toLocaleDateString()
                            : '-'
                          }
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setSelectedProject(projet)}
                        className="text-[var(--primary)] hover:underline text-sm"
                      >
                        Éditer
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Render Clients Section (simplifié)
  const renderClients = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--fg)]">🏢 Clients</h1>
        <button className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Nouveau Client</span>
        </button>
      </div>
      
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-8 text-center">
        <Building2 className="w-12 h-12 mx-auto text-[var(--fgdim)] mb-4" />
        <p className="text-[var(--fgdim)]">Section clients en cours de développement...</p>
      </div>
    </div>
  );

  // Render Agents Section (simplifié)
  const renderAgents = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-[var(--fg)]">👤 Agents</h1>
        <button className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Créer Agent</span>
        </button>
      </div>
      
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-8 text-center">
        <Users className="w-12 h-12 mx-auto text-[var(--fgdim)] mb-4" />
        <p className="text-[var(--fgdim)]">Section agents en cours de développement...</p>
      </div>
    </div>
  );

  // Render Analytics Section
  const renderAnalytics = () => (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-[var(--fg)]">📊 Analytics</h1>
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-8 text-center">
        <BarChart3 className="w-12 h-12 mx-auto text-[var(--fgdim)] mb-4" />
        <p className="text-[var(--fgdim)]">Section analytics en cours de développement...</p>
      </div>
    </div>
  );

  // Render current section
  const renderCurrentSection = () => {
    if (activeSection === 'projets' && leftbarNav === 'dashboard') return renderDashboard();
    if (activeSection === 'projets') return renderProjets();
    if (activeSection === 'clients') return renderClients();
    if (activeSection === 'agents') return renderAgents();
    if (activeSection === 'analytics') return renderAnalytics();
    return renderDashboard();
  };

  return (
    <div className="flex h-full overflow-hidden">
      <Leftbar 
        items={leftbarItems}
        value={leftbarNav}
        onChange={handleLeftbarChange}
        unread={3}
        presence="online"
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 flex overflow-hidden">
          <div className="flex-1 overflow-y-auto bg-[var(--bg)] scrollbar-invisible p-6">
            {renderCurrentSection()}
          </div>
          
          <ChatDock 
            title="Assistant Backoffice"
            placeholder="Demandez de l'aide pour gérer vos projets, clients ou agents..."
            className="w-80 shrink-0"
          />
        </main>
      </div>
    </div>
  );
}