import { computed, ref, type Ref } from "vue";
import { diffSections } from "../utils/policyDiff";
import type { ParsedSection, SectionDiff } from "../types/SectionDiff";

export function useTextDiff(oldSections: Ref<ParsedSection[]>, newSections: Ref<ParsedSection[]>) {
  const diffType = ref<string>("");
  const rows = computed<SectionDiff[]>(() => diffSections(oldSections.value, newSections.value));
  const filteredRows = computed(() =>
    diffType.value ? rows.value.filter((row) => row.diff_type === diffType.value) : rows.value
  );
  const counts = computed(() => ({
    ADDED: rows.value.filter((r) => r.diff_type === "ADDED").length,
    REMOVED: rows.value.filter((r) => r.diff_type === "REMOVED").length,
    MODIFIED: rows.value.filter((r) => r.diff_type === "MODIFIED").length,
    MOVED: rows.value.filter((r) => r.diff_type === "MOVED").length,
    UNCHANGED: rows.value.filter((r) => r.diff_type === "UNCHANGED").length
  }));
  return { rows, filteredRows, counts, diffType };
}
