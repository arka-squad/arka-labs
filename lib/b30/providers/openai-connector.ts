// B30 Phase 2 - Connecteur Provider OpenAI
// Interface pour l'exécution des prompts assemblés via OpenAI

import OpenAI from 'openai';
import { AssembledPrompt } from '../prompt-engine/assembler';
import { SelectionContext } from '../prompt-engine/selector';

// ================================
// TYPES & INTERFACES
// ================================

export interface ProviderResponse {
  content: string;               // Contenu de la réponse
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model_used: string;
  response_time_ms: number;
  metadata: ResponseMetadata;
}

export interface ResponseMetadata {
  provider: 'openai' | 'anthropic';
  request_id: string;
  created_at: Date;
  context_preserved: boolean;
  quality_indicators: {
    coherence_score?: number;
    relevance_score?: number;
    completeness_score?: number;
  };
}

export interface ProviderConfig {
  apiKey: string;
  model: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
  enableLogging?: boolean;
}

export interface ExecutionOptions {
  streamResponse?: boolean;      // Stream de la réponse
  includeContext?: boolean;      // Inclure contexte utilisateur
  validateResponse?: boolean;    // Validation qualité réponse
  cacheResponse?: boolean;       // Cache de la réponse
  customInstructions?: string;   // Instructions supplémentaires
}

// ================================
// CONNECTEUR OPENAI PRINCIPAL
// ================================

export class OpenAIConnector {
  private client: OpenAI;
  private config: ProviderConfig;
  private responseCache: Map<string, ProviderResponse> = new Map();

