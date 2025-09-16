// B30 Phase 2 - Moteur de Sélection Intelligent
// Algorithme de sélection des sections selon keywords et contexte

import { ProfilSection, ProfilExpertise } from '../../db/models/profil';

// ================================
// TYPES & INTERFACES
// ================================

export interface SelectionContext {
  query: string;                    // Demande utilisateur originale
  keywords: string[];               // Keywords extraits
  domain?: string;                  // Domaine métier si détecté
  urgency?: 'low' | 'medium' | 'high'; // Niveau urgence
  complexity?: 'simple' | 'complex';   // Complexité estimée
  user_context?: {                  // Contexte utilisateur
    role: string;
    organization_size: string;
    industry: string[];
  };
}

export interface SectionScore {
  section: ProfilSection;
  score: number;                    // Score 0-1
  matched_keywords: string[];       // Keywords qui ont matché
  rationale: string;               // Explication du score
  confidence: number;              // Confiance dans le match 0-1
}

export interface AssemblyResult {
  selected_sections: SectionScore[];
  total_score: number;
  assembly_prompt: string;
  metadata: {
    selection_time_ms: number;
    keywords_used: string[];
    sections_considered: number;
    conflicts_detected: ConflictWarning[];
  };
}

export interface ConflictWarning {
  type: 'keyword_overlap' | 'exclusion_rule' | 'dependency_missing' | 'semantic_contradiction';
  severity: 'low' | 'medium' | 'high';
  description: string;
  affected_sections: string[];      // IDs des sections concernées
  suggested_resolution?: string;
}

// ================================
// ALGORITHME DE SÉLECTION PRINCIPAL
// ================================

export class ProfilSectionSelector {
  private keywordWeights: Map<string, number> = new Map();
  private sectionCache: Map<string, SectionScore[]> = new Map();

  constructor() {
    this.initializeKeywordWeights();
  }

