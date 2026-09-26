import { mockData } from "../mocks/seedData";
import { loadRows, saveRows, upsertRow } from "../utils/storage";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { DiffResult } from "../types/DiffResult";

const STORAGE_KEY = "diff-results";

export async function listDiffResult(): Promise<DiffResult[]> {
  return loadRows<DiffResult>(STORAGE_KEY, mockData.diffResult as unknown as DiffResult[]);
}

export async function saveDiffResult(payload: DiffResult): Promise<DiffResult[]> {
  console.info(LOG_TEMPLATES.DiffResult[0], payload.section_id);
  return upsertRow<DiffResult>(STORAGE_KEY, mockData.diffResult as unknown as DiffResult[], payload);
}

export async function replaceDiffResult(rows: DiffResult[]): Promise<void> {
  console.info(LOG_TEMPLATES.DiffResult[1], rows.length);
  saveRows<DiffResult>(STORAGE_KEY, rows);
}
