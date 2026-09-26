import { defineStore } from "pinia";
import { listPolicySection, replacePolicySection } from "../api/PolicySection";
import { parsePolicyText, assessRisk, categorize } from "../hooks/usePolicyParser";
import { createDefaultPolicySection } from "../constructors/PolicySectionConstructor";
import type { PolicySection } from "../types/PolicySection";

export const usePolicySectionStore = defineStore("policySection", {
  state: () => ({ rows: [] as PolicySection[], loading: false }),
  getters: {
    byDocument: (state) => (documentId: number) =>
      state.rows
        .filter((row) => row.document_id === documentId)
        .sort((a, b) => a.section_no.localeCompare(b.section_no, "zh-CN", { numeric: true }))
  },
  actions: {
    async load() {
      this.loading = true;
      this.rows = await listPolicySection();
      this.loading = false;
    },
    // 解析文档正文并批量重建该文档的条款段落。
    async rebuildForDocument(documentId: number, rawText: string) {
      const parsed = parsePolicyText(rawText);
      const kept = this.rows.filter((row) => row.document_id !== documentId);
      let id = [...kept, ...this.rows].reduce((max, row) => Math.max(max, row.id), 0) + 1;
      const created = parsed.map((section) =>
        createDefaultPolicySection({
          id: id++,
          document_id: documentId,
          section_no: section.section_no,
          heading: section.heading,
          content: section.content,
          category: categorize(section.content),
          risk_level: assessRisk(section.content)
        })
      );
      this.rows = [...kept, ...created];
      await replacePolicySection(this.rows);
      return created;
    },
    async updateRiskLevel(id: number, riskLevel: string) {
      const row = this.rows.find((item) => item.id === id);
      if (!row) return;
      row.risk_level = riskLevel;
      await replacePolicySection(this.rows);
    }
  }
});
