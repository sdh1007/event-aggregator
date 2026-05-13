import { kv as vercelKv } from '@vercel/kv';
import fs from 'fs';
import path from 'path';

// Local file-based KV for development
const LOCAL_KV_FILE = path.join(process.cwd(), '.local-kv.json');

interface LocalKVStore {
  [key: string]: { value: any; expires?: number };
}

function loadLocalKV(): LocalKVStore {
  try {
    if (fs.existsSync(LOCAL_KV_FILE)) {
      return JSON.parse(fs.readFileSync(LOCAL_KV_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Error loading local KV:', e);
  }
  return {};
}

function saveLocalKV(store: LocalKVStore) {
  try {
    fs.writeFileSync(LOCAL_KV_FILE, JSON.stringify(store, null, 2));
  } catch (e) {
    console.error('Error saving local KV:', e);
  }
}

// Local KV implementation for development
const localKv = {
  async get<T>(key: string): Promise<T | null> {
    const store = loadLocalKV();
    const entry = store[key];

    if (!entry) return null;

    // Check expiration
    if (entry.expires && Date.now() > entry.expires) {
      delete store[key];
      saveLocalKV(store);
      return null;
    }

    return entry.value as T;
  },

  async set(key: string, value: any, options?: { ex?: number }): Promise<void> {
    const store = loadLocalKV();
    const expires = options?.ex ? Date.now() + (options.ex * 1000) : undefined;

    store[key] = { value, expires };
    saveLocalKV(store);
  },
};

// Use Vercel KV in production, local KV in development
export const kv = process.env.KV_REST_API_URL ? vercelKv : localKv;