  /**
   * Sélectionne les sections pertinentes pour une requête donnée
   */
  async selectSections(
    profil: ProfilExpertise,
    context: SelectionContext,
    options: SelectionOptions = {}
  ): Promise<AssemblyResult> {
    const startTime = Date.now();

    try {
      // 1. Préparation et validation
      const validatedContext = this.validateContext(context);
      const availableSections = this.getAvailableSections(profil);

      // 2. Scoring de chaque section
      const sectionScores = await this.scoreSections(
        availableSections,
        validatedContext,
        options
      );

      // 3. Sélection optimale avec résolution de conflits
      const selectedSections = this.selectOptimalSections(
        sectionScores,
        options.maxSections || 5
      );

      // 4. Détection des conflits
      const conflicts = this.detectConflicts(selectedSections);

      // 5. Résolution automatique des conflits
      const resolvedSections = this.resolveConflicts(selectedSections, conflicts);

      // 6. Assemblage du prompt final
      const assemblyPrompt = this.assemblePrompt(profil, resolvedSections);

      return {
        selected_sections: resolvedSections,
        total_score: this.calculateTotalScore(resolvedSections),
        assembly_prompt: assemblyPrompt,
        metadata: {
          selection_time_ms: Date.now() - startTime,
          keywords_used: validatedContext.keywords,
          sections_considered: availableSections.length,
          conflicts_detected: conflicts
        }
      };

    } catch (error) {
      console.error('Error in section selection:', error);
      throw new SectionSelectionError(
        'Failed to select sections',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Score une section individuelle selon le contexte
   */
  private async scoreSection(
    section: ProfilSection,
    context: SelectionContext
  ): Promise<SectionScore> {
    let score = 0;
    const matchedKeywords: string[] = [];
    let rationale = '';

    // 1. Score basé sur les mots-clés
    const keywordScore = this.calculateKeywordScore(section, context.keywords, matchedKeywords);
    score += keywordScore * 0.4; // 40% du score

    // 2. Score basé sur le poids de déclenchement
    const triggerScore = section.trigger_weight;
    score += triggerScore * 0.3; // 30% du score

    // 3. Score contextuel (domaine, urgence, complexité)
    const contextScore = this.calculateContextScore(section, context);
    score += contextScore * 0.3; // 30% du score

    // 4. Calcul de la confiance
    const confidence = this.calculateConfidence(section, context, matchedKeywords);

    rationale = this.generateRationale(section, keywordScore, contextScore, matchedKeywords);

    return {
      section,
      score: Math.min(score, 1), // Cap à 1
      matched_keywords: matchedKeywords,
      rationale,
      confidence
    };
  }

  /**
   * Score toutes les sections disponibles
   */
  private async scoreSections(
    sections: ProfilSection[],
    context: SelectionContext,
    options: SelectionOptions
  ): Promise<SectionScore[]> {
    const scores = await Promise.all(
      sections.map(section => this.scoreSection(section, context))
    );

    // Trier par score décroissant
    return scores
      .sort((a, b) => b.score - a.score)
      .filter(score => score.score >= (options.minScore || 0.1)); // Filtrer les scores trop faibles
  }

  /**
   * Calcule le score basé sur les mots-clés
   */
  private calculateKeywordScore(
    section: ProfilSection,
    queryKeywords: string[],
    matchedKeywords: string[]
  ): number {
    let totalScore = 0;
    const sectionKeywords = section.trigger_keywords.map(k => k.toLowerCase());

    for (const queryKeyword of queryKeywords) {
      const queryLower = queryKeyword.toLowerCase();

      // Recherche exact match
      if (sectionKeywords.includes(queryLower)) {
        matchedKeywords.push(queryKeyword);
        totalScore += this.getKeywordWeight(queryKeyword);
        continue;
      }

      // Recherche partial match
      const partialMatch = sectionKeywords.find(sk =>
        sk.includes(queryLower) || queryLower.includes(sk)
      );

      if (partialMatch) {
        matchedKeywords.push(queryKeyword);
        totalScore += this.getKeywordWeight(queryKeyword) * 0.7; // Réduction pour match partiel
      }

      // TODO: Recherche sémantique avec embeddings
      // const semanticScore = await this.calculateSemanticSimilarity(queryKeyword, sectionKeywords);
      // if (semanticScore > 0.6) {
      //   totalScore += semanticScore * this.getKeywordWeight(queryKeyword) * 0.5;
      // }
    }

    // Normaliser par le nombre de keywords de la section
    return Math.min(totalScore / Math.max(sectionKeywords.length, 1), 1);
  }

  /**
   * Calcule le score contextuel
   */
  private calculateContextScore(
    section: ProfilSection,
    context: SelectionContext
  ): number {
    let score = 0;

    // Bonus pour les sections obligatoires
    if (section.est_obligatoire) {
      score += 0.5;
    }

    // Score selon le type de section et le contexte
    switch (section.type_section) {
      case 'expertise':
        if (context.complexity === 'complex') score += 0.3;
        break;
      case 'workflow':
        if (context.urgency === 'high') score += 0.4;
        break;
      case 'governance':
        if (context.user_context?.organization_size === 'enterprise') score += 0.2;
        break;
      default:
        break;
    }

    return Math.min(score, 1);
  }

  /**
   * Calcule la confiance dans le match
   */
  private calculateConfidence(
    section: ProfilSection,
    context: SelectionContext,
    matchedKeywords: string[]
  ): number {
    let confidence = 0;

    // Confiance basée sur le nombre de keywords matchés
    const matchRatio = matchedKeywords.length / Math.max(context.keywords.length, 1);
    confidence += matchRatio * 0.6;

    // Confiance basée sur la qualité de la section
    confidence += section.trigger_weight * 0.4;

    return Math.min(confidence, 1);
  }

  /**
   * Sélectionne les sections optimales sans conflits
   */
  private selectOptimalSections(
    scores: SectionScore[],
    maxSections: number
  ): SectionScore[] {
    const selected: SectionScore[] = [];
    const selectedIds = new Set<string>();

    for (const score of scores) {
      if (selected.length >= maxSections) break;

      // Vérifier les exclusions
      const hasExclusion = score.section.exclusions.some(excId => selectedIds.has(excId));
      if (hasExclusion) continue;

      selected.push(score);
      selectedIds.add(score.section.id);

      // Ajouter les dépendances nécessaires
      for (const depId of score.section.dependencies) {
        if (!selectedIds.has(depId)) {
          const depSection = scores.find(s => s.section.id === depId);
          if (depSection && selected.length < maxSections) {
            selected.push(depSection);
            selectedIds.add(depId);
          }
        }
      }
    }

    return selected;
  }

  /**
   * Détecte les conflits entre sections sélectionnées
   */
  private detectConflicts(sections: SectionScore[]): ConflictWarning[] {
    const conflicts: ConflictWarning[] = [];

    // TODO: Implémenter détection de conflits avancée
    // - Conflits sémantiques
    // - Redondances
    // - Incohérences

    return conflicts;
  }

  /**
   * Résout automatiquement les conflits détectés
   */
  private resolveConflicts(
    sections: SectionScore[],
    conflicts: ConflictWarning[]
  ): SectionScore[] {
    // TODO: Implémenter résolution automatique
    return sections;
  }

  /**
   * Assemble le prompt final à partir des sections sélectionnées
   */
  private assemblePrompt(
    profil: ProfilExpertise,
    sections: SectionScore[]
  ): string {
    let prompt = '';

    // 1. Identité core (toujours incluse)
    prompt += profil.identity_prompt + '\n\n';

    if (profil.mission_prompt) {
      prompt += profil.mission_prompt + '\n\n';
    }

    if (profil.personality_prompt) {
      prompt += profil.personality_prompt + '\n\n';
    }

    // 2. Sections sélectionnées par ordre de pertinence
    const sortedSections = sections.sort((a, b) => {
      // Prioriser les sections obligatoires
      if (a.section.est_obligatoire && !b.section.est_obligatoire) return -1;
      if (!a.section.est_obligatoire && b.section.est_obligatoire) return 1;

      // Puis par ordre défini dans le profil
      return a.section.ordre - b.section.ordre;
    });

    for (const scoreObj of sortedSections) {
      prompt += `## ${scoreObj.section.nom}\n`;
      prompt += scoreObj.section.prompt_template + '\n\n';
    }

    return prompt.trim();
  }

  // ================================
  // MÉTHODES UTILITAIRES
  // ================================

  private validateContext(context: SelectionContext): SelectionContext {
    if (!context.query?.trim()) {
      throw new Error('Query is required for section selection');
    }

    if (!context.keywords?.length) {
      context.keywords = this.extractKeywords(context.query);
    }

    return context;
  }

  private getAvailableSections(profil: ProfilExpertise): ProfilSection[] {
    return profil.sections.filter(section => section.est_active);
  }

  private extractKeywords(query: string): string[] {
    // TODO: Implémenter extraction intelligente de keywords
    // Pour l'instant, simple split et nettoyage
    return query
      .toLowerCase()
      .split(/\s+/)
      .map(word => word.replace(/[^\w]/g, ''))
      .filter(word => word.length > 2);
  }

  private getKeywordWeight(keyword: string): number {
    return this.keywordWeights.get(keyword.toLowerCase()) || 0.5;
  }

  private initializeKeywordWeights(): void {
    // Mots-clés techniques avec poids élevé
    const highWeightWords = [
      'audit', 'analyse', 'architecture', 'sécurité', 'performance',
      'optimisation', 'stratégie', 'formation', 'conseil'
    ];

    highWeightWords.forEach(word => {
      this.keywordWeights.set(word, 0.9);
    });

    // TODO: Charger les poids depuis une configuration ou ML
  }

  private calculateTotalScore(sections: SectionScore[]): number {
    if (sections.length === 0) return 0;

    return sections.reduce((sum, s) => sum + s.score, 0) / sections.length;
  }

  private generateRationale(
    section: ProfilSection,
    keywordScore: number,
    contextScore: number,
    matchedKeywords: string[]
  ): string {
    const reasons = [];

    if (matchedKeywords.length > 0) {
      reasons.push(`Mots-clés correspondants: ${matchedKeywords.join(', ')}`);
    }

    if (section.est_obligatoire) {
      reasons.push('Section obligatoire');
    }

    if (keywordScore > 0.7) {
      reasons.push('Forte correspondance sémantique');
    }

    return reasons.join('. ') || 'Correspondance basique';
  }
}

// ================================
// INTERFACES & OPTIONS
// ================================

export interface SelectionOptions {
  maxSections?: number;             // Nombre max de sections (défaut: 5)
  minScore?: number;               // Score minimum requis (défaut: 0.1)
  includeObligatory?: boolean;     // Inclure sections obligatoires (défaut: true)
  enableSemanticSearch?: boolean;  // Utiliser recherche sémantique (défaut: false)
  cacheResults?: boolean;          // Cache des résultats (défaut: true)
}

// ================================
// ERREURS CUSTOM
// ================================

export class SectionSelectionError extends Error {
  constructor(message: string, public details?: string) {
    super(message);
    this.name = 'SectionSelectionError';
  }
}

// ================================
// FACTORY FUNCTION
// ================================

export function createProfilSelector(): ProfilSectionSelector {
  return new ProfilSectionSelector();
}

// ================================
// EXEMPLES D'USAGE
// ================================

/*
// Exemple d'utilisation
const selector = createProfilSelector();

const context: SelectionContext = {
  query: "Je veux auditer la performance p95 de notre API de login",
  keywords: ["audit", "performance", "p95", "API", "login"],
  domain: "tech",
  urgency: "medium",
  complexity: "complex"
};

const result = await selector.selectSections(profil, context, {
  maxSections: 4,
  minScore: 0.2
});

console.log('Sections sélectionnées:', result.selected_sections.length);
console.log('Prompt assemblé:', result.assembly_prompt);
*/