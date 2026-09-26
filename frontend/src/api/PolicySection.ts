import { mockData } from "../mocks/seedData";
import { loadRows, saveRows, upsertRow } from "../utils/storage";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { PolicySection } from "../types/PolicySection";

const STORAGE_KEY = "sections";

export async function listPolicySection(): Promise<PolicySection[]> {
  return loadRows<PolicySection>(STORAGE_KEY, mockData.policySection as unknown as PolicySection[]);
}

export async function savePolicySection(payload: PolicySection): Promise<PolicySection[]> {
  console.info(LOG_TEMPLATES.PolicySection[1], payload.section_no);
  return upsertRow<PolicySection>(STORAGE_KEY, mockData.policySection as unknown as PolicySection[], payload);
}

export async function replacePolicySection(rows: PolicySection[]): Promise<void> {
  console.info(LOG_TEMPLATES.PolicySection[0], rows.length);
  saveRows<PolicySection>(STORAGE_KEY, rows);
}
