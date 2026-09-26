import { defineStore } from "pinia";
import { listGateDecision, appendGateDecision } from "../api/GateDecision";
import { listReleaseSnapshot, appendReleaseSnapshot } from "../api/ReleaseSnapshot";
import { createDefaultGateDecision } from "../constructors/GateDecisionConstructor";
import { createDefaultReleaseSnapshot, createDefaultSnapshotItem } from "../constructors/ReleaseSnapshotConstructor";
import { GateDecisionType } from "../constants/GateDecisionType";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { diffSections } from "../utils/policyDiff";
import { formatDateShort } from "../utils/formatters";
import type { GateDecision } from "../types/GateDecision";
import type { ReleaseSnapshot } from "../types/ReleaseSnapshot";
import type { PolicyDocument } from "../types/PolicyDocument";
import type { PolicySection } from "../types/PolicySection";
import type { SectionDiff } from "../types/SectionDiff";

export interface GateItem extends SectionDiff {
  decision: string;
  reviewer: string;
  exception_reason: string;
  exception_expires_at: string;
  decided_at: string;
  carried_over: boolean;
  exception_expired: boolean;
}

export interface GateBlocker {
  code: string;
  message: string;
}

export interface GateDecisionInput {
  target_document_id: number;
  item: GateItem;
  decision: string;
  reviewer: string;
  exception_reason?: string;
  exception_expires_at?: string;
}

const HIGH_LEVELS = new Set(["HIGH", "CRITICAL"]);

function toParsed(sections: PolicySection[]) {
  return sections.map((s) => ({ section_no: s.section_no, heading: s.heading, content: s.content }));
}

