// B30 Phase 2 - Assembleur de Prompts Intelligent
// Système d'assemblage et optimisation des prompts modulaires

import { ProfilExpertise, ParametresIA } from '../../db/models/profil';
import { SectionScore, SelectionContext } from './selector';

// ================================
// TYPES & INTERFACES
// ================================

export interface AssemblyOptions {
  includeMetadata?: boolean;        // Inclure métadonnées debug
  optimizeForProvider?: 'openai' | 'anthropic' | 'generic'; // Optimiser pour provider spécifique
  maxTokens?: number;              // Limite tokens (défaut: 4000)
  temperature?: number;            // Override température
  includeExamples?: boolean;       // Inclure exemples d'usage
  formatOutput?: 'standard' | 'structured' | 'minimal'; // Format de sortie
}

export interface AssembledPrompt {
  system_prompt: string;           // Prompt système complet
  user_prompt?: string;           // Prompt utilisateur si applicable
  parameters: ParametresIA;        // Paramètres IA optimisés
  metadata: PromptMetadata;        // Métadonnées d'assemblage
  token_estimate: number;          // Estimation nombre de tokens
  optimization_applied: string[];  // Optimisations appliquées
}

export interface PromptMetadata {
  profil_id: string;
  profil_version: string;
  sections_used: string[];         // IDs des sections utilisées
  assembly_time: Date;
  context_hash: string;            // Hash du contexte pour cache
  provider_optimized?: string;     // Provider pour lequel c'est optimisé
  quality_score: number;          // Score qualité assemblage (0-1)
}

// ================================
// ASSEMBLEUR PRINCIPAL
// ================================

export class PromptAssembler {
  private templates: Map<string, string> = new Map();
  private providerOptimizations: Map<string, ProviderConfig> = new Map();

  constructor() {
    this.initializeTemplates();
    this.initializeProviderConfigs();
  }

  /**
   * Assemble un prompt complet à partir des sections sélectionnées
   */
  async assemblePrompt(
    profil: ProfilExpertise,
    selectedSections: SectionScore[],
    context: SelectionContext,
    options: AssemblyOptions = {}
  ): Promise<AssembledPrompt> {
    const startTime = Date.now();

    try {
      // 1. Préparation et validation
      this.validateInputs(profil, selectedSections);

      // 2. Assemblage de base
      const basePrompt = this.buildBasePrompt(profil, selectedSections, options);

      // 3. Optimisation selon le provider
      const optimizedPrompt = await this.optimizeForProvider(
        basePrompt,
        options.optimizeForProvider || 'generic'
      );

      // 4. Ajout des exemples si demandé
      const promptWithExamples = options.includeExamples
        ? this.addExamples(optimizedPrompt, selectedSections)
        : optimizedPrompt;

      // 5. Optimisation tokens
      const finalPrompt = await this.optimizeTokens(
        promptWithExamples,
        options.maxTokens || 4000
      );

      // 6. Calcul des paramètres optimaux
      const optimizedParams = this.calculateOptimalParameters(
        profil,
        selectedSections,
        options
      );

      // 7. Génération métadonnées
      const metadata = this.generateMetadata(
        profil,
        selectedSections,
        context,
        startTime,
        options
      );

      return {
        system_prompt: finalPrompt,
        parameters: optimizedParams,
        metadata,
        token_estimate: this.estimateTokens(finalPrompt),
        optimization_applied: this.getAppliedOptimizations(options)
      };

    } catch (error) {
      console.error('Error in prompt assembly:', error);
      throw new PromptAssemblyError(
        'Failed to assemble prompt',
        error instanceof Error ? error.message : 'Unknown error'
      );
    }
  }

  /**
   * Construit le prompt de base à partir des sections
   */
  private buildBasePrompt(
    profil: ProfilExpertise,
    sections: SectionScore[],
    options: AssemblyOptions
  ): string {
    let prompt = '';

    // 1. Identité Core (toujours en premier)
    prompt += this.buildIdentitySection(profil);

    // 2. Sections triées par priorité
    const sortedSections = this.sortSectionsByPriority(sections);

    for (const sectionScore of sortedSections) {
      const section = sectionScore.section;
      prompt += this.buildSectionPrompt(section, sectionScore);
    }

    // 3. Instructions de format si demandé
    if (options.formatOutput) {
      prompt += this.buildFormatInstructions(options.formatOutput);
    }

    // 4. Métadonnées debug si demandé
    if (options.includeMetadata) {
      prompt += this.buildDebugMetadata(sections);
    }

    return prompt;
  }

  /**
   * Construit la section identité du profil
   */
  private buildIdentitySection(profil: ProfilExpertise): string {
    let section = '';

    // Prompt d'identité principal
    section += `# IDENTITÉ PROFIL\n${profil.identity_prompt}\n\n`;

    // Mission si définie
    if (profil.mission_prompt) {
      section += `# MISSION\n${profil.mission_prompt}\n\n`;
    }

    // Personnalité si définie
    if (profil.personality_prompt) {
      section += `# STYLE DE COMMUNICATION\n${profil.personality_prompt}\n\n`;
    }

    return section;
  }

