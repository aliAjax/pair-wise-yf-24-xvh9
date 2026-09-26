import { defineStore } from "pinia";
import { listPolicyDocument, savePolicyDocument } from "../api/PolicyDocument";
import { createDefaultPolicyDocument } from "../constructors/PolicyDocumentConstructor";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { usePolicySectionStore } from "./PolicySectionStore";
import { useGateReviewStore, type RoundSummary } from "./GateReviewStore";
import type { PolicyDocument } from "../types/PolicyDocument";

export interface ImportPayload {
  title: string;
  version_label: string;
  raw_text: string;
}

export interface ImportResult {
  document: PolicyDocument;
  sections: number;
  round: RoundSummary | null;
}

export const usePolicyDocumentStore = defineStore("policyDocument", {
  state: () => ({ rows: [] as PolicyDocument[], loading: false }),
  getters: {
    sorted(state): PolicyDocument[] {
      return [...state.rows].sort((a, b) => a.imported_at.localeCompare(b.imported_at));
    },
    // 最新导入的版本即当前发布候选版本。
    candidate(): PolicyDocument | undefined {
      return this.sorted[this.sorted.length - 1];
    }
  },
  actions: {
    async load() {
      this.loading = true;
      this.rows = await listPolicyDocument();
      this.loading = false;
    },
    // 首次启动时把种子文档解析成条款，并为最新两个版本生成第一轮门禁清单。
    async ensureDerived() {
      const sectionStore = usePolicySectionStore();
      const gateStore = useGateReviewStore();
      for (const document of this.sorted) {
        if (sectionStore.byDocument(document.id).length === 0) {
          await sectionStore.rebuildForDocument(document.id, document.raw_text);
        }
      }
      if (this.sorted.length >= 2 && gateStore.rows.length === 0) {
        const documents = this.sorted;
        await gateStore.startRound(documents[documents.length - 1], documents[documents.length - 2]);
      }
    },
    // 导入新版本：创建文档、自动分段、与上一版本对比并生成新一轮门禁清单。
    async importDocument(payload: ImportPayload): Promise<ImportResult> {
      if (!payload.title.trim() || !payload.version_label.trim() || !payload.raw_text.trim()) {
        throw new Error(ERROR_MESSAGES.VALIDATION_FAILED);
      }
      const sectionStore = usePolicySectionStore();
      const gateStore = useGateReviewStore();
      const previous = this.candidate;
      const id = this.rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      const document = createDefaultPolicyDocument({
        id,
        title: payload.title.trim(),
        version_label: payload.version_label.trim(),
        raw_text: payload.raw_text,
        normalized_sections: "",
        imported_at: new Date().toISOString()
      });
      this.rows = await savePolicyDocument(document);
      const sections = await sectionStore.rebuildForDocument(document.id, document.raw_text);
      const round = previous ? await gateStore.startRound(document, previous) : null;
      return { document, sections: sections.length, round };
    }
  }
});
