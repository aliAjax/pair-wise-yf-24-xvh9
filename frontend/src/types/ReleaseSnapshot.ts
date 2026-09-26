export interface ReleaseSnapshotItem {
  section_no: string;
  heading: string;
  diff_type: string;
  risk_level: string;
  decision: string;
  reviewer: string;
  carried_over: boolean;
  exception_reason: string;
  exception_expires_at: string;
}

export interface ReleaseSnapshot {
  id: number;
  old_document_id: number;
  new_document_id: number;
  version_label: string;
  released_by: string;
  released_at: string;
  total: number;
  added: number;
  removed: number;
  modified: number;
  unchanged: number;
  high_risk: number;
  exception_count: number;
  exception_notes: string;
  items: ReleaseSnapshotItem[];
  readonly: true;
}
