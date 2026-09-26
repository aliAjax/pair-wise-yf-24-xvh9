export interface ParsedSection {
  section_no: string;
  heading: string;
  content: string;
}

export interface SectionDiff {
  section_no: string;
  heading: string;
  diff_type: string;
  old_content: string;
  new_content: string;
  category: string;
  risk_level: string;
  content_hash: string;
}
