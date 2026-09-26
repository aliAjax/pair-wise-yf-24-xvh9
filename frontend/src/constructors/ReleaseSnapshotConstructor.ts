import type { ReleaseSnapshot } from "../types/ReleaseSnapshot";

export const createDefaultReleaseSnapshot = (overrides: Partial<ReleaseSnapshot> = {}): ReleaseSnapshot => ({
  id: 0,
  document_id: 0,
  version_label: "",
  title: "",
  released_at: new Date().toISOString(),
  released_by: "",
  round: 1,
  total_clauses: 0,
  high_risk_total: 0,
  exception_total: 0,
  payload: "{}",
  created_at: new Date().toISOString(),
  ...overrides
});

export const createReleaseSnapshotForm = createDefaultReleaseSnapshot;
export const createReleaseSnapshotResponse = createDefaultReleaseSnapshot;
