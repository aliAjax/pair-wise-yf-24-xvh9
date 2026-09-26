import type { GateDecision } from "../types/GateDecision";

export const createDefaultGateDecision = (overrides: Partial<GateDecision> = {}): GateDecision => ({
  id: 0,
  target_document_id: 0,
  section_no: "",
  heading: "",
  content_hash: "",
  diff_type: "MODIFIED",
  risk_level: "LOW",
  decision: "PENDING",
  reviewer: "",
  exception_reason: "",
  exception_expires_at: "",
  decided_at: "",
  ...overrides
});

export const createGateDecisionForm = createDefaultGateDecision;
export const createGateDecisionResponse = createDefaultGateDecision;
