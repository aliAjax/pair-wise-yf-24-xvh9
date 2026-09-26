import { defineStore } from "pinia";
import { listDiffResult, replaceDiffResult } from "../api/DiffResult";
import { createDefaultDiffResult } from "../constructors/DiffResultConstructor";
import type { DiffResult } from "../types/DiffResult";
import type { DiffRow } from "../hooks/useTextDiff";

export const useDiffResultStore = defineStore("diffResult", {
  state: () => ({ rows: [] as DiffResult[], loading: false }),
  actions: {
    async load() {
      this.loading = true;
      this.rows = await listDiffResult();
      this.loading = false;
    },
    // 把一轮版本对比的差异行落库为 DiffResult，供对比视图与审阅清单复用。
    async recordRound(oldDocumentId: number, newDocumentId: number, diffRows: DiffRow[]) {
      const kept = this.rows.filter(
        (row) => !(row.old_document_id === oldDocumentId && row.new_document_id === newDocumentId)
      );
      let id = this.rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      const createdAt = new Date().toISOString();
      const created = diffRows.map((row) =>
        createDefaultDiffResult({
          id: id++,
          old_document_id: oldDocumentId,
          new_document_id: newDocumentId,
          section_id: 0,
          diff_type: row.diff_type,
          summary: `${row.section_no} ${row.heading}`,
          created_at: createdAt
        })
      );
      this.rows = [...kept, ...created];
      await replaceDiffResult(this.rows);
      return created;
    }
  }
});
