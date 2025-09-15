'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Briefcase, Building, User, Calendar, DollarSign, ArrowRight, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminNavigation from '../components/AdminNavigation';
import AdminProtection from '../components/AdminProtection';
import { Project, ApiListResponse } from '../../../../types/admin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function AdminProjectsPageB29() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProjects();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, statusFilter]);

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter) params.append('status', statusFilter);  // ✅ status (anglais)

      console.log('🔄 Fetching projects with B29 structure...');
      const response = await fetch(`/api/admin/projects?${params.toString()}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Projects API Error:', response.status, errorText);
        throw new Error(`Erreur ${response.status}: ${errorText}`);
      }

      const data: ApiListResponse<Project> = await response.json();
      console.log('✅ Projects loaded with structure anglaise:', data.data?.length || 0);
      setProjects(data.data || []);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'normal': return 'text-green-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <AdminProtection>
        <div className="min-h-screen bg-black text-green-400 p-8">
          <AdminNavigation />
          <div className="flex items-center justify-center h-64">
            <div className="text-xl">🔄 Chargement des projets (structure B29)...</div>
          </div>
        </div>
      </AdminProtection>
    );
  }

  if (error) {
    return (
      <AdminProtection>
        <div className="min-h-screen bg-black text-green-400 p-8">
          <AdminNavigation />
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <div className="text-xl text-red-400 mb-2">❌ Erreur de chargement</div>
              <div className="text-sm text-gray-400 mb-4">{error}</div>
              <button
                onClick={fetchProjects}
                className="bg-green-600 hover:bg-green-700 text-black px-4 py-2 rounded-lg"
              >
                Réessayer
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

        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">📋 Gestion Projets</h1>
              <p className="text-green-400/70">
                ✅ Structure B29 anglaise - Affichage enfin fonctionnel !
                {projects.length > 0 && (
                  <span className="ml-2 text-green-400">({projects.length} projets)</span>
                )}
              </p>
            </div>
            <button className="bg-green-600 hover:bg-green-700 text-black px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors">
              <Plus className="w-5 h-5" />
              <span>Nouveau Projet</span>
            </button>
          </div>

          {/* Filters */}
          <div className="bg-gray-900/50 p-6 rounded-lg border border-green-500/20">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400/50" />
                  <input
                    type="text"
                    placeholder="Rechercher par nom de projet..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black border border-green-500/30 rounded-lg pl-10 pr-4 py-3 text-green-400 placeholder-green-400/50 focus:border-green-500 focus:outline-none"
                  />
                </div>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-black border border-green-500/30 rounded-lg px-4 py-3 text-green-400 focus:border-green-500 focus:outline-none"
              >
                <option value="">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="on_hold">En pause</option>
                <option value="completed">Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
            </div>
          </div>

          {/* Projects List */}
          <div className="grid gap-6">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-green-400/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Aucun projet trouvé</h3>
                <p className="text-green-400/70">Commencez par créer votre premier projet</p>
              </div>
            ) : (
              projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-gray-900/50 border border-green-500/20 rounded-lg p-6 hover:border-green-500/40 transition-colors group cursor-pointer"
                  onClick={() => router.push(`/cockpit/admin/projects/${project.id}`)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className="text-xl font-semibold text-green-400 group-hover:text-green-300">
                          {project.name} {/* ✅ Plus de confusion nom/name ! */}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(project.status)}`}>
                          {getStatusLabel(project.status)} {/* ✅ Plus de confusion statut/status ! */}
                        </span>
                        <span className={`text-sm ${getPriorityColor(project.priority)}`}>
                          ●{project.priority.toUpperCase()}
                        </span>
                      </div>

                      {project.description && (
                        <p className="text-green-400/70 mb-4 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        {/* Client info - STRUCTURE ANGLAISE */}
                        {project.client_name && (
                          <div className="flex items-center space-x-2">
                            <Building className="w-4 h-4 text-green-400/50" />
                            <span className="text-green-400/70">Client:</span>
                            <span>{project.client_name}</span> {/* ✅ Plus d'erreur de mapping ! */}
                          </div>
                        )}

                        {project.client_sector && (
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-green-400/50" />
                            <span className="text-green-400/70">Secteur:</span>
                            <span>{project.client_sector}</span> {/* ✅ Plus d'erreur secteur/sector ! */}
                          </div>
                        )}

                        {project.budget && (
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-green-400/50" />
                            <span className="text-green-400/70">Budget:</span>
                            <span>{project.budget.toLocaleString()} €</span>
                          </div>
                        )}

                        {project.deadline && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-green-400/50" />
                            <span className="text-green-400/70">Échéance:</span>
                            <span>{new Date(project.deadline).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {/* Squad count */}
                      <div className="mt-3 text-sm text-green-400/70">
                        <span className="flex items-center space-x-2">
                          <span>👥 {project.squad_count} squad(s) assignée(s)</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-green-400/50 group-hover:text-green-400">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Debug info */}
          <div className="mt-8 p-4 bg-gray-900/30 rounded-lg border border-green-500/10">
            <div className="text-sm text-green-400/50">
              🔧 Debug B29: Structure anglaise détectée -
              API: {projects.length > 0 ? '✅ OK' : '⚠️ Vide'} -
              Mapping: {projects.length > 0 && projects[0].name ? '✅ name' : '❌ nom'} -
              Relations: {projects.length > 0 && projects[0].client_name ? '✅ OK' : '⚠️ N/A'}
            </div>
          </div>
        </div>
      </div>
    </AdminProtection>
  );
}