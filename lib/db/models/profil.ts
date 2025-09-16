// B30 - Modèles TypeScript pour Profils d'Expertise
// Types et interfaces pour la couche métier

export interface ProfilExpertise {
  id: string;
  nom: string;
  slug: string;
  version: string;

  // Métadonnées métier
  domaine: DomaineExpertise;
  secteurs_cibles: string[];
  niveau_complexite: NiveauComplexite;
  tags: string[];

  // Expertise principale
  description_courte: string;
  description_complete?: string;
  competences_cles: string[];
  methodologie?: string;
  outils_maitrises: string[];

  // Exemples et cas d'usage
  exemples_taches: string[];
  cas_usage: string[];
  limites_explicites: string[];

  // Configuration technique (Identity Core)
  identity_prompt: string;
  mission_prompt?: string;
  personality_prompt?: string;
  parametres_base: ParametresIA;

  // Marketplace
  statut: StatutProfil;
  visibilite: VisibiliteProfil;

  // Métriques
  nb_utilisations: number;
  note_moyenne?: number;
  nb_evaluations: number;

  // Sections modulaires
  sections: ProfilSection[];

  // Métadonnées
  cree_par: string;
  cree_le: Date;
  modifie_par?: string;
  modifie_le: Date;
  supprime_le?: Date;

  // Relations
  profil_parent_id?: string;
  est_version_principale: boolean;
}

export interface ProfilSection {
  id: string;
  profil_id: string;
  nom: string;
  type_section: TypeSection;
  category?: string;
  ordre: number;

  // Configuration déclenchement
  trigger_keywords: string[];
  trigger_weight: number;

  // Contenu
  prompt_template: string;
  exemple_utilisation?: string;

  // Dépendances
  dependencies: string[];
  exclusions: string[];

  // Métadonnées
  description?: string;
  est_obligatoire: boolean;
  est_active: boolean;

  // Audit
  cree_par: string;
  cree_le: Date;
  modifie_par?: string;
  modifie_le: Date;
}

export interface ProfilVersion {
  id: string;
  profil_id: string;
  version_number: string;
  profil_snapshot: any;
  sections_snapshot: any;
  description_changements?: string;
  type_changement: TypeChangement;
  breaking_changes: boolean;
  cree_par: string;
  cree_le: Date;
}

export interface ProfilEvaluation {
  id: string;
  profil_id: string;
  note: number;
  commentaire?: string;
  contexte_utilisation?: string;
  domaine_usage?: string;
  evalue_par: string;
  evalue_le: Date;
}

export interface ProfilTag {
  id: string;
  nom: string;
  slug: string;
  description?: string;
  couleur?: string;
  usage_count: number;
  cree_le: Date;
}

export interface ProfilAnalytics {
  id: string;
  profil_id: string;
  date_periode: Date;
  vues_total: number;
  utilisations_total: number;
  evaluations_total: number;
  note_moyenne_periode?: number;
  domaines_usage: Record<string, number>;
  secteurs_usage: Record<string, number>;
  keywords_triggeres: Record<string, number>;
  cree_le: Date;
}

// ================================
// TYPES & ENUMS
// ================================

export type DomaineExpertise =
  | 'RH'
  | 'Finance'
  | 'Marketing'
  | 'Tech'
  | 'Legal'
  | 'Operations'
  | 'Strategy';

export type NiveauComplexite = 'beginner' | 'intermediate' | 'advanced';

export type StatutProfil = 'draft' | 'review' | 'published' | 'deprecated';

export type VisibiliteProfil = 'private' | 'internal' | 'public';

export type TypeSection = 'expertise' | 'scope' | 'governance' | 'workflow' | 'outputs';

export type TypeChangement = 'major' | 'minor' | 'patch';

export interface ParametresIA {
  temperature?: number; // 0.0-2.0
  max_tokens?: number;  // 100-4000
  top_p?: number;       // 0.0-1.0
  frequency_penalty?: number;
  presence_penalty?: number;
}

// ================================
// DTOs POUR API
// ================================

export interface CreateProfilRequest {
  nom: string;
  domaine: DomaineExpertise;
  secteurs_cibles?: string[];
  niveau_complexite: NiveauComplexite;

  description_courte: string;
  description_complete?: string;
  competences_cles: string[];
  methodologie?: string;
  outils_maitrises?: string[];

  exemples_taches: string[];
  cas_usage?: string[];
  limites_explicites?: string[];

  identity_prompt: string;
  mission_prompt?: string;
  personality_prompt?: string;
  parametres_base?: ParametresIA;

  sections_expertise?: Omit<ProfilSection, 'id' | 'profil_id' | 'cree_par' | 'cree_le'>[];
  sections_scope?: Omit<ProfilSection, 'id' | 'profil_id' | 'cree_par' | 'cree_le'>[];

