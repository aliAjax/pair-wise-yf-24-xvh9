export interface GateDecision {
  id: number;
  target_document_id: number;
  section_no: string;
  heading: string;
  content_hash: string;
  diff_type: string;
  risk_level: string;
  decision: string;
  reviewer: string;
  exception_reason: string;
  exception_expires_at: string;
  decided_at: string;
}
