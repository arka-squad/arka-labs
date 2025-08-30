import { put, del, head } from '@vercel/blob';
import { env } from './env';

export interface Storage {
  putObject: (key: string, data: Buffer, contentType: string) => Promise<void>;
  getObjectURL: (key: string) => Promise<string>;
  deleteObject: (key: string) => Promise<void>;
}

async function ensureToken(): Promise<string> {
  if (!env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN not set');
  }
  return env.BLOB_READ_WRITE_TOKEN;
}

export const storage: Storage = {
  async putObject(key: string, data: Buffer, contentType: string) {
    const token = await ensureToken();
    await put(key, data as any, { access: 'private' as any, token, contentType });
  },
  async getObjectURL(key: string) {
    const token = await ensureToken();
    const res: any = await head(key, { token });
    return res?.url || res?.downloadUrl || '';
  },
  async deleteObject(key: string) {
    const token = await ensureToken();
    await del(key, { token });
  },
};