  constructor(config: ProviderConfig) {
    this.config = {
      model: 'gpt-4-turbo-preview',
      timeout: 30000,
      maxRetries: 3,
      enableLogging: process.env.NODE_ENV === 'development',
      ...config
    };

    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      maxRetries: this.config.maxRetries
    });
  }

  /**
   * Exécute un prompt assemblé via OpenAI
   */
  async executePrompt(
    assembledPrompt: AssembledPrompt,
    userQuery: string,
    context: SelectionContext,
    options: ExecutionOptions = {}
  ): Promise<ProviderResponse> {
    const startTime = Date.now();

    try {
      // 1. Préparation de la requête
      const messages = this.prepareMessages(
        assembledPrompt,
        userQuery,
        context,
        options
      );

      // 2. Vérification du cache si activé
      if (options.cacheResponse) {
        const cacheKey = this.generateCacheKey(assembledPrompt, userQuery);
        const cachedResponse = this.responseCache.get(cacheKey);
        if (cachedResponse) {
          return cachedResponse;
        }
      }

      // 3. Exécution via OpenAI
      const completion = await this.client.chat.completions.create({
        model: this.config.model,
        messages,
        temperature: assembledPrompt.parameters.temperature || 0.7,
        max_tokens: assembledPrompt.parameters.max_tokens || 2000,
        top_p: assembledPrompt.parameters.top_p || 1,
        frequency_penalty: assembledPrompt.parameters.frequency_penalty || 0,
        presence_penalty: assembledPrompt.parameters.presence_penalty || 0,
        stream: options.streamResponse || false
      });

      // 4. Traitement de la réponse
      const response = this.processResponse(
        completion,
        assembledPrompt,
        startTime,
        options
      );

      // 5. Validation si demandée
      if (options.validateResponse) {
        await this.validateResponse(response, context);
      }

      // 6. Cache de la réponse si activé
      if (options.cacheResponse) {
        const cacheKey = this.generateCacheKey(assembledPrompt, userQuery);
        this.responseCache.set(cacheKey, response);
      }

      // 7. Logging si activé
      if (this.config.enableLogging) {
        this.logExecution(assembledPrompt, userQuery, response);
      }

      return response;

    } catch (error) {
      console.error('Error executing prompt with OpenAI:', error);
      throw new ProviderExecutionError(
        'Failed to execute prompt',
        error instanceof Error ? error.message : 'Unknown error',
        'openai'
      );
    }
  }

  /**
   * Prépare les messages pour l'API OpenAI
   */
  private prepareMessages(
    assembledPrompt: AssembledPrompt,
    userQuery: string,
    context: SelectionContext,
    options: ExecutionOptions
  ): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

    // Message système avec le prompt assemblé
    messages.push({
      role: 'system',
      content: assembledPrompt.system_prompt
    });

    // Contexte utilisateur si demandé
    if (options.includeContext && context.user_context) {
      const contextMessage = this.buildContextMessage(context);
      if (contextMessage) {
        messages.push({
          role: 'system',
          content: contextMessage
        });
      }
    }

    // Instructions supplémentaires si fournies
    if (options.customInstructions) {
      messages.push({
        role: 'system',
        content: `Instructions supplémentaires: ${options.customInstructions}`
      });
    }

    // Requête utilisateur
    messages.push({
      role: 'user',
      content: userQuery
    });

    return messages;
  }

  /**
   * Construit le message de contexte utilisateur
   */
  private buildContextMessage(context: SelectionContext): string | null {
    if (!context.user_context) return null;

    const contextParts = [];

    if (context.user_context.role) {
      contextParts.push(`Rôle utilisateur: ${context.user_context.role}`);
    }

    if (context.user_context.organization_size) {
      contextParts.push(`Taille organisation: ${context.user_context.organization_size}`);
    }

    if (context.user_context.industry?.length) {
      contextParts.push(`Secteur(s): ${context.user_context.industry.join(', ')}`);
    }

    if (context.urgency) {
      contextParts.push(`Urgence: ${context.urgency}`);
    }

    if (context.complexity) {
      contextParts.push(`Complexité: ${context.complexity}`);
    }

    return contextParts.length > 0
      ? `Contexte: ${contextParts.join(', ')}`
      : null;
  }

  /**
   * Traite la réponse d'OpenAI
   */
  private processResponse(
    completion: OpenAI.Chat.Completions.ChatCompletion,
    assembledPrompt: AssembledPrompt,
    startTime: number,
    options: ExecutionOptions
  ): ProviderResponse {
    const choice = completion.choices[0];
    const content = choice.message.content || '';

    return {
      content,
      usage: {
        prompt_tokens: completion.usage?.prompt_tokens || 0,
        completion_tokens: completion.usage?.completion_tokens || 0,
        total_tokens: completion.usage?.total_tokens || 0
      },
      model_used: completion.model,
      response_time_ms: Date.now() - startTime,
      metadata: {
        provider: 'openai',
        request_id: completion.id,
        created_at: new Date(),
        context_preserved: options.includeContext || false,
        quality_indicators: {
          // TODO: Calculer indicateurs qualité
          coherence_score: undefined,
          relevance_score: undefined,
          completeness_score: undefined
        }
      }
    };
  }

  /**
   * Valide la qualité de la réponse
   */
  private async validateResponse(
    response: ProviderResponse,
    context: SelectionContext
  ): Promise<void> {
    // TODO: Implémenter validation qualité
    // - Vérifier cohérence avec le contexte
    // - Analyser complétude de la réponse
    // - Détecter hallucinations potentielles

    const issues = [];

    // Validation basique longueur
    if (response.content.length < 10) {
      issues.push('Response too short');
    }

    if (response.content.length > 10000) {
      issues.push('Response too long');
    }

    // TODO: Validations plus sophistiquées
    // - Analyse sentiment si inapproprié
    // - Vérification respect des contraintes
    // - Détection de contenu problématique

    if (issues.length > 0) {
      console.warn('Response validation issues:', issues);
    }
  }

  /**
   * Génère une clé de cache pour la requête
   */
  private generateCacheKey(
    assembledPrompt: AssembledPrompt,
    userQuery: string
  ): string {
    const keyInput = {
      profil_id: assembledPrompt.metadata.profil_id,
      sections: assembledPrompt.metadata.sections_used.sort(),
      query: userQuery.toLowerCase().trim(),
      params: assembledPrompt.parameters
    };

    // Simple hash pour l'instant
    return Buffer.from(JSON.stringify(keyInput))
      .toString('base64')
      .slice(0, 32);
  }

  /**
   * Log l'exécution pour debug
   */
  private logExecution(
    assembledPrompt: AssembledPrompt,
    userQuery: string,
    response: ProviderResponse
  ): void {
    console.log('OpenAI Execution:', {
      profil_id: assembledPrompt.metadata.profil_id,
      sections_count: assembledPrompt.metadata.sections_used.length,
      query_length: userQuery.length,
      response_length: response.content.length,
      tokens_used: response.usage.total_tokens,
      response_time: response.response_time_ms,
      model: response.model_used
    });
  }

  // ================================
  // MÉTHODES UTILITAIRES
  // ================================

  /**
   * Teste la connexion au provider
   */
  async testConnection(): Promise<boolean> {
    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Test connection' }],
        max_tokens: 5
      });

      return completion.choices.length > 0;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }

  /**
   * Obtient les modèles disponibles
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const models = await this.client.models.list();
      return models.data
        .filter(model => model.id.includes('gpt'))
        .map(model => model.id)
        .sort();
    } catch (error) {
      console.error('Failed to get available models:', error);
      return ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'];
    }
  }

  /**
   * Nettoie le cache des réponses
   */
  clearCache(): void {
    this.responseCache.clear();
  }

  /**
   * Obtient les statistiques du cache
   */
  getCacheStats(): { size: number; hitRate: number } {
    // TODO: Implémenter tracking des hits/misses
    return {
      size: this.responseCache.size,
      hitRate: 0 // Calculé avec les hits/misses
    };
  }

  /**
   * Configure les paramètres du connecteur
   */
  updateConfig(newConfig: Partial<ProviderConfig>): void {
    this.config = { ...this.config, ...newConfig };

    // Recréer le client si nécessaire
    if (newConfig.apiKey || newConfig.baseURL) {
      this.client = new OpenAI({
        apiKey: this.config.apiKey,
        baseURL: this.config.baseURL,
        timeout: this.config.timeout,
        maxRetries: this.config.maxRetries
      });
    }
  }
}

// ================================
// ERREURS CUSTOM
// ================================

export class ProviderExecutionError extends Error {
  constructor(
    message: string,
    public details?: string,
    public provider?: string
  ) {
    super(message);
    this.name = 'ProviderExecutionError';
  }
}

// ================================
// FACTORY FUNCTIONS
// ================================

export function createOpenAIConnector(config?: Partial<ProviderConfig>): OpenAIConnector {
  const apiKey = config?.apiKey || process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  return new OpenAIConnector({
    apiKey,
    ...config
  });
}

// ================================
// EXEMPLES D'USAGE
// ================================

/*
// Exemple d'utilisation
const connector = createOpenAIConnector({
  model: 'gpt-4-turbo-preview',
  enableLogging: true
});

const response = await connector.executePrompt(
  assembledPrompt,
  "Je veux auditer la performance de mon API",
  context,
  {
    includeContext: true,
    validateResponse: true,
    cacheResponse: true
  }
);

console.log('Réponse IA:', response.content);
console.log('Tokens utilisés:', response.usage.total_tokens);
*/