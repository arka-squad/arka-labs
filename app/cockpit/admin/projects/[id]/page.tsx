'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Trash2, Users, Target, Calendar, DollarSign, Flag, Briefcase, Building, User, Clock, Activity, Mail } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AdminNavigation from '../../components/AdminNavigation';
import AdminProtection from '../../components/AdminProtection';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface ProjectDetails {
  id: string; // UUID format
  name: string;
  description: string;
  client_id: string;
  client_name: string;
  client_sector: string;
  client_size: string;
  budget?: number;
  deadline?: string;
  priority: string;
  status: string;
  tags: string[];
  requirements: string[];
  agents_assigned: number;
  squads_assigned: number;
  estimated_cost: number;
  budget_utilization_percent: number;
  deadline_status: string;
  days_remaining?: number;
  total_duration_days?: number;
  assigned_agents: any[];
  assigned_squads: any[];
  recent_activity: any[];
  created_at: string;
  updated_at: string;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  normal: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  on_hold: 'bg-yellow-100 text-yellow-800',
  paused: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-red-100 text-red-800'
};

const deadlineStatusColors = {
  no_deadline: 'bg-gray-100 text-gray-800',
  ok: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  critical: 'bg-orange-100 text-orange-800',
  overdue: 'bg-red-100 text-red-800'
};

const statusLabels = {
  draft: 'Brouillon',
  active: 'Actif',
  on_hold: 'En pause',
  completed: 'Terminé',
  cancelled: 'Annulé'
};

const deadlineStatusLabels = {
  no_deadline: 'Aucune échéance',
  ok: 'Dans les temps',
  warning: 'Attention',
  critical: 'Critique',
  overdue: 'En retard'
};

export default function AdminProjectDetailPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetch(`/api/admin/projects/${projectId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Projet introuvable');
          } else {
            throw new Error('Erreur lors du chargement');
          }
          return;
        }
        const data = await response.json();
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  if (loading) {
    return (
    <AdminProtection allowedRoles={['admin', 'manager']}>
            <div className="min-h-screen console-theme flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </AdminProtection>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen console-theme flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error || 'Projet introuvable'}</div>
          <Link href="/cockpit/admin/projects" className="text-blue-400 hover:text-blue-300">
            ← Retour aux projets
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'null' || dateString === 'undefined') {
      return 'Aucune échéance';
    }
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <AdminProtection allowedRoles={['admin', 'manager']}>
      <div className="min-h-screen console-theme">
      {/* Admin Navigation */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <AdminNavigation />
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/cockpit/admin/projects"
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <p className="text-sm text-gray-300 mt-1">
                Projet · {project.client_name} · Créé le {formatDate(project.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/cockpit/admin/projects/${project.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </Link>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Statut</p>
                  <p className="text-2xl font-semibold text-white mt-2">{statusLabels[project.status as keyof typeof statusLabels] || project.status}</p>
                </div>
                <Target className="w-8 h-8 text-blue-400" />
              </div>
              <div className="mt-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[project.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                  {statusLabels[project.status as keyof typeof statusLabels] || project.status}
                </span>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Agents assignés</p>
                  <p className="text-2xl font-semibold text-white mt-2">{project.agents_assigned}</p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-sm text-gray-400 mt-4">
                {project.squads_assigned} squad{project.squads_assigned > 1 ? 's' : ''} assignée{project.squads_assigned > 1 ? 's' : ''}
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Budget</p>
                  <p className="text-2xl font-semibold text-white mt-2">
                    {project.budget ? formatCurrency(project.budget) : 'Non défini'}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
              {project.budget && (
                <p className="text-sm text-gray-400 mt-4">
                  Utilisation: {(project.budget_utilization_percent || 0).toFixed(1)}%
                </p>
              )}
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Échéance</p>
                  <p className="text-2xl font-semibold text-white mt-2">
                    {project.deadline && project.deadline !== 'null' ? formatDate(project.deadline) : 'Aucune échéance'}
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-400" />
              </div>
              {project.deadline_status && (
                <div className="mt-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${deadlineStatusColors[project.deadline_status as keyof typeof deadlineStatusColors]}`}>
                    {deadlineStatusLabels[project.deadline_status as keyof typeof deadlineStatusLabels] || project.deadline_status}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Project Details */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-gray-400" />
                    Détails du projet
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Description</h3>
                    <p className="text-white">{project.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Priorité</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[project.priority as keyof typeof priorityColors]}`}>
                        {project.priority}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Date limite</h3>
                      <p className="text-white">{formatDate(project.deadline)}</p>
                    </div>
                  </div>

                  {project.tags && project.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {project.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {project.requirements && project.requirements.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Exigences techniques</h3>
                      <ul className="space-y-1">
                        {project.requirements.map((req, index) => (
                          <li key={index} className="text-white text-sm flex items-start gap-2">
                            <span className="w-1 h-1 bg-blue-400 rounded-full mt-2"></span>
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Assigned Agents */}
              {project.assigned_agents && project.assigned_agents.length > 0 && (
                <div className="bg-gray-800 rounded-lg border border-gray-700">
                  <div className="p-6 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-400" />
                      Agents assignés ({project.assigned_agents?.length || 0})
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {project.assigned_agents.map((agent) => (
                        <div key={agent.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <User className="w-8 h-8 text-gray-400" />
                            <div>
                              <p className="font-medium text-white">{agent.name}</p>
                              <p className="text-sm text-gray-400">{agent.role} · {agent.domaine}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">Score: {agent.performance_score}%</p>
                            <p className="text-xs text-gray-500">{agent.total_projects} projet{agent.total_projects > 1 ? 's' : ''}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Client Info */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-gray-400" />
                    Client
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-white">{project.client_name}</p>
                      <p className="text-sm text-gray-400">{project.client_sector}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Taille: {project.client_size}</p>
                    </div>
                    <Link 
                      href={`/cockpit/admin/clients/${project.client_id}`}
                      className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                    >
                      Voir le client →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              {project.recent_activity && project.recent_activity.length > 0 && (
                <div className="bg-gray-800 rounded-lg border border-gray-700">
                  <div className="p-6 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-gray-400" />
                      Activité récente
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {project.recent_activity.slice(0, 5).map((activity, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <Clock className="w-4 h-4 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm text-white">{activity.activity_subject}</p>
                            <p className="text-xs text-gray-400">
                              {formatDate(activity.activity_date)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions rapides */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-lg font-semibold text-white">Actions rapides</h2>
                </div>
                <div className="p-6 space-y-3">
                  <Link
                    href={`/cockpit/admin/projects/new?client=${project.client_id}`}
                    className="flex items-center gap-2 w-full p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
                  >
                    <Briefcase className="w-4 h-4" />
                    Créer un projet
                  </Link>
                  <Link
                    href={`/cockpit/admin/clients/${project.client_id}/edit`}
                    className="flex items-center gap-2 w-full p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier le client
                  </Link>
                  <a
                    href={`mailto:${project.client_name}@example.com`}
                    className="flex items-center gap-2 w-full p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
                  >
                    <Mail className="w-4 h-4" />
                    Envoyer un email
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AdminProtection>
  );
}