export interface ReleaseSnapshot {
  id: number;
  document_id: number;
  version_label: string;
  title: string;
  released_at: string;
  released_by: string;
  round: number;
  total_clauses: number;
  high_risk_total: number;
  exception_total: number;
  payload: string;
  created_at: string;
}
