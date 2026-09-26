import type { ParsedSection, SectionDiff } from "../types/SectionDiff";

const HEADING_RE = /^\s*(?:第\s*(\d+(?:\.\d+)*)\s*条|(\d+(?:\.\d+)*)[.、])\s*(.*)$/;

export function contentHash(text: string): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  let hash = 5381;
  for (let i = 0; i < normalized.length; i += 1) {
    hash = ((hash << 5) + hash + normalized.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}

export function parseSections(raw: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;
  for (const line of raw.split(/\r?\n/)) {
    const match = HEADING_RE.exec(line);
    if (match) {
      current = {
        section_no: match[1] ?? match[2],
        heading: (match[3] ?? "").trim() || "未命名条款",
        content: ""
      };
      sections.push(current);
    } else if (current && line.trim()) {
      current.content = current.content ? `${current.content}\n${line.trim()}` : line.trim();
    }
  }
  return sections;
}

export function classifyCategory(heading: string, content: string): string {
  const text = `${heading}\n${content}`;
  if (/跨境|境外|出境/.test(text)) return "跨境传输";
  if (/共享|转让|第三方|SDK|委托处理/.test(text)) return "数据共享";
  if (/保存|存储|保留期限|删除/.test(text)) return "保存期限";
  if (/收集|获取|采集|Cookie|日志/.test(text)) return "数据收集";
  if (/权利|查阅|更正|注销|撤回/.test(text)) return "用户权利";
  if (/未成年|儿童|监护/.test(text)) return "未成年人";
  return "其他";
}

export function classifyRisk(heading: string, content: string): string {
  const text = `${heading}\n${content}`;
  if (/跨境|境外|敏感个人信息|生物识别|公开披露|出售/.test(text)) return "CRITICAL";
  if (/共享|转让|第三方|SDK|未成年|儿童|精准营销|自动化决策/.test(text)) return "HIGH";
  if (/收集|保存|存储|Cookie|日志|留存/.test(text)) return "MEDIUM";
  return "LOW";
}

export function compareSectionNo(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

function toDiff(sectionNo: string, heading: string, diffType: string, oldContent: string, newContent: string): SectionDiff {
  const riskSource = diffType === "REMOVED" ? oldContent : newContent;
  const body = diffType === "REMOVED" ? oldContent : newContent;
  return {
    section_no: sectionNo,
    heading,
    diff_type: diffType,
    old_content: oldContent,
    new_content: newContent,
    category: classifyCategory(heading, riskSource),
    risk_level: classifyRisk(heading, riskSource),
    content_hash: contentHash(body)
  };
}

export function diffSections(oldSections: ParsedSection[], newSections: ParsedSection[]): SectionDiff[] {
  const oldByNo = new Map(oldSections.map((s) => [s.section_no, s]));
  const newByNo = new Map(newSections.map((s) => [s.section_no, s]));
  const oldHashToNo = new Map(oldSections.map((s) => [contentHash(s.content), s.section_no]));
  const rows: SectionDiff[] = [];

  for (const next of newSections) {
    const prev = oldByNo.get(next.section_no);
    if (!prev) {
      const movedFrom = oldHashToNo.get(contentHash(next.content));
      rows.push(movedFrom
        ? toDiff(next.section_no, next.heading, "MOVED", next.content, next.content)
        : toDiff(next.section_no, next.heading, "ADDED", "", next.content));
    } else if (contentHash(prev.content) === contentHash(next.content)) {
      rows.push(toDiff(next.section_no, next.heading, "UNCHANGED", prev.content, next.content));
    } else {
      rows.push(toDiff(next.section_no, next.heading, "MODIFIED", prev.content, next.content));
    }
  }
  for (const prev of oldSections) {
    if (!newByNo.has(prev.section_no)) {
      const stillPresent = newSections.some((s) => contentHash(s.content) === contentHash(prev.content));
      if (!stillPresent) rows.push(toDiff(prev.section_no, prev.heading, "REMOVED", prev.content, ""));
    }
  }
  return rows.sort((a, b) => compareSectionNo(a.section_no, b.section_no));
}
