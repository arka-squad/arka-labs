'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Users, Target, Building, Activity, Plus, Settings, User, Clock, MessageSquare } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import AdminNavigation from '../../components/AdminNavigation';
import AdminProtection from '../../components/AdminProtection';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface SquadDetails {
  id: string;
  name: string;
  slug: string;
  mission: string;
  domain: string;
  status: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  members: Array<{
    id: string;
    name: string;
    role: string;
    domain: string;
    status: string;
    joined_at: string;
    performance_score?: number;
  }>;
  recent_instructions: Array<{
    id: string;
    instruction: string;
    created_at: string;
    created_by: string;
  }>;
  performance_metrics?: {
    avg_performance: number;
    total_instructions: number;
    active_members: number;
  };
}

const domainIcons = {
  'Tech': '🚀',
  'RH': '👥', 
  'Marketing': '📈',
  'Finance': '💰',
  'Ops': '⚙️'
};

const statusColors = {
  'active': 'bg-green-100 text-green-800',
  'inactive': 'bg-yellow-100 text-yellow-800',
  'archived': 'bg-gray-100 text-gray-800'
};

const statusLabels = {
  'active': 'Actif',
  'inactive': 'Inactif',
  'archived': 'Archivé'
};

export default function AdminSquadDetailPage() {
  const router = useRouter();
  const params = useParams();
  const squadId = params.id as string;
  
  const [squad, setSquad] = useState<SquadDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSquad = async () => {
      try {
        const response = await fetch(`/api/admin/squads/${squadId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Squad introuvable');
          } else {
            throw new Error('Erreur lors du chargement');
          }
          return;
        }
        const data = await response.json();
        setSquad(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    if (squadId) {
      fetchSquad();
    }
  }, [squadId]);

  if (loading) {
    return (
    <AdminProtection allowedRoles={['admin', 'manager']}>
            <div className="min-h-screen console-theme flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </AdminProtection>
    );
  }

  if (error || !squad) {
    return (
      <div className="min-h-screen console-theme flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error || 'Squad introuvable'}</div>
          <Link href="/cockpit/admin/squads" className="text-blue-400 hover:text-blue-300">
            ← Retour aux squads
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen console-theme">
      {/* Admin Navigation */}
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <AdminNavigation />
        
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/cockpit/admin/squads"
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="text-2xl">
                  {domainIcons[squad.domain as keyof typeof domainIcons] || '👥'}
                </span>
                {squad.name}
              </h1>
              <p className="text-sm text-gray-300 mt-1">
                Squad {squad.domain} · {squad.slug} · Créée le {formatDate(squad.created_at)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={`/cockpit/admin/squads/${squad.id}/members`}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Gérer les membres
            </Link>
            <Link
              href={`/cockpit/admin/squads/${squad.id}/edit`}
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
                  <p className="text-2xl font-semibold text-white mt-2">{statusLabels[squad.status as keyof typeof statusLabels] || squad.status}</p>
                </div>
                <Target className="w-8 h-8 text-blue-400" />
              </div>
              <div className="mt-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[squad.status as keyof typeof statusColors]}`}>
                  {statusLabels[squad.status as keyof typeof statusLabels] || squad.status}
                </span>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Membres actifs</p>
                  <p className="text-2xl font-semibold text-white mt-2">
                    {squad.members?.filter(m => m.status === 'active').length || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-green-400" />
              </div>
              <p className="text-sm text-gray-400 mt-4">
                {squad.members?.length || 0} membre{(squad.members?.length || 0) > 1 ? 's' : ''} total
              </p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Performance</p>
                  <p className="text-2xl font-semibold text-white mt-2">
                    {squad.performance_metrics?.avg_performance || 0}%
                  </p>
                </div>
                <Activity className="w-8 h-8 text-yellow-400" />
              </div>
              <p className="text-sm text-gray-400 mt-4">Score moyen</p>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Instructions</p>
                  <p className="text-2xl font-semibold text-white mt-2">
                    {squad.performance_metrics?.total_instructions || 0}
                  </p>
                </div>
                <MessageSquare className="w-8 h-8 text-purple-400" />
              </div>
              <p className="text-sm text-gray-400 mt-4">Envoyées</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Squad Details */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-gray-400" />
                    Détails de la squad
                  </h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2">Mission</h3>
                    <p className="text-white">
                      {squad.mission || 'Aucune mission définie pour cette squad.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Domaine</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {domainIcons[squad.domain as keyof typeof domainIcons]}
                        </span>
                        <span className="text-white font-medium">{squad.domain}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-400 mb-2">Slug</h3>
                      <p className="text-white font-mono text-sm bg-gray-700 px-2 py-1 rounded">
                        {squad.slug}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Squad Members */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-400" />
                      Membres ({squad.members?.length || 0})
                    </h2>
                    <Link
                      href={`/cockpit/admin/squads/${squad.id}/members`}
                      className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      Ajouter un membre
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  {squad.members && squad.members.length > 0 ? (
                    <div className="space-y-4">
                      {squad.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                          <div className="flex items-center gap-3">
                            <User className="w-8 h-8 text-gray-400" />
                            <div>
                              <p className="font-medium text-white">{member.name}</p>
                              <p className="text-sm text-gray-400">{member.role} · {member.domain}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {member.status === 'active' ? 'Actif' : member.status === 'inactive' ? 'Inactif' : member.status}
                              </span>
                            </div>
                            {member.performance_score && (
                              <p className="text-sm text-gray-400 mt-1">Score: {member.performance_score}%</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 mb-4">Aucun membre dans cette squad</p>
                      <Link
                        href={`/cockpit/admin/squads/${squad.id}/members`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter le premier membre
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-400" />
                    Actions rapides
                  </h2>
                </div>
                <div className="p-6 space-y-3">
                  <Link
                    href={`/cockpit/admin/squads/${squad.id}/instructions`}
                    className="flex items-center gap-2 w-full p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Envoyer une instruction
                  </Link>
                  <Link
                    href={`/cockpit/admin/squads/${squad.id}/members`}
                    className="flex items-center gap-2 w-full p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
                  >
                    <Users className="w-4 h-4" />
                    Gérer les membres
                  </Link>
                  <Link
                    href={`/cockpit/admin/squads/${squad.id}/edit`}
                    className="flex items-center gap-2 w-full p-3 text-left bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-white"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier la squad
                  </Link>
                </div>
              </div>

              {/* Recent Instructions */}
              {squad.recent_instructions && squad.recent_instructions.length > 0 && (
                <div className="bg-gray-800 rounded-lg border border-gray-700">
                  <div className="p-6 border-b border-gray-700">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      Instructions récentes
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {squad.recent_instructions.slice(0, 5).map((instruction, index) => (
                        <div key={instruction.id || index} className="flex items-start gap-3">
                          <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm text-white line-clamp-2">
                              {instruction.instruction}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {formatDate(instruction.created_at)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}