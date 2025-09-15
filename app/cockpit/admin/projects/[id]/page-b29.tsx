'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building, Calendar, DollarSign, Users, Edit, Trash2, AlertCircle } from 'lucide-react';
import AdminNavigation from '../../components/AdminNavigation';
import AdminProtection from '../../components/AdminProtection';
import { Project, Squad, ApiResponse } from '../../../../../types/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function ProjectDetailPageB29() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [squads, setSquads] = useState<Squad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetail();
      fetchProjectSquads();
    }
  }, [projectId]);

  const fetchProjectDetail = async () => {
    try {
      console.log('🔄 Fetching project detail with B29 structure for ID:', projectId);

      // Test avec l'endpoint /with-client pour avoir les infos client
      const response = await fetch(`/api/admin/projects/${projectId}/with-client`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Project Detail API Error:', response.status, errorText);
        throw new Error(`Erreur ${response.status}: Projet non trouvé ou API indisponible`);
      }

      const data: ApiResponse<Project> = await response.json();
      console.log('✅ Project loaded with structure anglaise:', data.data);
      setProject(data.data);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching project detail:', err);
      setError(err instanceof Error ? err.message : 'Impossible de charger le projet');
    }
  };

  const fetchProjectSquads = async () => {
    try {
      const response = await fetch(`/api/admin/projects/${projectId}/squads`);

      if (response.ok) {
        const data: ApiResponse<Squad[]> = await response.json();
        setSquads(data.data || []);
      }
    } catch (err) {
      console.error('⚠️ Error fetching squads:', err);
      // Non-bloquant
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'on_hold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'on_hold': return 'En pause';
      case 'completed': return 'Terminé';
      case 'cancelled': return 'Annulé';
      default: return status;
    }
  };

  if (loading) {
    return (
      <AdminProtection>
        <div className="min-h-screen bg-black text-green-400 p-8">
          <AdminNavigation />
          <div className="flex items-center justify-center h-64">
            <div className="text-xl">🔄 Chargement du projet (structure B29)...</div>
          </div>
        </div>
      </AdminProtection>
    );
  }

  if (error || !project) {
    return (
      <AdminProtection>
        <div className="min-h-screen bg-black text-green-400 p-8">
          <AdminNavigation />
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-green-400 hover:text-green-300 mb-8"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>

            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-400 mb-2">Projet non trouvé</h2>
              <p className="text-gray-400 mb-4">{error || 'Ce projet n\'existe pas ou a été supprimé'}</p>
              <div className="text-sm text-green-400/70 mb-4">
                ℹ️ Structure B29 anglaise active - Vérifiez que l&apos;ID du projet est correct
              </div>
              <button
                onClick={() => router.push('/cockpit/admin/projects')}
                className="bg-green-600 hover:bg-green-700 text-black px-6 py-3 rounded-lg"
              >
                Retour aux projets
              </button>
            </div>
          </div>
        </div>
      </AdminProtection>
    );
  }

  return (
    <AdminProtection>
      <div className="min-h-screen bg-black text-green-400 p-8">
        <AdminNavigation />

        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-green-400 hover:text-green-300"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour</span>
            </button>

            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                <Trash2 className="w-4 h-4" />
                <span>Supprimer</span>
              </button>
            </div>
          </div>

          {/* Project Header */}
          <div className="bg-gray-900/50 border border-green-500/20 rounded-lg p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-green-400 mb-2">
                  {project.name} {/* ✅ Plus de confusion nom/name ! */}
                </h1>
                <div className="flex items-center space-x-4 mb-4">
                  <span className={`px-4 py-2 rounded-full text-sm border ${getStatusColor(project.status)}`}>
                    {getStatusLabel(project.status)} {/* ✅ Plus de confusion statut/status ! */}
                  </span>
                  <span className="text-green-400/70">
                    Créé le {new Date(project.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {project.description && (
              <p className="text-green-400/80 text-lg mb-6">
                {project.description}
              </p>
            )}

            {/* Project Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Client Info - STRUCTURE ANGLAISE */}
              {project.client_name && (
                <div className="bg-black/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building className="w-5 h-5 text-green-400/50" />
                    <span className="text-green-400/70 font-medium">Client</span>
                  </div>
                  <div className="text-green-400">
                    <div className="font-semibold">{project.client_name}</div> {/* ✅ Plus d'erreur de mapping ! */}
                    {project.client_sector && (
                      <div className="text-sm text-green-400/70">{project.client_sector}</div> /* ✅ Plus d'erreur secteur/sector ! */
                    )}
                  </div>
                </div>
              )}

              {/* Budget */}
              {project.budget && (
                <div className="bg-black/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <DollarSign className="w-5 h-5 text-green-400/50" />
                    <span className="text-green-400/70 font-medium">Budget</span>
                  </div>
                  <div className="text-green-400 font-semibold">
                    {project.budget.toLocaleString()} €
                  </div>
                </div>
              )}

              {/* Deadline */}
              {project.deadline && (
                <div className="bg-black/50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-5 h-5 text-green-400/50" />
                    <span className="text-green-400/70 font-medium">Échéance</span>
                  </div>
                  <div className="text-green-400 font-semibold">
                    {new Date(project.deadline).toLocaleDateString()}
                  </div>
                </div>
              )}

              {/* Squads */}
              <div className="bg-black/50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Users className="w-5 h-5 text-green-400/50" />
                  <span className="text-green-400/70 font-medium">Squads</span>
                </div>
                <div className="text-green-400 font-semibold">
                  {project.squad_count} squad(s)
                </div>
                <div className="text-sm text-green-400/70">
                  {squads.filter(s => s.status === 'active').length} active(s)
                </div>
              </div>
            </div>
          </div>

          {/* Squads Section */}
          {squads.length > 0 && (
            <div className="bg-gray-900/50 border border-green-500/20 rounded-lg p-6">
              <h2 className="text-xl font-bold text-green-400 mb-4">👥 Squads Assignées</h2>
              <div className="grid gap-4">
                {squads.map((squad) => (
                  <div
                    key={squad.id}
                    className="bg-black/50 p-4 rounded-lg border border-green-500/10 hover:border-green-500/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-green-400">{squad.name}</h3>
                        {squad.description && (
                          <p className="text-green-400/70 text-sm">{squad.description}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(squad.status)}`}>
                        {getStatusLabel(squad.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Debug info */}
          <div className="mt-8 p-4 bg-gray-900/30 rounded-lg border border-green-500/10">
            <div className="text-sm text-green-400/50">
              🔧 Debug B29:
              Projet ID: {project.id} -
              Structure: ✅ Anglaise -
              Mapping: name=&quot;{project.name}&quot; | status=&quot;{project.status}&quot; -
              Client: {project.client_name || 'N/A'} -
              Secteur: {project.client_sector || 'N/A'}
            </div>
          </div>
        </div>
      </div>
    </AdminProtection>
  );
}