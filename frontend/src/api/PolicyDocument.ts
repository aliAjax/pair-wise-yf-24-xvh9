import { readStore, writeStore } from "./localStore";
import type { PolicyDocument } from "../types/PolicyDocument";

const resource = "documents" as const;
const seedKey = "policyDocument" as const;

export async function listPolicyDocument(): Promise<PolicyDocument[]> {
  return readStore<PolicyDocument>(resource, seedKey);
}

export async function savePolicyDocument(payload: PolicyDocument) {
  console.info("save PolicyDocument", payload);
  return payload;
}

export async function createPolicyDocument(payload: PolicyDocument): Promise<PolicyDocument> {
  const rows = await listPolicyDocument();
  payload.id = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  rows.push(payload);
  writeStore(resource, rows);
  console.info("政策文档创建", payload.version_label, payload.id);
  return payload;
}
