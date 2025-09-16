'use client';

import { useState, useEffect } from 'react';
import {
  Search, Filter, Star, Users, Heart, Eye, Rocket, Plus,
  Settings, Building, TrendingUp, Zap, BarChart3, Download
} from 'lucide-react';
import { getCurrentRole } from '../../../../lib/auth/role';
import ResponsiveWrapper from '../../components/ResponsiveWrapper';
import AdminNavigation from '../components/AdminNavigation';
import AdminProtection from '../components/AdminProtection';

// B30 Marketplace Profils - Page principale
export default function MarketplaceProfils() {
  const [profils, setProfils] = useState([]);
  const [filteredProfils, setFilteredProfils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('viewer');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomaine, setSelectedDomaine] = useState('tous');
  const [selectedSecteur, setSelectedSecteur] = useState('tous');
  const [noteMin, setNoteMin] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [editingProfil, setEditingProfil] = useState<string | null>(null);
  const [editingCompetences, setEditingCompetences] = useState<string[]>([]);

  useEffect(() => {
    setUserRole(getCurrentRole());
    loadProfils();
  }, []);

  useEffect(() => {
    filterProfils();
  }, [profils, searchTerm, selectedDomaine, selectedSecteur, noteMin]);

  const loadProfils = async () => {
    try {
      // Connexion à l'API B30 marketplace
      const response = await fetch('/api/b30/marketplace', {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setProfils(data.profils);

      // TODO: Utiliser les vraies statistiques
      // setStats(data.statistiques);

    } catch (error) {
      console.log('API not available, using mock data');
      // Fallback to mock data when API is not available
      const mockProfils = [
        {
          id: 'prof-001',
          nom: 'Expert Comptable PME',
          slug: 'expert-comptable-pme',
          domaine: 'Finance',
          secteurs_cibles: ['Manufacturing', 'Retail'],
          description_courte: 'Expert en comptabilité PME avec 15 ans d\'expérience industrielle',
          competences_cles: ['Comptabilité générale', 'Fiscalité PME', 'Analyse financière'],
          note_moyenne: 4.8,
          nb_evaluations: 156,
          nb_utilisations: 247,
          créé_par: 'Jean Expert',
          créé_le: '2025-09-10T10:00:00Z'
        },
        {
          id: 'prof-002',
          nom: 'Expert RH PME',
          slug: 'expert-rh-pme',
          domaine: 'RH',
          secteurs_cibles: ['Services', 'Manufacturing'],
          description_courte: 'DRH expérimentée spécialisée PME croissance et transformation',
          competences_cles: ['Recrutement efficace', 'Formation équipes', 'Relations sociales'],
          note_moyenne: 4.9,
          nb_evaluations: 89,
          nb_utilisations: 134,
          créé_par: 'Marie RH',
          créé_le: '2025-09-08T14:30:00Z'
        },
        {
          id: 'prof-003',
          nom: 'Expert Marketing Digital',
          slug: 'expert-marketing-digital',
          domaine: 'Marketing',
          secteurs_cibles: ['E-commerce', 'Services', 'Retail'],
          description_courte: 'Spécialisé growth marketing PME avec ROI mesurable',
          competences_cles: ['SEO/SEA', 'Social Ads', 'Conversion', 'Analytics'],
          note_moyenne: 4.6,
          nb_evaluations: 67,
          nb_utilisations: 98,
          créé_par: 'Paul Marketing',
          créé_le: '2025-09-05T09:15:00Z'
        }
      ];

      setProfils(mockProfils);
    } finally {
      setLoading(false);
    }
  };

  const filterProfils = () => {
    let filtered = profils;

    if (searchTerm) {
      filtered = filtered.filter(profil =>
        profil.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profil.description_courte.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profil.domaine.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDomaine !== 'tous') {
      filtered = filtered.filter(profil => profil.domaine === selectedDomaine);
    }

    if (selectedSecteur !== 'tous') {
      filtered = filtered.filter(profil =>
        profil.secteurs_cibles.includes(selectedSecteur)
      );
    }

    if (noteMin > 0) {
      filtered = filtered.filter(profil => profil.note_moyenne >= noteMin);
    }

    setFilteredProfils(filtered);
  };

  const handleCreateAgent = (profilId: string) => {
    // Rediriger vers l'adaptateur contextuel
    window.location.href = `/cockpit/admin/profils/adapter?id=${profilId}`;
  };

  const handlePreviewProfil = (profilId: string) => {
    // Ouvrir la page de détail du profil
    window.location.href = `/cockpit/admin/profils/${profilId}`;
  };

  const handleAddToFavorites = (profilId: string) => {
    // TODO: Ajouter aux favoris utilisateur
    console.log('Add to favorites:', profilId);
  };

  if (loading) {
    return (
      <div className="console-theme min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement des profils...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminProtection allowedRoles={['admin', 'manager', 'operator', 'viewer']}>
      <ResponsiveWrapper
        currentPath="/cockpit/admin/profils"
        userRole={userRole}
        contentClassName="pl-0 sm:pl-0 md:pl-0 lg:pl-0"
        innerClassName="max-w-none mx-0"
      >
        {/* Admin Navigation */}
        <AdminNavigation />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center space-x-3">
              <span className="text-4xl">🟠</span>
              <span>Marketplace Profils</span>
              <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold animate-pulse">
                NEW!
              </span>
            </h1>
            <p className="text-gray-300 mt-2">
              Créez et gérez des profils d'agents IA spécialisés. Bibliothèque d'expertises réutilisables et modulaires.
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => window.location.href = '/cockpit/admin/profils/new'}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              <Plus size={20} />
              <span>Créer Profil</span>
            </button>
            <button
              onClick={() => window.location.href = '/cockpit/admin/profils/compose'}
              className="bg-transparent border-2 border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2"
            >
              <Settings size={20} />
              <span>Builder</span>
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8 hover:border-orange-500/30 transition-all duration-200">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
            {/* Search */}
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un profil..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
              />
            </div>

            {/* Quick filters */}
            <div className="flex flex-wrap items-center space-x-4">
              <button className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors">
                ⭐ Populaires
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors">
                🆕 Nouveautés
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors">
                ✨ Recommandés
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm flex items-center space-x-2 transition-colors"
              >
                <Filter size={16} />
                <span>Filtres</span>
              </button>
            </div>
          </div>

          {/* Extended filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-600">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Domaine</label>
                  <select
                    value={selectedDomaine}
                    onChange={(e) => setSelectedDomaine(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="tous">Tous domaines</option>
                    <option value="Finance">💼 Finance</option>
                    <option value="RH">👥 RH</option>
                    <option value="Marketing">📈 Marketing</option>
                    <option value="Tech">⚙️ Tech</option>
                    <option value="Ventes">💰 Ventes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Secteur</label>
                  <select
                    value={selectedSecteur}
                    onChange={(e) => setSelectedSecteur(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  >
                    <option value="tous">Tous secteurs</option>
                    <option value="Manufacturing">🏭 Manufacturing</option>
                    <option value="Retail">🛒 Retail</option>
                    <option value="Services">🏢 Services</option>
                    <option value="E-commerce">💻 E-commerce</option>
                    <option value="Tech">⚡ Tech</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Note minimum</label>
                  <select
                    value={noteMin}
                    onChange={(e) => setNoteMin(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  >
                    <option value={0}>Toutes notes</option>
                    <option value={4.5}>⭐ 4.5+ Excellent</option>
                    <option value={4.0}>⭐ 4.0+ Très bon</option>
                    <option value={3.5}>⭐ 3.5+ Bon</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-xl p-6 border border-blue-700/30 text-center hover:border-blue-500/50 transition-all duration-200 cursor-pointer">
            <div className="text-4xl mb-3">💼</div>
            <h3 className="text-white font-semibold mb-2">Finance</h3>
            <p className="text-gray-400 text-sm">12 profils</p>
            <div className="mt-3">
              <div className="text-xs text-blue-400 font-medium">+3 ce mois</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-xl p-6 border border-green-700/30 text-center hover:border-green-500/50 transition-all duration-200 cursor-pointer">
            <div className="text-4xl mb-3">👥</div>
            <h3 className="text-white font-semibold mb-2">RH</h3>
            <p className="text-gray-400 text-sm">8 profils</p>
            <div className="mt-3">
              <div className="text-xs text-green-400 font-medium">+2 ce mois</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 rounded-xl p-6 border border-purple-700/30 text-center hover:border-purple-500/50 transition-all duration-200 cursor-pointer">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="text-white font-semibold mb-2">Marketing</h3>
            <p className="text-gray-400 text-sm">6 profils</p>
            <div className="mt-3">
              <div className="text-xs text-purple-400 font-medium">+1 ce mois</div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-orange-900/20 to-orange-800/10 rounded-xl p-6 border border-orange-700/30 text-center hover:border-orange-500/50 transition-all duration-200 cursor-pointer">
            <div className="text-4xl mb-3">⚙️</div>
            <h3 className="text-white font-semibold mb-2">Tech</h3>
            <p className="text-gray-400 text-sm">15 profils</p>
            <div className="mt-3">
              <div className="text-xs text-orange-400 font-medium">+7 ce mois</div>
            </div>
          </div>
        </div>

        {/* Profils Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {filteredProfils.length} profil{filteredProfils.length > 1 ? 's' : ''} trouvé{filteredProfils.length > 1 ? 's' : ''}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Trier par:</span>
              <select className="bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white">
                <option>Popularité</option>
                <option>Note</option>
                <option>Récents</option>
                <option>Nom A-Z</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredProfils.map((profil) => (
              <div key={profil.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-orange-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{profil.nom}</h3>
                      <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                        NEW
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mb-3">
                      <span className="text-orange-400 text-sm font-medium bg-orange-500/10 px-2 py-1 rounded">
                        {profil.domaine}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star size={16} className="text-yellow-400 fill-current" />
                        <span className="text-white font-medium">{profil.note_moyenne}</span>
                        <span className="text-gray-400 text-sm">({profil.nb_evaluations})</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users size={16} className="text-gray-400" />
                        <span className="text-gray-400 text-sm">{profil.nb_utilisations} agents</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAddToFavorites(profil.id)}
                      className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      <Heart size={16} className="text-gray-400 hover:text-red-400" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                  {profil.description_courte}
                </p>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Compétences clés:</h4>
                  <div className="flex flex-wrap gap-2">
                    {(profil.competences_cles || profil.sections_preview || []).map((competence, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-orange-900 text-orange-200 text-xs rounded-full"
                      >
                        {competence}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-600 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePreviewProfil(profil.id)}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Eye size={14} />
                        <span>Aperçu</span>
                      </button>
                      <button
                        onClick={() => window.location.href = `/cockpit/admin/profils/${profil.id}/edit`}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <Settings size={14} />
                        <span>Éditer</span>
                      </button>
                      <button
                        onClick={() => handleCreateAgent(profil.id)}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-lg font-semibold transition-colors flex items-center space-x-2"
                      >
                        <Rocket size={14} />
                        <span>Créer Agent</span>
                      </button>
                    </div>
                    <div className="text-right">
                      <span className="text-green-400 font-medium text-sm bg-green-500/10 px-2 py-1 rounded">
                        ✓ Disponible
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProfils.length === 0 && (
            <div className="text-center py-12">
              <Search size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Aucun profil trouvé</h3>
              <p className="text-gray-400 mb-4">
                Essayez de modifier vos critères de recherche ou filtres
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedDomaine('tous');
                  setSelectedSecteur('tous');
                  setNoteMin(0);
                }}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-all duration-200"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </div>

        {/* Load More */}
        {filteredProfils.length > 0 && (
          <div className="text-center mt-8">
            <button className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors">
              🔄 Charger plus de profils
            </button>
          </div>
        )}
      </ResponsiveWrapper>
    </AdminProtection>
  );
}