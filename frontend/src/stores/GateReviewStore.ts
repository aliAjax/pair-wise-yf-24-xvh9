import { defineStore } from "pinia";
import { listGateReview, replaceGateReview } from "../api/GateReview";
import { createDefaultGateReview } from "../constructors/GateReviewConstructor";
import { diffSections } from "../hooks/useTextDiff";
import { evaluateGate, isExceptionValid, type GateStatus } from "../utils/gateRules";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { usePolicySectionStore } from "./PolicySectionStore";
import { useDiffResultStore } from "./DiffResultStore";
import type { GateReview } from "../types/GateReview";
import type { PolicyDocument } from "../types/PolicyDocument";
import type { GateDecision } from "../types/GateDecision";

export interface DecidePatch {
  decision: GateDecision;
  exception_reason: string;
  exception_expires_at: string;
  reviewer: string;
}

export interface RoundSummary {
  round: number;
  total: number;
  inherited: number;
  pending: number;
}

export const useGateReviewStore = defineStore("gateReview", {
  state: () => ({ rows: [] as GateReview[], loading: false }),
  getters: {
    currentRound(state): number {
      return state.rows.reduce((max, row) => Math.max(max, row.round), 0);
    },
    // 当前轮（未被取代）的门禁清单。
    activeRows(state): GateReview[] {
      return state.rows.filter((row) => !row.superseded);
    },
    // 历史轮次的旧结论记录，只读保留。
    archivedRows(state): GateReview[] {
      return state.rows.filter((row) => row.superseded);
    },
    gateStatus(): GateStatus {
      return evaluateGate(this.activeRows);
    }
  },
  actions: {
    async load() {
      this.loading = true;
      this.rows = await listGateReview();
      this.loading = false;
    },
    // 再导入新版本时生成新一轮门禁清单：
    // 正文未变的条款沿用上一轮结论，正文变化或新增的条款回到待办，旧记录打标保留。
    async startRound(newDocument: PolicyDocument, oldDocument: PolicyDocument | null): Promise<RoundSummary> {
      const sectionStore = usePolicySectionStore();
      const diffStore = useDiffResultStore();
      const newSections = sectionStore.byDocument(newDocument.id);
      const oldSections = oldDocument ? sectionStore.byDocument(oldDocument.id) : [];
      const diffRows = diffSections(oldSections, newSections);
      await diffStore.recordRound(oldDocument?.id ?? 0, newDocument.id, diffRows);

      const previousActive = this.rows.filter((row) => !row.superseded);
      const previousByNo = new Map(previousActive.map((row) => [row.section_no, row]));
      const round = this.currentRound + 1;
      const now = new Date().toISOString();
      let id = this.rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;

      const created = diffRows.map((row) => {
        const previous = previousByNo.get(row.section_no);
        const canInherit =
          previous !== undefined &&
          previous.diff_type !== "REMOVED" &&
          row.diff_type !== "REMOVED" &&
          previous.content_hash === row.content_hash;
        if (canInherit) {
          console.info(LOG_TEMPLATES.GateReview[2], row.section_no);
        }
        return createDefaultGateReview({
          id: id++,
          round,
          old_document_id: oldDocument?.id ?? 0,
          new_document_id: newDocument.id,
          section_no: row.section_no,
          heading: row.heading,
          diff_type: row.diff_type,
          risk_level: row.risk_level,
          old_content: row.old_content,
          new_content: row.new_content,
          content_hash: row.content_hash,
          decision: canInherit ? previous.decision : "PENDING",
          exception_reason: canInherit ? previous.exception_reason : "",
          exception_expires_at: canInherit ? previous.exception_expires_at : "",
          reviewer: canInherit ? previous.reviewer : "",
          decided_at: canInherit ? previous.decided_at : "",
          inherited: canInherit,
          superseded: false,
          created_at: now
        });
      });

      this.rows = [...this.rows.map((row) => ({ ...row, superseded: true })), ...created];
      await replaceGateReview(this.rows);
      return {
        round,
        total: created.length,
        inherited: created.filter((row) => row.inherited).length,
        pending: created.filter((row) => !row.inherited).length
      };
    },
    async decide(id: number, patch: DecidePatch) {
      const row = this.rows.find((item) => item.id === id);
      if (!row || row.superseded) return;
      const { useReleaseSnapshotStore } = await import("./ReleaseSnapshotStore");
      const snapshotStore = useReleaseSnapshotStore();
      if (snapshotStore.isReleased(row.new_document_id)) {
        throw new Error(ERROR_MESSAGES.ALREADY_RELEASED);
      }
      if (patch.decision === "EXCEPTION") {
        const candidate = { ...row, ...patch };
        if (!isExceptionValid(candidate)) {
          throw new Error(ERROR_MESSAGES.EXCEPTION_INCOMPLETE);
        }
      }
      row.decision = patch.decision;
      row.exception_reason = patch.decision === "EXCEPTION" ? patch.exception_reason : "";
      row.exception_expires_at = patch.decision === "EXCEPTION" ? patch.exception_expires_at : "";
      row.reviewer = patch.reviewer;
      row.decided_at = new Date().toISOString();
      row.inherited = false;
      await replaceGateReview(this.rows);
    },
    async resetDecision(id: number) {
      const row = this.rows.find((item) => item.id === id);
      if (!row || row.superseded) return;
      row.decision = "PENDING";
      row.exception_reason = "";
      row.exception_expires_at = "";
      row.reviewer = "";
      row.decided_at = "";
      row.inherited = false;
      await replaceGateReview(this.rows);
    },
    async syncRiskLevel(sectionNo: string, riskLevel: string) {
      let changed = false;
      for (const row of this.rows) {
        if (!row.superseded && row.section_no === sectionNo) {
          row.risk_level = riskLevel;
          changed = true;
        }
      }
      if (changed) await replaceGateReview(this.rows);
    }
  }
});
