// B30 Phase 2 - Moteur B30 Principal
// Orchestrateur principal pour l'exécution des profils modulaires

import { ProfilExpertise } from '../db/models/profil';
import { ProfilSectionSelector, SelectionContext, createProfilSelector } from './prompt-engine/selector';
import { PromptAssembler, AssemblyOptions, createPromptAssembler } from './prompt-engine/assembler';
import { OpenAIConnector, ProviderResponse, ExecutionOptions, createOpenAIConnector } from './providers/openai-connector';
import { query } from '../db/connection';

// ================================
// TYPES & INTERFACES
// ================================

export interface B30ExecutionRequest {
  profil_id: string;               // ID du profil à utiliser
  user_query: string;              // Demande utilisateur
  context?: Partial<SelectionContext>; // Contexte d'exécution
  options?: B30ExecutionOptions;   // Options d'exécution
}

export interface B30ExecutionOptions {
  // Sélection des sections
  maxSections?: number;
  minSectionScore?: number;
  includeObligatorySections?: boolean;

  // Assemblage du prompt
  optimizeForProvider?: 'openai' | 'anthropic' | 'generic';
  includeExamples?: boolean;
  maxTokens?: number;

  // Exécution
  provider?: 'openai' | 'anthropic';
  cacheResponse?: boolean;
  validateResponse?: boolean;
  includeUserContext?: boolean;
  customInstructions?: string;

  // Debug & Analytics
  enableDetailedLogs?: boolean;
  includeDebugInfo?: boolean;
  trackAnalytics?: boolean;
}

export interface B30ExecutionResult {
  // Résultat principal
  response: string;                // Réponse finale de l'IA
  execution_success: boolean;      // Succès de l'exécution

  // Métadonnées d'exécution
  metadata: B30ExecutionMetadata;

  // Debug info si demandé
  debug_info?: B30DebugInfo;

  // Métriques de performance
  performance: {
    total_time_ms: number;
    selection_time_ms: number;
    assembly_time_ms: number;
    execution_time_ms: number;
    tokens_used: number;
    cache_hit: boolean;
  };
}

export interface B30ExecutionMetadata {
  profil_used: {
    id: string;
    nom: string;
    version: string;
  };
  sections_selected: {
    count: number;
    types: string[];
    average_score: number;
  };
  provider_used: string;
  execution_id: string;
  created_at: Date;
  context_hash: string;
}

export interface B30DebugInfo {
  raw_context: SelectionContext;
  sections_scores: any[];
  assembled_prompt: string;
  provider_request: any;
  conflicts_detected: any[];
  optimizations_applied: string[];
}

// ================================
// MOTEUR B30 PRINCIPAL
// ================================

export class B30Engine {
  private selector: ProfilSectionSelector;
  private assembler: PromptAssembler;
  private providers: Map<string, any> = new Map();
  private executionCache: Map<string, B30ExecutionResult> = new Map();

  constructor() {
    this.selector = createProfilSelector();
    this.assembler = createPromptAssembler();
    this.initializeProviders();
  }

