import type { PrivacyRiskLevel } from "../types/PrivacyRiskLevel";

export interface ParsedSection {
  section_no: string;
  heading: string;
  content: string;
}

const NUMBERED_RE = /^(\d+(?:\.\d+)*)\s*[\.、]?\s*(.*)$/;
const CHINESE_RE = /^([一二三四五六七八九十]+)[、.]\s*(.*)$/;
const ARTICLE_RE = /^第([一二三四五六七八九十\d]+)条\s*(.*)$/;

function matchHeading(text: string): { no: string; rest: string } | null {
  const numbered = text.match(NUMBERED_RE);
  if (numbered) return { no: numbered[1], rest: numbered[2].trim() };
  const chinese = text.match(CHINESE_RE);
  if (chinese) return { no: chinese[1], rest: chinese[2].trim() };
  const article = text.match(ARTICLE_RE);
  if (article) return { no: article[1], rest: article[2].trim() };
  return null;
}

// 把粘贴的隐私政策文本按条款编号切分成结构化条款。
export function parsePolicyText(raw: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  let current: ParsedSection | null = null;
  for (const line of raw.split(/\r?\n/)) {
    const text = line.trim();
    if (!text) continue;
    const matched = matchHeading(text);
    if (matched) {
      current = {
        section_no: matched.no,
        heading: (matched.rest || `条款 ${matched.no}`).slice(0, 40),
        content: text
      };
      sections.push(current);
    } else if (current) {
      current.content += "\n" + text;
    } else {
      current = { section_no: "0", heading: "前言", content: text };
      sections.push(current);
    }
  }
  return sections;
}

const RISK_RULES: Array<{ level: PrivacyRiskLevel; keywords: string[] }> = [
  { level: "CRITICAL", keywords: ["敏感个人信息", "生物识别", "人脸", "指纹", "行踪轨迹", "未成年人", "不满十四周岁"] },
  { level: "HIGH", keywords: ["共享", "转让", "公开披露", "第三方", "关联公司", "跨境", "境外", "精确位置", "保存期限"] },
  { level: "MEDIUM", keywords: ["Cookie", "cookie", "日志", "设备信息", "位置信息", "IP 地址", "IP地址"] }
];

// 按关键词给条款打初始风险等级，可在风险标注页人工调整。
export function assessRisk(text: string): PrivacyRiskLevel {
  for (const rule of RISK_RULES) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) return rule.level;
  }
  return "LOW";
}

const CATEGORY_RULES: Array<{ category: string; keywords: string[] }> = [
  { category: "信息收集", keywords: ["收集", "获取"] },
  { category: "信息使用", keywords: ["使用", "处理"] },
  { category: "共享与转让", keywords: ["共享", "转让", "披露", "第三方"] },
  { category: "保存期限", keywords: ["保存", "存储", "删除"] },
  { category: "用户权利", keywords: ["权利", "查询", "更正", "注销", "撤回"] },
  { category: "联系方式", keywords: ["联系", "投诉"] }
];

export function categorize(text: string): string {
  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => text.includes(keyword))) return rule.category;
  }
  return "其他";
}
