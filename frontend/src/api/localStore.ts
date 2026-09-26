import { STORAGE_KEYS } from "../constants/storageKeys";
import { mockData } from "../mocks/seedData";

export function readStore<T>(key: keyof typeof STORAGE_KEYS, seedKey: keyof typeof mockData): T[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[key]);
    if (raw) return JSON.parse(raw) as T[];
  } catch {
    // Corrupt local cache falls back to the bundled seed data.
  }
  const seed = [...(mockData[seedKey] as unknown as T[])];
  writeStore(key, seed);
  return seed;
}

export function writeStore<T>(key: keyof typeof STORAGE_KEYS, rows: T[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(rows));
  } catch {
    // Storage may be full or blocked; write failures stay non-fatal in the mock layer.
  }
}
