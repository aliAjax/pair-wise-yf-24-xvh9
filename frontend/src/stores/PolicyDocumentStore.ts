import { defineStore } from "pinia";
import { createPolicyDocument, listPolicyDocument } from "../api/PolicyDocument";
import { bulkCreatePolicySection, listPolicySection } from "../api/PolicySection";
import { createDefaultPolicyDocument } from "../constructors/PolicyDocumentConstructor";
import { createDefaultPolicySection } from "../constructors/PolicySectionConstructor";
import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { parseSections, classifyCategory, classifyRisk } from "../utils/policyDiff";
import type { PolicyDocument } from "../types/PolicyDocument";
import type { PolicySection } from "../types/PolicySection";

export const usePolicyDocumentStore = defineStore("policyDocument", {
  state: () => ({
    rows: [] as PolicyDocument[],
    sections: [] as PolicySection[],
    loading: false,
    lastError: ""
  }),
  actions: {
    async load() {
      this.loading = true;
      this.rows = await listPolicyDocument();
      this.sections = await listPolicySection();
      this.loading = false;
    },
    async importDocument(input: { title: string; version_label: string; raw_text: string }) {
      const parsed = parseSections(input.raw_text);
      if (parsed.length === 0) {
        this.lastError = ERROR_MESSAGES[ERROR_CODES.DOCUMENT_PARSE_EMPTY];
        throw new Error(this.lastError);
      }
      const document = await createPolicyDocument(createDefaultPolicyDocument({
        id: 0,
        title: input.title.trim() || "隐私政策",
        version_label: input.version_label.trim() || "未命名版本",
        raw_text: input.raw_text,
        normalized_sections: JSON.stringify(parsed),
        imported_at: new Date().toISOString()
      }));
      await bulkCreatePolicySection(parsed.map((section) => createDefaultPolicySection({
        id: 0,
        document_id: document.id,
        section_no: section.section_no,
        heading: section.heading,
        content: section.content,
        category: classifyCategory(section.heading, section.content),
        risk_level: classifyRisk(section.heading, section.content)
      })));
      console.info("政策文档状态变更", "IMPORTED", document.id);
      await this.load();
      return document;
    }
  }
});
