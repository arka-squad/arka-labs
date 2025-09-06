export interface IAClient {
  stream?:(options:any)=>AsyncIterable<string>;
  complete?: (options:any)=>Promise<string>;
}

import OpenAI from 'openai';
import { Configuration } from 'openai';

export function resolveClient(provider: string, sessionToken: string| null): IAClient {
  switch(provider) {
    case 'openai':
      const openai = new OpenAI({
        apiKey: sessionToken || process.env.OPENAI_API_KEY,
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