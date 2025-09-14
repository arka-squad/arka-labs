export interface IAClient {
  stream?:(options:any)=>AsyncIterable<string>;
  complete?: (options:any)=>Promise<string>;
}

import OpenAI from 'openai';

export function resolveClient(provider: string, apiKey: string | null): IAClient {
  switch(provider) {
    case 'openai':
      const openai = new OpenAI({
        apiKey: apiKey || process.env.OPENAI_API_KEY,
      });
      return {
        stream: async function*({ model, prompt }) {
          const res = await openai.chat.completions.create({model,stream:true,messages:prompt});
          for await (const chunk of res) {
            yield chunk.choices[0].delta.content || '';
          }
        }
      };
    // TODO: ajout des autres providers (Anthropic, OpenRouter)
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// Test provider key validity
export async function testProviderKey(provider: string, model: string, apiKey: string) {
  switch(provider) {
    case 'openai': {
      const client = new OpenAI({ apiKey });
      try {
        // Send a minimal prompt to verify key validity
        await client.chat.completions.create({ model, messages: [{ role: 'system', content: 'ping' }] });
        return { ok: true };
      } catch (e: any) {
        return { ok: false, error: e.message || 'Erreur Unknown' };
      }
    }
    // TODO: implement for other providers
    default:
      return { ok: false, error: 'Provider non supporté' };
  }
}