  /**
   * Exécute une requête avec un profil B30
   */
  async execute(request: B30ExecutionRequest): Promise<B30ExecutionResult> {
    const executionId = this.generateExecutionId();
    const startTime = Date.now();

    try {
      // 1. Validation de la requête
      this.validateRequest(request);

      // 2. Chargement du profil
      const profil = await this.loadProfil(request.profil_id);

      // 3. Construction du contexte complet
      const context = await this.buildExecutionContext(request, profil);

      // 4. Vérification cache
      if (request.options?.cacheResponse) {
        const cachedResult = this.checkCache(request, context);
        if (cachedResult) {
          return this.addPerformanceMetrics(cachedResult, startTime, true);
        }
      }

      // 5. Sélection des sections pertinentes
      const selectionStart = Date.now();
      const selectionResult = await this.selector.selectSections(
        profil,
        context,
        {
          maxSections: request.options?.maxSections || 5,
          minScore: request.options?.minSectionScore || 0.1,
          includeObligatory: request.options?.includeObligatorySections !== false
        }
      );
      const selectionTime = Date.now() - selectionStart;

      // 6. Assemblage du prompt
      const assemblyStart = Date.now();
      const assembledPrompt = await this.assembler.assemblePrompt(
        profil,
        selectionResult.selected_sections,
        context,
        {
          optimizeForProvider: request.options?.optimizeForProvider || 'openai',
          includeExamples: request.options?.includeExamples || false,
          maxTokens: request.options?.maxTokens || 4000
        }
      );
      const assemblyTime = Date.now() - assemblyStart;

      // 7. Exécution via provider IA
      const executionStart = Date.now();
      const providerResponse = await this.executeWithProvider(
        assembledPrompt,
        request.user_query,
        context,
        request.options || {}
      );
      const executionTime = Date.now() - executionStart;

      // 8. Construction du résultat final
      const result: B30ExecutionResult = {
        response: providerResponse.content,
        execution_success: true,
        metadata: {
          profil_used: {
            id: profil.id,
            nom: profil.nom,
            version: profil.version
          },
          sections_selected: {
            count: selectionResult.selected_sections.length,
            types: [...new Set(selectionResult.selected_sections.map(s => s.section.type_section))],
            average_score: selectionResult.total_score
          },
          provider_used: request.options?.provider || 'openai',
          execution_id: executionId,
          created_at: new Date(),
          context_hash: selectionResult.metadata.keywords_used.join('-')
        },
        performance: {
          total_time_ms: Date.now() - startTime,
          selection_time_ms: selectionTime,
          assembly_time_ms: assemblyTime,
          execution_time_ms: executionTime,
          tokens_used: providerResponse.usage.total_tokens,
          cache_hit: false
        }
      };

      // 9. Ajout debug info si demandé
      if (request.options?.includeDebugInfo) {
        result.debug_info = {
          raw_context: context,
          sections_scores: selectionResult.selected_sections,
          assembled_prompt: assembledPrompt.system_prompt,
          provider_request: {
            model: providerResponse.model_used,
            parameters: assembledPrompt.parameters
          },
          conflicts_detected: selectionResult.metadata.conflicts_detected,
          optimizations_applied: assembledPrompt.optimization_applied
        };
      }

      // 10. Cache du résultat
      if (request.options?.cacheResponse) {
        this.cacheResult(request, context, result);
      }

      // 11. Tracking analytics
      if (request.options?.trackAnalytics) {
        await this.trackExecution(request, result);
      }

      // 12. Logging détaillé
      if (request.options?.enableDetailedLogs) {
        this.logDetailedExecution(request, result);
      }

      return result;

    } catch (error) {
      console.error('B30 Engine execution error:', error);

      return {
        response: 'Désolé, une erreur est survenue lors du traitement de votre demande.',
        execution_success: false,
        metadata: {
          profil_used: { id: request.profil_id, nom: 'Unknown', version: 'Unknown' },
          sections_selected: { count: 0, types: [], average_score: 0 },
          provider_used: request.options?.provider || 'openai',
          execution_id: executionId,
          created_at: new Date(),
          context_hash: 'error'
        },
        performance: {
          total_time_ms: Date.now() - startTime,
          selection_time_ms: 0,
          assembly_time_ms: 0,
          execution_time_ms: 0,
          tokens_used: 0,
          cache_hit: false
        }
      };
    }
  }

  /**
   * Exécute en mode batch pour plusieurs requêtes
   */
  async executeBatch(requests: B30ExecutionRequest[]): Promise<B30ExecutionResult[]> {
    // Exécution parallèle avec limite de concurrence
    const concurrencyLimit = 5;
    const results: B30ExecutionResult[] = [];

    for (let i = 0; i < requests.length; i += concurrencyLimit) {
      const batch = requests.slice(i, i + concurrencyLimit);
      const batchResults = await Promise.all(
        batch.map(request => this.execute(request))
      );
      results.push(...batchResults);
    }

    return results;
  }

  // ================================
  // MÉTHODES PRIVÉES
  // ================================

  private validateRequest(request: B30ExecutionRequest): void {
    if (!request.profil_id) {
      throw new Error('profil_id is required');
    }

    if (!request.user_query?.trim()) {
      throw new Error('user_query is required');
    }

    if (request.user_query.length > 10000) {
      throw new Error('user_query too long (max 10000 characters)');
    }
  }

  private async loadProfil(profilId: string): Promise<ProfilExpertise> {
    // TODO: Remplacer par vraie requête base de données
    const result = await query(
      'SELECT * FROM agent_profils WHERE id = $1 AND supprime_le IS NULL',
      [profilId]
    );

    if (result.rows.length === 0) {
      throw new Error(`Profil not found: ${profilId}`);
    }

    // TODO: Charger aussi les sections
    const profil = result.rows[0];

    return {
      ...profil,
      sections: [] // TODO: Charger les sections réelles
    };
  }

  private async buildExecutionContext(
    request: B30ExecutionRequest,
    profil: ProfilExpertise
  ): Promise<SelectionContext> {
    // Extraction keywords de base
    const keywords = this.extractKeywords(request.user_query);

    // Construction du contexte complet
    return {
      query: request.user_query,
      keywords,
      domain: request.context?.domain || profil.domaine.toLowerCase(),
      urgency: request.context?.urgency || this.detectUrgency(request.user_query),
      complexity: request.context?.complexity || this.detectComplexity(request.user_query),
      user_context: request.context?.user_context
    };
  }

  private extractKeywords(query: string): string[] {
    // Extraction simple pour l'instant
    const stopWords = new Set(['le', 'la', 'les', 'un', 'une', 'de', 'du', 'des', 'et', 'ou', 'pour', 'avec']);

    return query
      .toLowerCase()
      .replace(/[^\w\sàâäéêëïîôöùûüÿç]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 10); // Limiter à 10 keywords
  }

  private detectUrgency(query: string): 'low' | 'medium' | 'high' {
    const urgentWords = ['urgent', 'rapidement', 'vite', 'immédiat', 'asap', 'critique'];
    const queryLower = query.toLowerCase();

    if (urgentWords.some(word => queryLower.includes(word))) {
      return 'high';
    }

    return 'medium';
  }

