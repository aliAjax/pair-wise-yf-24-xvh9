import { readStore, writeStore } from "./localStore";
import type { PolicySection } from "../types/PolicySection";

const resource = "sections" as const;
const seedKey = "policySection" as const;

export async function listPolicySection(): Promise<PolicySection[]> {
  return readStore<PolicySection>(resource, seedKey);
}

export async function savePolicySection(payload: PolicySection) {
  console.info("save PolicySection", payload);
  return payload;
}

export async function bulkCreatePolicySection(payload: PolicySection[]): Promise<PolicySection[]> {
  const rows = await listPolicySection();
  let nextId = rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  for (const section of payload) {
    section.id = nextId;
    nextId += 1;
    rows.push(section);
  }
  writeStore(resource, rows);
  console.info("条款段落创建", payload.length);
  return payload;
}
