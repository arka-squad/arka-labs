export interface KeyValueStore {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  del(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
}

class InMemoryKV implements KeyValueStore {
  private store = new Map<string, { v: unknown; exp?: number }>();

  async get<T = unknown>(key: string): Promise<T | null> {
    const rec = this.store.get(key);
    if (!rec) return null;
    if (rec.exp && rec.exp < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return rec.v as T;
  }

  async set<T = unknown>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const exp = ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined;
    this.store.set(key, { v: value, exp });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async has(key: string): Promise<boolean> {
    const v = await this.get(key);
    return v !== null;
  }
}

export const kv: KeyValueStore = new InMemoryKV();

