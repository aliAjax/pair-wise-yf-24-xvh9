import { defineStore } from "pinia";
import { listReleaseSnapshot, saveReleaseSnapshot } from "../api/ReleaseSnapshot";
import { createDefaultReleaseSnapshot } from "../constructors/ReleaseSnapshotConstructor";
import { evaluateGate, effectiveDecision, isHighRisk } from "../utils/gateRules";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { useGateReviewStore } from "./GateReviewStore";
import type { ReleaseSnapshot } from "../types/ReleaseSnapshot";
import type { PolicyDocument } from "../types/PolicyDocument";

export const useReleaseSnapshotStore = defineStore("releaseSnapshot", {
  state: () => ({ rows: [] as ReleaseSnapshot[], loading: false }),
  getters: {
    isReleased: (state) => (documentId: number) =>
      state.rows.some((row) => row.document_id === documentId),
    byDocument: (state) => (documentId: number) =>
      state.rows.find((row) => row.document_id === documentId)
  },
  actions: {
    async load() {
      this.loading = true;
      this.rows = await listReleaseSnapshot();
      this.loading = false;
    },
    // 发布门禁：高风险项都有结论且没有需修改项时才允许执行，成功后生成只读快照。
    async release(document: PolicyDocument, releasedBy: string): Promise<ReleaseSnapshot> {
      if (this.isReleased(document.id)) {
        throw new Error(ERROR_MESSAGES.ALREADY_RELEASED);
      }
      const gateStore = useGateReviewStore();
      const current = gateStore.activeRows.filter((row) => row.new_document_id === document.id);
      if (current.length === 0) {
        throw new Error(ERROR_MESSAGES.NO_CANDIDATE_VERSION);
      }
      const status = evaluateGate(current);
      if (!status.canRelease) {
        throw new Error(`${ERROR_MESSAGES.GATE_BLOCKED}：${status.blockers.join("；")}`);
      }
      const now = new Date().toISOString();
      const exceptions = current
        .filter((row) => effectiveDecision(row) === "EXCEPTION")
        .map((row) => ({
          section_no: row.section_no,
          heading: row.heading,
          risk_level: row.risk_level,
          reason: row.exception_reason,
          expires_at: row.exception_expires_at,
          reviewer: row.reviewer
        }));
      const payload = {
        version_label: document.version_label,
        title: document.title,
        released_at: now,
        released_by: releasedBy,
        round: gateStore.currentRound,
        stats: {
          total: status.total,
          approved: status.approved,
          exception: status.exception,
          inherited: status.inherited,
          high_risk: current.filter((row) => isHighRisk(row.risk_level)).length
        },
        exceptions,
        clauses: current.map((row) => ({
          section_no: row.section_no,
          heading: row.heading,
          diff_type: row.diff_type,
          risk_level: row.risk_level,
          decision: effectiveDecision(row),
          reviewer: row.reviewer,
          decided_at: row.decided_at,
          exception_reason: row.exception_reason,
          exception_expires_at: row.exception_expires_at
        }))
      };
      const id = this.rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      const snapshot = createDefaultReleaseSnapshot({
        id,
        document_id: document.id,
        version_label: document.version_label,
        title: document.title,
        released_at: now,
        released_by: releasedBy,
        round: gateStore.currentRound,
        total_clauses: status.total,
        high_risk_total: payload.stats.high_risk,
        exception_total: exceptions.length,
        payload: JSON.stringify(payload, null, 2),
        created_at: now
      });
      this.rows = await saveReleaseSnapshot(snapshot);
      return snapshot;
    }
  }
});
