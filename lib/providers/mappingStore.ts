type AgentKey = 'agp'|'pmo'|'qa'|'arke'|string;
export type ProviderMapping = Record<AgentKey, { providerId: string|null; modelId: string|null }>;

const store = new Map<string, ProviderMapping>(); // key = user.sub

export function getMapping(sub: string): ProviderMapping {
  if (!store.has(sub)) {
    store.set(sub, { agp: { providerId: null, modelId: null }, pmo:{providerId:null,modelId:null}, qa:{providerId:null,modelId:null}, arke:{providerId:null,modelId:null} });
  }
  return store.get(sub)!;
}

export function setMapping(sub: string, mapping: ProviderMapping) {
  store.set(sub, mapping);
}

