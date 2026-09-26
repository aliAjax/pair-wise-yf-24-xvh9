import { defineStore } from "pinia";
import { listReviewNote, saveReviewNote } from "../api/ReviewNote";
import { createDefaultReviewNote } from "../constructors/ReviewNoteConstructor";
import type { ReviewNote } from "../types/ReviewNote";

export const useReviewNoteStore = defineStore("reviewNote", {
  state: () => ({ rows: [] as ReviewNote[], loading: false }),
  actions: {
    async load() {
      this.loading = true;
      this.rows = await listReviewNote();
      this.loading = false;
    },
    async addNote(payload: { diff_result_id: number; tag: string; comment: string; reviewer: string }) {
      const id = this.rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
      const note = createDefaultReviewNote({ id, status: "OPEN", ...payload });
      this.rows = await saveReviewNote(note);
      return note;
    },
    async updateStatus(id: number, status: string) {
      const row = this.rows.find((item) => item.id === id);
      if (!row) return;
      row.status = status;
      this.rows = await saveReviewNote(row);
    }
  }
});
