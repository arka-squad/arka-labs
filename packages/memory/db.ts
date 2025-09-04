export type Doc = Record<string, unknown> & { id: string };

export interface DocumentDB {
  get(collection: string, id: string): Promise<Doc | null>;
  list(collection: string, opts?: { limit?: number; offset?: number }): Promise<{ items: Doc[]; count: number }>;
}

const SEED: Record<string, Doc[]> = Object.freeze({
  runs: [],
  kpis: [],
});

class MockDocumentDB implements DocumentDB {
  private data: Record<string, Doc[]>;
  constructor(seed: Record<string, Doc[]> = SEED) {
    this.data = Object.fromEntries(Object.entries(seed).map(([k, v]) => [k, [...v]]));
  }
  async get(collection: string, id: string): Promise<Doc | null> {
    const arr = this.data[collection] || [];
    return arr.find((d) => d.id === id) ?? null;
  }
  async list(collection: string, opts?: { limit?: number; offset?: number }) {
    const arr = this.data[collection] || [];
    const offset = opts?.offset ?? 0;
    const limit = opts?.limit ?? 20;
    const items = arr.slice(offset, offset + limit);
    return { items, count: arr.length };
  }
}

export const db: DocumentDB = new MockDocumentDB();

