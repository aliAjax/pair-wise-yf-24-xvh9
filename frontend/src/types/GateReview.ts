export interface GateReview {
  id: number;
  round: number;
  old_document_id: number;
  new_document_id: number;
  section_no: string;
  heading: string;
  diff_type: string;
  risk_level: string;
  old_content: string;
  new_content: string;
  content_hash: string;
  decision: string;
  exception_reason: string;
  exception_expires_at: string;
  reviewer: string;
  decided_at: string;
  inherited: boolean;
  superseded: boolean;
  created_at: string;
}