  /**
   * Construit le prompt pour une section individuelle
   */
  private buildSectionPrompt(section: any, score: SectionScore): string {
    let sectionPrompt = '';

    // Header de section
    sectionPrompt += `# ${section.nom.toUpperCase()}\n`;

    // Prompt principal de la section
    sectionPrompt += section.prompt_template + '\n';

    // Exemple d'utilisation si disponible
    if (section.exemple_utilisation) {
      sectionPrompt += `\nExemple: ${section.exemple_utilisation}\n`;
    }

    sectionPrompt += '\n';

    return sectionPrompt;
  }

  /**
   * Trie les sections par priorité d'assemblage
   */
  private sortSectionsByPriority(sections: SectionScore[]): SectionScore[] {
    return sections.sort((a, b) => {
      // 1. Sections obligatoires en premier
      if (a.section.est_obligatoire && !b.section.est_obligatoire) return -1;
      if (!a.section.est_obligatoire && b.section.est_obligatoire) return 1;

      // 2. Par type de section (ordre logique)
      const typeOrder = {
        'expertise': 1,
        'scope': 2,
        'workflow': 3,
        'governance': 4,
        'outputs': 5
      };

      const aOrder = typeOrder[a.section.type_section as keyof typeof typeOrder] || 99;
      const bOrder = typeOrder[b.section.type_section as keyof typeof typeOrder] || 99;

      if (aOrder !== bOrder) return aOrder - bOrder;

      // 3. Par ordre défini dans le profil
      if (a.section.ordre !== b.section.ordre) {
        return a.section.ordre - b.section.ordre;
      }

      // 4. Par score de pertinence
      return b.score - a.score;
    });
  }

  /**
   * Optimise le prompt selon le provider IA
   */
  private async optimizeForProvider(
    prompt: string,
    provider: string
  ): Promise<string> {
    const config = this.providerOptimizations.get(provider);
    if (!config) return prompt;

    let optimizedPrompt = prompt;

    // Optimisations spécifiques au provider
    for (const optimization of config.optimizations) {
      optimizedPrompt = this.applyOptimization(optimizedPrompt, optimization);
    }

    return optimizedPrompt;
  }

  /**
   * Ajoute des exemples d'utilisation aux sections
   */
  private addExamples(prompt: string, sections: SectionScore[]): string {
    let exampleSection = '\n# EXEMPLES D\'UTILISATION\n';
    let hasExamples = false;

    for (const sectionScore of sections) {
      if (sectionScore.section.exemple_utilisation) {
        exampleSection += `**${sectionScore.section.nom}**: ${sectionScore.section.exemple_utilisation}\n`;
        hasExamples = true;
      }
    }

    return hasExamples ? prompt + exampleSection : prompt;
  }

  /**
   * Optimise le prompt pour respecter les limites de tokens
   */
  private async optimizeTokens(prompt: string, maxTokens: number): Promise<string> {
    const currentTokens = this.estimateTokens(prompt);

    if (currentTokens <= maxTokens) {
      return prompt;
    }

    // Stratégies de réduction progressive
    let optimizedPrompt = prompt;

    // 1. Suppression des exemples non essentiels
    optimizedPrompt = this.removeNonEssentialExamples(optimizedPrompt);

    // 2. Compression des sections redondantes
    optimizedPrompt = this.compressRedundantSections(optimizedPrompt);

    // 3. Simplification du langage si nécessaire
    if (this.estimateTokens(optimizedPrompt) > maxTokens) {
      optimizedPrompt = this.simplifyLanguage(optimizedPrompt);
    }

    return optimizedPrompt;
  }

  /**
   * Calcule les paramètres optimaux pour l'IA
   */
  private calculateOptimalParameters(
    profil: ProfilExpertise,
    sections: SectionScore[],
    options: AssemblyOptions
  ): ParametresIA {
    // Paramètres de base du profil
    const baseParams = profil.parametres_base || {};

    // Ajustements selon les sections sélectionnées
    let temperature = baseParams.temperature || 0.7;
    let maxTokens = baseParams.max_tokens || 2000;

    // Réduction température pour sections techniques
    const hasTechnicalSections = sections.some(s =>
      ['expertise', 'governance'].includes(s.section.type_section)
    );

    if (hasTechnicalSections) {
      temperature = Math.max(temperature - 0.2, 0.1);
    }

    // Augmentation tokens pour sorties complexes
    const hasOutputSections = sections.some(s =>
      s.section.type_section === 'outputs'
    );

    if (hasOutputSections) {
      maxTokens = Math.min(maxTokens + 500, 4000);
    }

    // Override utilisateur
    if (options.temperature !== undefined) {
      temperature = options.temperature;
    }

    if (options.maxTokens !== undefined) {
      maxTokens = options.maxTokens;
    }

    return {
      temperature,
      max_tokens: maxTokens,
      top_p: baseParams.top_p || 0.9,
      frequency_penalty: baseParams.frequency_penalty || 0,
      presence_penalty: baseParams.presence_penalty || 0
    };
  }

