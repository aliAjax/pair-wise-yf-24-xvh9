import { mockData } from "../mocks/seedData";
import { loadRows, saveRows, upsertRow } from "../utils/storage";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { ReviewNote } from "../types/ReviewNote";

const STORAGE_KEY = "review-notes";

export async function listReviewNote(): Promise<ReviewNote[]> {
  return loadRows<ReviewNote>(STORAGE_KEY, mockData.reviewNote as unknown as ReviewNote[]);
}

export async function saveReviewNote(payload: ReviewNote): Promise<ReviewNote[]> {
  console.info(LOG_TEMPLATES.ReviewNote[0], payload.tag);
  return upsertRow<ReviewNote>(STORAGE_KEY, mockData.reviewNote as unknown as ReviewNote[], payload);
}

export async function replaceReviewNote(rows: ReviewNote[]): Promise<void> {
  console.info(LOG_TEMPLATES.ReviewNote[1], rows.length);
  saveRows<ReviewNote>(STORAGE_KEY, rows);
}