  private detectComplexity(query: string): 'simple' | 'complex' {
    const complexWords = ['analyse', 'architecture', 'optimisation', 'stratégie', 'audit', 'évaluation'];
    const queryLower = query.toLowerCase();

    if (complexWords.some(word => queryLower.includes(word))) {
      return 'complex';
    }

    return 'simple';
  }

  private async executeWithProvider(
    assembledPrompt: any,
    userQuery: string,
    context: SelectionContext,
    options: B30ExecutionOptions
  ): Promise<ProviderResponse> {
    const providerName = options.provider || 'openai';
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`Provider not available: ${providerName}`);
    }

    const executionOptions: ExecutionOptions = {
      includeContext: options.includeUserContext || false,
      validateResponse: options.validateResponse || false,
      cacheResponse: options.cacheResponse || false,
      customInstructions: options.customInstructions
    };

    return provider.executePrompt(assembledPrompt, userQuery, context, executionOptions);
  }

  private initializeProviders(): void {
    try {
      // Provider OpenAI
      if (process.env.OPENAI_API_KEY) {
        const openaiConnector = createOpenAIConnector({
          model: 'gpt-4-turbo-preview'
        });
        this.providers.set('openai', openaiConnector);
      }

      // TODO: Ajouter provider Anthropic
      // if (process.env.ANTHROPIC_API_KEY) {
      //   const anthropicConnector = createAnthropicConnector();
      //   this.providers.set('anthropic', anthropicConnector);
      // }
    } catch (error) {
      console.warn('Some providers failed to initialize:', error);
    }
  }

  private checkCache(request: B30ExecutionRequest, context: SelectionContext): B30ExecutionResult | null {
    const cacheKey = this.generateCacheKey(request, context);
    return this.executionCache.get(cacheKey) || null;
  }

  private cacheResult(
    request: B30ExecutionRequest,
    context: SelectionContext,
    result: B30ExecutionResult
  ): void {
    const cacheKey = this.generateCacheKey(request, context);
    this.executionCache.set(cacheKey, result);

    // Limiter la taille du cache
    if (this.executionCache.size > 1000) {
      const firstKey = this.executionCache.keys().next().value;
      this.executionCache.delete(firstKey);
    }
  }

  private generateCacheKey(request: B30ExecutionRequest, context: SelectionContext): string {
    const keyInput = {
      profil_id: request.profil_id,
      query: request.user_query.toLowerCase().trim(),
      keywords: context.keywords.sort(),
      options: request.options
    };

    return Buffer.from(JSON.stringify(keyInput)).toString('base64').slice(0, 32);
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addPerformanceMetrics(
    result: B30ExecutionResult,
    startTime: number,
    cacheHit: boolean
  ): B30ExecutionResult {
    return {
      ...result,
      performance: {
        ...result.performance,
        total_time_ms: Date.now() - startTime,
        cache_hit: cacheHit
      }
    };
  }

  private async trackExecution(request: B30ExecutionRequest, result: B30ExecutionResult): Promise<void> {
    // TODO: Implémenter tracking analytics
    // - Stocker métriques en base
    // - Envoyer événements analytics
    // - Calculer KPIs d'usage
  }

  private logDetailedExecution(request: B30ExecutionRequest, result: B30ExecutionResult): void {
    console.log('B30 Detailed Execution Log:', {
      execution_id: result.metadata.execution_id,
      profil: result.metadata.profil_used.nom,
      query_length: request.user_query.length,
      sections_used: result.metadata.sections_selected.count,
      success: result.execution_success,
      performance: result.performance,
      provider: result.metadata.provider_used
    });
  }

  // ================================
  // MÉTHODES PUBLIQUES UTILITAIRES
  // ================================

  /**
   * Obtient les statistiques du moteur
   */
  getEngineStats(): {
    providers_available: string[];
    cache_size: number;
    executions_cached: number;
  } {
    return {
      providers_available: Array.from(this.providers.keys()),
      cache_size: this.executionCache.size,
      executions_cached: this.executionCache.size
    };
  }

  /**
   * Nettoie les caches du moteur
   */
  clearCaches(): void {
    this.executionCache.clear();
    // Nettoyer aussi les caches des providers
    this.providers.forEach(provider => {
      if (provider.clearCache) {
        provider.clearCache();
      }
    });
  }

  /**
   * Teste la disponibilité des providers
   */
  async testProviders(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [name, provider] of this.providers.entries()) {
      try {
        results[name] = await provider.testConnection();
      } catch (error) {
        results[name] = false;
      }
    }

    return results;
  }
}

// ================================
// FACTORY FUNCTION
// ================================

export function createB30Engine(): B30Engine {
  return new B30Engine();
}

// ================================
// INSTANCE GLOBALE (SINGLETON)
// ================================

let globalEngine: B30Engine | null = null;

export function getB30Engine(): B30Engine {
  if (!globalEngine) {
    globalEngine = createB30Engine();
  }
  return globalEngine;
}