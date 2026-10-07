// Acesso seguro ao localStorage (pode falhar em aba anônima/bloqueada). Injetável nos testes.
export interface KV {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

const memory = new Map<string, string>();
const memoryKV: KV = {
  getItem: (k) => memory.get(k) ?? null,
  setItem: (k, v) => void memory.set(k, v),
  removeItem: (k) => void memory.delete(k),
};

let kv: KV = memoryKV;
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const probe = '__sp_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    kv = window.localStorage;
  }
} catch {
  kv = memoryKV;
}

export function setStorage(custom: KV) {
  kv = custom;
}

export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = kv.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  try {
    kv.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string) {
  try {
    kv.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const KEYS = {
  activeExam: 'sp.p1.activeExam',
  history: 'sp.p1.history',
  attempts: 'sp.p1.attempts',
  seen: 'sp.p1.seen',
  prefs: 'sp.p1.prefs',
  study: 'sp.p1.studySession',
} as const;
