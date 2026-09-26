import type { DiffType } from "../types/DiffType";
import type { PrivacyRiskLevel } from "../types/PrivacyRiskLevel";
import { assessRisk, type ParsedSection } from "./usePolicyParser";

export interface DiffRow {
  section_no: string;
  heading: string;
  diff_type: DiffType;
  old_content: string;
  new_content: string;
  content_hash: string;
  risk_level: PrivacyRiskLevel;
}

// djb2 字符串哈希，用于判断条款正文是否发生变化。
export function contentHash(text: string): string {
  let hash = 5381;
  for (let index = 0; index < text.length; index++) {
    hash = ((hash << 5) + hash + text.charCodeAt(index)) >>> 0;
  }
  return hash.toString(36);
}

export function compareSectionNo(a: string, b: string): number {
  const pa = a.split(".");
  const pb = b.split(".");
  for (let index = 0; index < Math.max(pa.length, pb.length); index++) {
    const na = Number(pa[index] ?? "");
    const nb = Number(pb[index] ?? "");
    if (Number.isNaN(na) || Number.isNaN(nb)) return a.localeCompare(b, "zh-CN");
    if (na !== nb) return na - nb;
  }
  return 0;
}

// 按条款编号对齐两版条款，产出新增/移除/改写/移动/未变差异行。
export function diffSections(oldSections: ParsedSection[], newSections: ParsedSection[]): DiffRow[] {
  const oldMap = new Map(oldSections.map((section) => [section.section_no, section]));
  const newMap = new Map(newSections.map((section) => [section.section_no, section]));
  const oldNoByHash = new Map(oldSections.map((section) => [contentHash(section.content), section.section_no]));
  const movedFrom = new Set<string>();
  const rows: DiffRow[] = [];
  const allNos = [...new Set([...oldMap.keys(), ...newMap.keys()])].sort(compareSectionNo);

  for (const no of allNos) {
    const oldSection = oldMap.get(no);
    const newSection = newMap.get(no);
    if (oldSection && newSection) {
      const same = contentHash(oldSection.content) === contentHash(newSection.content);
      rows.push({
        section_no: no,
        heading: newSection.heading,
        diff_type: same ? "UNCHANGED" : "MODIFIED",
        old_content: oldSection.content,
        new_content: newSection.content,
        content_hash: contentHash(newSection.content),
        risk_level: assessRisk(newSection.content)
      });
    } else if (newSection) {
      const hash = contentHash(newSection.content);
      const previousNo = oldNoByHash.get(hash);
      if (previousNo && !newMap.has(previousNo)) {
        movedFrom.add(previousNo);
        rows.push({
          section_no: no,
          heading: newSection.heading,
          diff_type: "MOVED",
          old_content: oldMap.get(previousNo)?.content ?? "",
          new_content: newSection.content,
          content_hash: hash,
          risk_level: assessRisk(newSection.content)
        });
      } else {
        rows.push({
          section_no: no,
          heading: newSection.heading,
          diff_type: "ADDED",
          old_content: "",
          new_content: newSection.content,
          content_hash: hash,
          risk_level: assessRisk(newSection.content)
        });
      }
    } else if (oldSection) {
      if (movedFrom.has(no)) continue;
      rows.push({
        section_no: no,
        heading: oldSection.heading,
        diff_type: "REMOVED",
        old_content: oldSection.content,
        new_content: "",
        content_hash: contentHash(oldSection.content),
        risk_level: assessRisk(oldSection.content)
      });
    }
  }
  return rows;
}
