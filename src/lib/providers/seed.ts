// Seed des providers et modèles pour l'API /api/providers
export const PROVIDERS_SEED = [
  {
    id: 'openai',
    display_name: 'OpenAI',
    models: [
      { id: 'gpt-4.1-mini', display: 'GPT-4.1 mini' }
    ]
  },
  {
    id: 'anthropic',
    display_name: 'Anthropic',
    models: [
      { id: 'claude-3.5-sonnet', display: 'Claude 3.5 Sonnet' }
    ]
  },
  {
    id: 'openrouter',
    display_name: 'OpenRouter',
    models: [
      { id: 'meta-llama-3.1-70b', display: 'Llama 3.1 70B' }
    ]
  }
];
