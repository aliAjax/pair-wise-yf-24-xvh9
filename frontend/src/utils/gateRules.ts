import type { GateReview } from "../types/GateReview";
import type { GateDecision } from "../types/GateDecision";
import type { PrivacyRiskLevel } from "../types/PrivacyRiskLevel";

export const HIGH_RISK_LEVELS: PrivacyRiskLevel[] = ["HIGH", "CRITICAL"];

export function isHighRisk(riskLevel: string): boolean {
  return (HIGH_RISK_LEVELS as string[]).includes(riskLevel);
}

export function isExceptionValid(review: GateReview, now: Date = new Date()): boolean {
  if (!review.exception_reason.trim()) return false;
  if (!review.exception_expires_at) return false;
  const expires = new Date(review.exception_expires_at);
  return !Number.isNaN(expires.getTime()) && expires.getTime() > now.getTime();
}

// 例外缺少理由、缺少到期时间或已过期时，一律视为待办，必须重新结论。
export function effectiveDecision(review: GateReview, now: Date = new Date()): GateDecision {
  if (review.decision === "EXCEPTION" && !isExceptionValid(review, now)) return "PENDING";
  return review.decision as GateDecision;
}

export interface GateStatus {
  total: number;
  pending: number;
  approved: number;
  needsChanges: number;
  exception: number;
  inherited: number;
  highRiskPending: GateReview[];
  needsChangesRows: GateReview[];
  blockers: string[];
  canRelease: boolean;
}

export function evaluateGate(reviews: GateReview[], now: Date = new Date()): GateStatus {
  const current = reviews.filter((row) => !row.superseded);
  const decisions = current.map((row) => effectiveDecision(row, now));
  const count = (decision: GateDecision) => decisions.filter((item) => item === decision).length;
  const highRiskPending = current.filter(
    (row) => isHighRisk(row.risk_level) && effectiveDecision(row, now) === "PENDING"
  );
  const needsChangesRows = current.filter((row) => effectiveDecision(row, now) === "NEEDS_CHANGES");
  const blockers: string[] = [];
  if (highRiskPending.length > 0) {
    blockers.push(`${highRiskPending.length} 个高风险条款还没有审阅结论`);
  }
  if (needsChangesRows.length > 0) {
    blockers.push(`${needsChangesRows.length} 个条款被标记为需修改，必须先处理`);
  }
  return {
    total: current.length,
    pending: count("PENDING"),
    approved: count("APPROVED"),
    needsChanges: count("NEEDS_CHANGES"),
    exception: count("EXCEPTION"),
    inherited: current.filter((row) => row.inherited).length,
    highRiskPending,
    needsChangesRows,
    blockers,
    canRelease: current.length > 0 && blockers.length === 0
  };
}
