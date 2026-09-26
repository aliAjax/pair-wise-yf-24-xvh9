import { mockData } from "../mocks/seedData";
import { loadRows, saveRows, upsertRow } from "../utils/storage";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { ReleaseSnapshot } from "../types/ReleaseSnapshot";

const STORAGE_KEY = "release-snapshots";

export async function listReleaseSnapshot(): Promise<ReleaseSnapshot[]> {
  return loadRows<ReleaseSnapshot>(STORAGE_KEY, mockData.releaseSnapshot as unknown as ReleaseSnapshot[]);
}

export async function saveReleaseSnapshot(payload: ReleaseSnapshot): Promise<ReleaseSnapshot[]> {
  console.info(LOG_TEMPLATES.ReleaseSnapshot[0], payload.version_label);
  return upsertRow<ReleaseSnapshot>(STORAGE_KEY, mockData.releaseSnapshot as unknown as ReleaseSnapshot[], payload);
}
