import type { ReleaseSnapshot, ReleaseSnapshotItem } from "../types/ReleaseSnapshot";

export const createDefaultSnapshotItem = (overrides: Partial<ReleaseSnapshotItem> = {}): ReleaseSnapshotItem => ({
  section_no: "",
  heading: "",
  diff_type: "MODIFIED",
  risk_level: "LOW",
  decision: "PENDING",
  reviewer: "",
  carried_over: false,
  exception_reason: "",
  exception_expires_at: "",
  ...overrides
});

export const createDefaultReleaseSnapshot = (overrides: Partial<ReleaseSnapshot> = {}): ReleaseSnapshot => ({
  id: 0,
  old_document_id: 0,
  new_document_id: 0,
  version_label: "",
  released_by: "",
  released_at: "",
  total: 0,
  added: 0,
  removed: 0,
  modified: 0,
  unchanged: 0,
  high_risk: 0,
  exception_count: 0,
  exception_notes: "",
  items: [],
  readonly: true,
  ...overrides
});

export const createReleaseSnapshotForm = createDefaultReleaseSnapshot;
export const createReleaseSnapshotResponse = createDefaultReleaseSnapshot;
