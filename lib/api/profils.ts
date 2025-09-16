// B30 Client API - Services pour appels APIs profils depuis le frontend
// Service layer pour interaction avec les APIs B30

import {
  ProfilsQuery,
  ProfilsResponse,
  ProfilExpertise,
  CreateProfilRequest,
  UpdateProfilRequest,
  MarketplaceResponse
} from '../db/models/profil';

const API_BASE = '/api/b30';

// ================================
// MARKETPLACE PROFILS
// ================================

export async function fetchMarketplaceProfils(query: Partial<ProfilsQuery> = {}): Promise<MarketplaceResponse> {
  const params = new URLSearchParams();

  // Build query parameters
  if (query.domaine) params.set('domaine', query.domaine);
  if (query.secteur && query.secteur.length > 0) {
    query.secteur.forEach(s => params.append('secteur', s));
  }
  if (query.niveau) params.set('niveau', query.niveau);
  if (query.tags && query.tags.length > 0) {
    query.tags.forEach(t => params.append('tags', t));
  }
  if (query.recherche) params.set('recherche', query.recherche);
  if (query.note_min) params.set('note_min', query.note_min.toString());
  if (query.cursor) params.set('cursor', query.cursor);
  if (query.limit) params.set('limit', query.limit.toString());
  if (query.sort_by) params.set('sort_by', query.sort_by);
  if (query.sort_order) params.set('sort_order', query.sort_order);

  const response = await fetch(`${API_BASE}/marketplace?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Pour auth JWT
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ================================
// PROFILS CRUD
// ================================

export async function fetchProfils(query: Partial<ProfilsQuery> = {}): Promise<ProfilsResponse> {
  const params = new URLSearchParams();

  // Same parameter building as marketplace but includes private profils
  if (query.domaine) params.set('domaine', query.domaine);
  if (query.secteur && query.secteur.length > 0) {
    query.secteur.forEach(s => params.append('secteur', s));
  }
  if (query.niveau) params.set('niveau', query.niveau);
  if (query.statut) params.set('statut', query.statut);
  if (query.cree_par) params.set('cree_par', query.cree_par);
  if (query.tags && query.tags.length > 0) {
    query.tags.forEach(t => params.append('tags', t));
  }
  if (query.recherche) params.set('recherche', query.recherche);
  if (query.note_min) params.set('note_min', query.note_min.toString());
  if (query.cursor) params.set('cursor', query.cursor);
  if (query.limit) params.set('limit', query.limit.toString());
  if (query.sort_by) params.set('sort_by', query.sort_by);
  if (query.sort_order) params.set('sort_order', query.sort_order);

  const response = await fetch(`${API_BASE}/profils?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function fetchProfilById(id: string): Promise<ProfilExpertise> {
  const response = await fetch(`${API_BASE}/profils/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function createProfil(profil: CreateProfilRequest): Promise<{
  success: boolean;
  profil: { id: string; slug: string; statut: string; actions_disponibles: string[] };
}> {
  const response = await fetch(`${API_BASE}/profils`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(profil),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function updateProfil(id: string, updates: UpdateProfilRequest): Promise<{
  success: boolean;
  profil: ProfilExpertise;
  version_created: boolean;
  actions_disponibles: string[];
}> {
  const response = await fetch(`${API_BASE}/profils/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function deleteProfil(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_BASE}/profils/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ================================
// ACTIONS PROFILS
// ================================

export async function duplicateProfil(id: string, nouveauNom?: string): Promise<{
  success: boolean;
  profil: { id: string; slug: string };
}> {
  const response = await fetch(`${API_BASE}/profils/${id}/duplicate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ nouveau_nom: nouveauNom }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function publishProfil(id: string): Promise<{ success: boolean; profil: ProfilExpertise }> {
  const response = await fetch(`${API_BASE}/profils/${id}/publish`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export async function createAgentFromProfil(profilId: string, contextConfig?: any): Promise<{
  success: boolean;
  agent: { id: string; url: string };
}> {
  const response = await fetch(`${API_BASE}/profils/${profilId}/create-agent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ context_config: contextConfig }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// ================================
// HOOKS REACT QUERY
// ================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Hook pour marketplace
export function useMarketplaceProfils(query: Partial<ProfilsQuery> = {}) {
  return useQuery({
    queryKey: ['marketplace-profils', query],
    queryFn: () => fetchMarketplaceProfils(query),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook pour profils avec permissions
export function useProfils(query: Partial<ProfilsQuery> = {}) {
  return useQuery({
    queryKey: ['profils', query],
    queryFn: () => fetchProfils(query),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Hook pour profil individuel
export function useProfil(id: string, enabled = true) {
  return useQuery({
    queryKey: ['profil', id],
    queryFn: () => fetchProfilById(id),
    enabled: enabled && !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Hook pour création profil
export function useCreateProfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProfil,
    onSuccess: () => {
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ['profils'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-profils'] });
    },
  });
}

// Hook pour mise à jour profil
export function useUpdateProfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateProfilRequest }) =>
      updateProfil(id, updates),
    onSuccess: (data, variables) => {
      // Mettre à jour le cache du profil spécifique
      queryClient.setQueryData(['profil', variables.id], data.profil);

      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: ['profils'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-profils'] });
    },
  });
}

// Hook pour suppression profil
export function useDeleteProfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProfil,
    onSuccess: (data, profilId) => {
      // Supprimer du cache
      queryClient.removeQueries({ queryKey: ['profil', profilId] });

      // Invalider les listes
      queryClient.invalidateQueries({ queryKey: ['profils'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-profils'] });
    },
  });
}

// Hook pour duplication profil
export function useDuplicateProfil() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, nouveauNom }: { id: string; nouveauNom?: string }) =>
      duplicateProfil(id, nouveauNom),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profils'] });
    },
  });
}

// ================================
// UTILITAIRES
// ================================

// Fonction pour construire URL de profil
export function getProfilUrl(slug: string): string {
  return `/cockpit/admin/profils/${slug}`;
}

// Fonction pour construire URL de création agent
export function getCreateAgentUrl(profilId: string): string {
  return `/cockpit/admin/agents/new?profil=${profilId}`;
}

// Fonction pour formater les statistiques marketplace
export function formatMarketplaceStats(stats: any) {
  return {
    totalProfils: stats.total_profils,
    parDomaine: Object.entries(stats.par_domaine).map(([domaine, data]) => ({
      domaine,
      ...(data as any)
    })),
    parNiveau: Object.entries(stats.par_niveau).map(([niveau, count]) => ({
      niveau,
      count
    })),
    populaires: stats.profils_populaires,
    nouveautes: stats.nouveautes,
    tendances: stats.tendances_recherche
  };
}

// Types pour les erreurs API
export interface ApiError {
  error: string;
  details?: string | string[];
  status?: number;
}

// Fonction pour gérer les erreurs API
export function handleApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    return {
      error: error.message,
      details: error.stack
    };
  }

  return {
    error: 'Unknown error occurred',
    details: String(error)
  };
}