export const GateDecision = ["PENDING","APPROVED","NEEDS_CHANGES","EXCEPTION"] as const;
export type GateDecision = (typeof GateDecision)[number];
export const GateDecisionText: Record<GateDecision, string> = Object.fromEntries(GateDecision.map((value) => [value, value.replace(/_/g, " ")])) as Record<GateDecision, string>;
