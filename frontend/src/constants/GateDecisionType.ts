export const GateDecisionType = ["PENDING","APPROVED","NEEDS_CHANGES","EXCEPTION"] as const;
export type GateDecisionType = (typeof GateDecisionType)[number];
export const GateDecisionTypeText: Record<GateDecisionType, string> = {
  PENDING: "待审阅",
  APPROVED: "通过",
  NEEDS_CHANGES: "需修改",
  EXCEPTION: "接受例外"
};