export const useReleaseGateStore = defineStore("releaseGate", {
  state: () => ({
    decisions: [] as GateDecision[],
    snapshots: [] as ReleaseSnapshot[],
    loading: false,
    lastError: ""
  }),
  getters: {
    decisionHistory(state) {
      return [...state.decisions].sort((a, b) => b.id - a.id);
    }
  },
  actions: {
    async load() {
      this.loading = true;
      this.decisions = await listGateDecision();
      this.snapshots = await listReleaseSnapshot();
      this.loading = false;
    },
    effectiveDecision(sectionNo: string, hash: string, targetDocumentId: number): GateDecision | undefined {
      const matches = this.decisions
        .filter((d) => d.section_no === sectionNo && d.content_hash === hash)
        .sort((a, b) => b.id - a.id);
      const latest = matches[0];
      if (latest && latest.target_document_id !== targetDocumentId) {
        console.info(LOG_TEMPLATES.GateDecision[1], sectionNo, formatDateShort(latest.decided_at));
      }
      return latest;
    },
    buildGateItems(oldDoc: PolicyDocument, newDoc: PolicyDocument, sections: PolicySection[]): GateItem[] {
      const oldRows = toParsed(sections.filter((s) => s.document_id === oldDoc.id));
      const newRows = toParsed(sections.filter((s) => s.document_id === newDoc.id));
      const now = Date.now();
      const isExpired = (record?: GateDecision) => Boolean(
        record &&
        record.decision === "EXCEPTION" &&
        record.exception_expires_at &&
        new Date(record.exception_expires_at).getTime() < now
      );
      return diffSections(oldRows, newRows).map((diff) => {
        const record = this.effectiveDecision(diff.section_no, diff.content_hash, newDoc.id);
        const expired = isExpired(record);
        return {
          ...diff,
          decision: record?.decision ?? GateDecisionType[0],
          reviewer: record?.reviewer ?? "",
          exception_reason: record?.exception_reason ?? "",
          exception_expires_at: record?.exception_expires_at ?? "",
          decided_at: record?.decided_at ?? "",
          carried_over: Boolean(record && record.target_document_id !== newDoc.id),
          exception_expired: Boolean(expired)
        };
      });
    },
    async decide(input: GateDecisionInput) {
      if (input.decision === "EXCEPTION" && !(input.exception_reason ?? "").trim()) {
        this.lastError = ERROR_MESSAGES[ERROR_CODES.EXCEPTION_REASON_REQUIRED];
        throw new Error(this.lastError);
      }
      if (input.decision === "EXCEPTION" && !input.exception_expires_at) {
        this.lastError = ERROR_MESSAGES[ERROR_CODES.EXCEPTION_EXPIRES_REQUIRED];
        throw new Error(this.lastError);
      }
      const record = await appendGateDecision(createDefaultGateDecision({
        id: this.decisions.reduce((max, row) => Math.max(max, row.id), 0) + 1,
        target_document_id: input.target_document_id,
        section_no: input.item.section_no,
        heading: input.item.heading,
        content_hash: input.item.content_hash,
        diff_type: input.item.diff_type,
        risk_level: input.item.risk_level,
        decision: input.decision,
        reviewer: input.reviewer.trim() || "匿名审阅人",
        exception_reason: input.decision === "EXCEPTION" ? (input.exception_reason ?? "").trim() : "",
        exception_expires_at: input.decision === "EXCEPTION" ? (input.exception_expires_at ?? "") : "",
        decided_at: new Date().toISOString()
      }));
      console.info(LOG_TEMPLATES.GateDecision[0], record.section_no, record.decision, record.reviewer);
      if (record.decision === "EXCEPTION") console.info(LOG_TEMPLATES.GateDecision[2], record.section_no, record.exception_expires_at);
      this.decisions.push(record);
      return record;
    },
    evaluate(items: GateItem[]): GateBlocker[] {
      const blockers: GateBlocker[] = [];
      const unresolvedHighRisk = items.filter((item) => HIGH_LEVELS.has(item.risk_level) && (item.decision === "PENDING" || item.exception_expired));
      if (unresolvedHighRisk.length > 0) {
        blockers.push({
          code: ERROR_CODES.GATE_BLOCKED,
          message: `仍有 ${unresolvedHighRisk.length} 个高风险/严重条款没有有效结论：${unresolvedHighRisk.map((i) => `第${i.section_no}条`).join("、")}`
        });
      }
      const needsChanges = items.filter((item) => item.decision === "NEEDS_CHANGES");
      if (needsChanges.length > 0) {
        blockers.push({
          code: ERROR_CODES.GATE_BLOCKED,
          message: `仍有 ${needsChanges.length} 个条款处于“需修改”：${needsChanges.map((i) => `第${i.section_no}条`).join("、")}`
        });
      }
      return blockers;
    },
    async release(oldDoc: PolicyDocument, newDoc: PolicyDocument, items: GateItem[], releasedBy: string): Promise<ReleaseSnapshot> {
      const blockers = this.evaluate(items);
      if (blockers.length > 0) {
        console.info(LOG_TEMPLATES.ReleaseSnapshot[3], newDoc.version_label, blockers.length);
        this.lastError = blockers.map((b) => b.message).join("；");
        throw new Error(ERROR_MESSAGES[ERROR_CODES.GATE_BLOCKED]);
      }
      const exceptions = items.filter((i) => i.decision === "EXCEPTION");
      const snapshot = await appendReleaseSnapshot(createDefaultReleaseSnapshot({
        id: this.snapshots.reduce((max, row) => Math.max(max, row.id), 0) + 1,
        old_document_id: oldDoc.id,
        new_document_id: newDoc.id,
        version_label: newDoc.version_label,
        released_by: releasedBy.trim() || "匿名审阅人",
        released_at: new Date().toISOString(),
        total: items.length,
        added: items.filter((i) => i.diff_type === "ADDED").length,
        removed: items.filter((i) => i.diff_type === "REMOVED").length,
        modified: items.filter((i) => i.diff_type === "MODIFIED" || i.diff_type === "MOVED").length,
        unchanged: items.filter((i) => i.diff_type === "UNCHANGED").length,
        high_risk: items.filter((i) => HIGH_LEVELS.has(i.risk_level)).length,
        exception_count: exceptions.length,
        exception_notes: exceptions
          .map((i) => `第${i.section_no}条《${i.heading}》例外理由：${i.exception_reason}；到期时间：${formatDateShort(i.exception_expires_at)}`)
          .join("\n"),
        items: items.map((i) => createDefaultSnapshotItem({
          section_no: i.section_no,
          heading: i.heading,
          diff_type: i.diff_type,
          risk_level: i.risk_level,
          decision: i.decision,
          reviewer: i.reviewer,
          carried_over: i.carried_over,
          exception_reason: i.exception_reason,
          exception_expires_at: i.exception_expires_at
        })),
        readonly: true
      }));
      console.info(LOG_TEMPLATES.ReleaseSnapshot[0], snapshot.version_label, snapshot.id);
      console.info(LOG_TEMPLATES.ReleaseSnapshot[2], snapshot.version_label);
      this.snapshots.unshift(snapshot);
      return snapshot;
    }
  }
});
