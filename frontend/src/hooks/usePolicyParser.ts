import { computed, ref } from "vue";
import { parseSections } from "../utils/policyDiff";
import type { ParsedSection } from "../types/SectionDiff";

export function usePolicyParser(rawText: string) {
  const source = ref(rawText);
  const sections = computed<ParsedSection[]>(() => parseSections(source.value));
  const isEmpty = computed(() => sections.value.length === 0);
  return { source, sections, isEmpty };
}
