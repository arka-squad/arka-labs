import { kv } from './kv';
import { db } from './db';
import { blob } from './blob';

export const MEM_WRITE_ENABLED = process.env.MEM_WRITE_ENABLED === 'true' && process.env.NODE_ENV !== 'production';

export const MemoryRepo = {
  kv,
  db,
  blob,
  async save(collection: string, id: string, value: unknown) {
    // No write in production or if flag disabled
    if (!MEM_WRITE_ENABLED) {
      console.log(
        JSON.stringify({ ts: new Date().toISOString(), event: 'memory.save.skipped', collection, id, reason: 'no_write_guard' })
      );
      return;
    }
    await kv.set(`${collection}:${id}`, value);
  },
  async get<T = unknown>(collection: string, id: string): Promise<T | null> {
    const fromKv = await kv.get<T>(`${collection}:${id}`);
    if (fromKv !== null) return fromKv;
    const fromDb = await db.get(collection, id);
    return (fromDb as T) ?? null;
  },
};

