const PREFIX = "policy-diff:";

export function loadRows<T extends { id: number }>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as T[];
    }
  } catch {
    // 本地数据损坏时回退种子数据，保证页面可用。
  }
  const cloned = seed.map((row) => ({ ...row }));
  saveRows(key, cloned);
  return cloned;
}

export function saveRows<T extends { id: number }>(key: string, rows: T[]): void {
  localStorage.setItem(PREFIX + key, JSON.stringify(rows));
}

export function nextId(rows: { id: number }[]): number {
  return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

export function upsertRow<T extends { id: number }>(key: string, seed: T[], payload: T): T[] {
  const rows = loadRows(key, seed);
  const index = rows.findIndex((row) => row.id === payload.id);
  if (index >= 0) {
    rows[index] = payload;
  } else {
    rows.push({ ...payload, id: nextId(rows) });
  }
  saveRows(key, rows);
  return rows;
}
