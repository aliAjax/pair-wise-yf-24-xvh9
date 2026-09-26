import { readStore, writeStore } from "./localStore";
import type { GateDecision } from "../types/GateDecision";

const resource = "gateDecisions" as const;
const seedKey = "gateDecision" as const;

export async function listGateDecision(): Promise<GateDecision[]> {
  return readStore<GateDecision>(resource, seedKey);
}

export async function appendGateDecision(payload: GateDecision): Promise<GateDecision> {
  const rows = await listGateDecision();
  rows.push(payload);
  writeStore(resource, rows);
  return payload;
}
