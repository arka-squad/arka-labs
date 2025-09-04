export interface BlobRef {
  key: string;
  size: number;
  contentType?: string;
}

export interface BlobStore {
  get(key: string): Promise<Uint8Array | null>;
  put(key: string, data: Uint8Array, contentType?: string): Promise<BlobRef>;
}

class InMemoryBlob implements BlobStore {
  private store = new Map<string, { b: Uint8Array; ct?: string }>();

  async get(key: string): Promise<Uint8Array | null> {
    const rec = this.store.get(key);
    return rec ? rec.b : null;
  }

  async put(key: string, data: Uint8Array, contentType?: string): Promise<BlobRef> {
    // Guard no-write in prod
    if (process.env.NODE_ENV === 'production' || process.env.MEM_WRITE_ENABLED !== 'true') {
      // No-op write; return pseudo-ref
      return { key, size: data.byteLength, contentType };
    }
    this.store.set(key, { b: data, ct: contentType });
    return { key, size: data.byteLength, contentType };
  }
}

export const blob: BlobStore = new InMemoryBlob();

