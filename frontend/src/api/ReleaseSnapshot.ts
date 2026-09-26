import { readStore, writeStore } from "./localStore";
import type { ReleaseSnapshot } from "../types/ReleaseSnapshot";

const resource = "releaseSnapshots" as const;
const seedKey = "releaseSnapshot" as const;

export async function listReleaseSnapshot(): Promise<ReleaseSnapshot[]> {
  return readStore<ReleaseSnapshot>(resource, seedKey);
}

export async function appendReleaseSnapshot(payload: ReleaseSnapshot): Promise<ReleaseSnapshot> {
  const rows = await listReleaseSnapshot();
  rows.unshift(payload);
  writeStore(resource, rows);
  return payload;
}
