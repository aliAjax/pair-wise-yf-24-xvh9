import { mockData } from "../mocks/seedData";
import { loadRows, saveRows, upsertRow } from "../utils/storage";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { GateReview } from "../types/GateReview";

const STORAGE_KEY = "gate-reviews";

export async function listGateReview(): Promise<GateReview[]> {
  return loadRows<GateReview>(STORAGE_KEY, mockData.gateReview as unknown as GateReview[]);
}

export async function saveGateReview(payload: GateReview): Promise<GateReview[]> {
  console.info(LOG_TEMPLATES.GateReview[1], payload.section_no, payload.decision);
  return upsertRow<GateReview>(STORAGE_KEY, mockData.gateReview as unknown as GateReview[], payload);
}

export async function replaceGateReview(rows: GateReview[]): Promise<void> {
  console.info(LOG_TEMPLATES.GateReview[0], rows.length);
  saveRows<GateReview>(STORAGE_KEY, rows);
}
