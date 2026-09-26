import { mockData } from "../mocks/seedData";
import { loadRows, saveRows, upsertRow } from "../utils/storage";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { PolicyDocument } from "../types/PolicyDocument";

const STORAGE_KEY = "documents";

export async function listPolicyDocument(): Promise<PolicyDocument[]> {
  return loadRows<PolicyDocument>(STORAGE_KEY, mockData.policyDocument as unknown as PolicyDocument[]);
}

export async function savePolicyDocument(payload: PolicyDocument): Promise<PolicyDocument[]> {
  console.info(LOG_TEMPLATES.PolicyDocument[0], payload.version_label);
  return upsertRow<PolicyDocument>(STORAGE_KEY, mockData.policyDocument as unknown as PolicyDocument[], payload);
}

export async function replacePolicyDocument(rows: PolicyDocument[]): Promise<void> {
  console.info(LOG_TEMPLATES.PolicyDocument[1], rows.length);
  saveRows<PolicyDocument>(STORAGE_KEY, rows);
}
