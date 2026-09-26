import type { GateReview } from "../types/GateReview";

export const createDefaultGateReview = (overrides: Partial<GateReview> = {}): GateReview => ({
  id: 0,
  round: 1,
  old_document_id: 0,
  new_document_id: 0,
  section_no: "1",
  heading: "",
  diff_type: "ADDED",
  risk_level: "LOW",
  old_content: "",
  new_content: "",
  content_hash: "",
  decision: "PENDING",
  exception_reason: "",
  exception_expires_at: "",
  reviewer: "",
  decided_at: "",
  inherited: false,
  superseded: false,
  created_at: new Date().toISOString(),
  ...overrides
});

export const createGateReviewForm = createDefaultGateReview;
export const createGateReviewResponse = createDefaultGateReview;