  visibilite: VisibiliteProfil;
  tags?: string[];
}

export interface UpdateProfilRequest extends Partial<CreateProfilRequest> {
  version_description?: string;
  type_changement?: TypeChangement;
}

export interface ProfilMarketplace {
  id: string;
  nom: string;
  slug: string;
  domaine: DomaineExpertise;
  secteurs_cibles: string[];
  niveau_complexite: NiveauComplexite;
  description_courte: string;
  tags: string[];

  // Métriques marketplace
  note_moyenne?: number;
  nb_evaluations: number;
  nb_utilisations: number;
  score_popularite: number;

  // Métadonnées
  cree_par: string;
  cree_le: Date;
  modifie_le: Date;

  // Preview sections
  nb_sections_expertise: number;
  sections_preview: string[];

  // Actions disponibles pour cet utilisateur
  actions_disponibles: ('voir' | 'utiliser' | 'editer' | 'dupliquer')[];
}

export interface ProfilsQuery {
  domaine?: DomaineExpertise;
  secteur?: string[];
  niveau?: NiveauComplexite;
  statut?: StatutProfil;
  cree_par?: string;
  tags?: string[];
  recherche?: string;
  note_min?: number;

  // Pagination
  cursor?: string;
  limit?: number;

  // Tri
  sort_by?: 'nom' | 'note' | 'usage' | 'recent';
  sort_order?: 'asc' | 'desc';
}

export interface ProfilsResponse {
  profils: ProfilMarketplace[];
  pagination: {
    cursor?: string;
    has_next: boolean;
    has_previous: boolean;
    total_count: number;
  };
  filtres_appliques: Partial<ProfilsQuery>;
  suggestions_recherche?: string[];
}

export interface CreateSectionRequest {
  nom: string;
  type_section: TypeSection;
  category?: string;
  ordre: number;
  trigger_keywords: string[];
  trigger_weight: number;
  prompt_template: string;
  exemple_utilisation?: string;
  dependencies?: string[];
  exclusions?: string[];
  description?: string;
  est_obligatoire?: boolean;
}

// ================================
// UTILITAIRES VALIDATION
// ================================

export const VALIDATION_RULES = {
  profil: {
    nom: { min: 5, max: 255 },
    description_courte: { min: 20, max: 500 },
    identity_prompt: { min: 50, max: 4000 },
    competences_cles: { min: 1, max: 10 },
    exemples_taches: { min: 3, max: 15 },
    tags: { max: 10 }
  },
  section: {
    nom: { min: 5, max: 200 },
    prompt_template: { min: 20, max: 4000 },
    trigger_keywords: { min: 1, max: 20 },
    trigger_weight: { min: 0, max: 1 },
    dependencies: { max: 5 },
    exclusions: { max: 10 }
  }
} as const;

export const DOMAINES_EXPERTISE: DomaineExpertise[] = [
  'RH', 'Finance', 'Marketing', 'Tech', 'Legal', 'Operations', 'Strategy'
];

export const NIVEAUX_COMPLEXITE: NiveauComplexite[] = [
  'beginner', 'intermediate', 'advanced'
];

export const TYPES_SECTION: TypeSection[] = [
  'expertise', 'scope', 'governance', 'workflow', 'outputs'
];

// ================================
// UTILITAIRES MÉTIER
// ================================

export function calculateProfilScore(profil: ProfilExpertise): number {
  // Score basé sur complétude, qualité et popularité
  const completudeScore = (
    (profil.description_complete ? 1 : 0) +
    (profil.methodologie ? 1 : 0) +
    (profil.outils_maitrises.length > 0 ? 1 : 0) +
    (profil.cas_usage.length > 0 ? 1 : 0) +
    (profil.limites_explicites.length > 0 ? 1 : 0) +
    (profil.sections.length > 0 ? 1 : 0)
  ) / 6;

  const qualiteScore = (profil.note_moyenne || 0) / 5;
  const populariteScore = Math.min(profil.nb_utilisations / 100, 1);

  return Math.round((completudeScore * 0.3 + qualiteScore * 0.4 + populariteScore * 0.3) * 100);
}

export function generateProfilSlug(nom: string): string {
  return nom
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s]/g, '')     // Remove special chars
    .replace(/\s+/g, '-')            // Spaces to hyphens
    .replace(/-+/g, '-')             // Multiple hyphens to one
    .replace(/^-|-$/g, '')           // Remove leading/trailing hyphens
    .substring(0, 80);               // Limit length
}

export function validateTriggerKeywords(keywords: string[]): boolean {
  return keywords.every(keyword =>
    keyword.length >= 2 &&
    keyword.length <= 50 &&
    /^[a-zA-ZÀ-ÿ0-9\s-_]+$/.test(keyword)
  );
}