  /**
   * Génère les métadonnées d'assemblage
   */
  private generateMetadata(
    profil: ProfilExpertise,
    sections: SectionScore[],
    context: SelectionContext,
    startTime: number,
    options: AssemblyOptions
  ): PromptMetadata {
    return {
      profil_id: profil.id,
      profil_version: profil.version,
      sections_used: sections.map(s => s.section.id),
      assembly_time: new Date(),
      context_hash: this.generateContextHash(context),
      provider_optimized: options.optimizeForProvider,
      quality_score: this.calculateQualityScore(sections)
    };
  }

  // ================================
  // MÉTHODES UTILITAIRES
  // ================================

  private validateInputs(profil: ProfilExpertise, sections: SectionScore[]): void {
    if (!profil.identity_prompt) {
      throw new Error('Profil must have identity_prompt for assembly');
    }

    if (sections.length === 0) {
      throw new Error('At least one section must be selected for assembly');
    }
  }

  private estimateTokens(text: string): number {
    // Estimation approximative : 1 token ≈ 4 caractères pour le français
    return Math.ceil(text.length / 4);
  }

  private generateContextHash(context: SelectionContext): string {
    const hashInput = JSON.stringify({
      query: context.query,
      keywords: context.keywords.sort(),
      domain: context.domain
    });

    // Simple hash pour l'instant (à remplacer par crypto.hash en production)
    return Buffer.from(hashInput).toString('base64').slice(0, 16);
  }

  private calculateQualityScore(sections: SectionScore[]): number {
    if (sections.length === 0) return 0;

    const avgScore = sections.reduce((sum, s) => sum + s.score, 0) / sections.length;
    const avgConfidence = sections.reduce((sum, s) => sum + s.confidence, 0) / sections.length;

    return (avgScore + avgConfidence) / 2;
  }

  private getAppliedOptimizations(options: AssemblyOptions): string[] {
    const optimizations = [];

    if (options.optimizeForProvider) {
      optimizations.push(`provider_${options.optimizeForProvider}`);
    }

    if (options.includeExamples) {
      optimizations.push('examples_added');
    }

    if (options.maxTokens) {
      optimizations.push('token_optimization');
    }

    return optimizations;
  }

  private buildFormatInstructions(format: string): string {
    const instructions = {
      structured: '\n# FORMAT DE SORTIE\nStructure ta réponse avec des sections claires et numérotées.\n\n',
      minimal: '\n# FORMAT DE SORTIE\nSois concis et direct dans tes réponses.\n\n',
      standard: ''
    };

    return instructions[format as keyof typeof instructions] || '';
  }

  private buildDebugMetadata(sections: SectionScore[]): string {
    return `\n<!-- DEBUG: ${sections.length} sections utilisées -->\n`;
  }

  // Méthodes d'optimisation (implémentation basique)
  private applyOptimization(prompt: string, optimization: any): string {
    return prompt; // TODO: Implémenter optimisations spécifiques
  }

  private removeNonEssentialExamples(prompt: string): string {
    return prompt; // TODO: Implémenter suppression d'exemples
  }

  private compressRedundantSections(prompt: string): string {
    return prompt; // TODO: Implémenter compression
  }

  private simplifyLanguage(prompt: string): string {
    return prompt; // TODO: Implémenter simplification
  }

  private initializeTemplates(): void {
    // TODO: Charger templates depuis configuration
  }

  private initializeProviderConfigs(): void {
    // Configurations spécifiques aux providers
    this.providerOptimizations.set('openai', {
      optimizations: ['clear_instructions', 'role_definition'],
      maxTokens: 4000,
      preferredStructure: 'hierarchical'
    });

    this.providerOptimizations.set('anthropic', {
      optimizations: ['detailed_context', 'explicit_constraints'],
      maxTokens: 8000,
      preferredStructure: 'conversational'
    });
  }
}

// ================================
// INTERFACES SUPPORT
// ================================

interface ProviderConfig {
  optimizations: string[];
  maxTokens: number;
  preferredStructure: string;
}

// ================================
// ERREURS CUSTOM
// ================================

export class PromptAssemblyError extends Error {
  constructor(message: string, public details?: string) {
    super(message);
    this.name = 'PromptAssemblyError';
  }
}

// ================================
// FACTORY FUNCTION
// ================================

export function createPromptAssembler(): PromptAssembler {
  return new PromptAssembler();
}