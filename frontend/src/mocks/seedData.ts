const v30Sections = [
  {
    section_no: "1",
    heading: "我们如何收集和使用您的个人信息",
    content: "我们仅收集为您提供服务所必需的个人信息，包括账户注册信息（手机号码、昵称）、设备日志信息以及您在使用服务时主动提供的信息。"
  },
  {
    section_no: "2",
    heading: "信息的保存期限",
    content: "我们仅在实现目的所必需的最短期限内保存您的个人信息，账户信息在您注销账户后保存三年，到期后我们将删除或匿名化处理。"
  },
  {
    section_no: "3",
    heading: "我们如何与第三方共享和转让您的个人信息",
    content: "我们不会以营利为目的向任何公司提供您的个人信息。仅在获得您的明确同意后，我们才会与合作伙伴共享为提供服务所必需的信息，并要求其按照本政策进行保护。"
  },
  {
    section_no: "4",
    heading: "您对个人信息享有的权利",
    content: "您有权查阅、复制、更正、补充您的个人信息，也可以注销账户或撤回已作出的授权。您可以通过设置页面或联系客服行使上述权利。"
  },
  {
    section_no: "5",
    heading: "未成年人个人信息保护",
    content: "我们非常重视未成年人的个人信息保护。若您是未满十四周岁的未成年人，请在监护人陪同和同意后使用我们的服务。"
  }
];

const v31Sections = [
  v30Sections[0],
  {
    section_no: "2",
    heading: "信息的保存期限",
    content: "我们仅在实现目的所必需的最短期限内保存您的个人信息。自2026年10月起，账户信息在您注销账户后保存期限缩短为一年，到期后我们将删除或匿名化处理。"
  },
  {
    section_no: "3",
    heading: "我们如何与第三方共享和转让您的个人信息",
    content: "我们不会以营利为目的向任何公司提供您的个人信息。仅在获得您的明确同意后，我们才会与合作伙伴共享为提供服务所必需的信息，并要求其按照本政策进行保护。本版本起，我们通过第三方统计分析SDK收集设备标识符，用于改进产品功能；SDK提供方名单可在本政策附录中查阅。"
  },
  v30Sections[3],
  {
    section_no: "6",
    heading: "我们如何处理跨境数据传输",
    content: "如您通过我们的服务发生个人信息跨境传输，我们将按照法律规定进行安全评估，并取得您的单独同意后向境外接收方提供个人信息。"
  }
];

const toRaw = (sections: { section_no: string; heading: string; content: string }[]) =>
  sections.map((s) => `${s.section_no}. ${s.heading}\n${s.content}`).join("\n\n");

export const mockData = {
  policyDocument: [
    {
      id: 1,
      title: "隐私政策",
      version_label: "v3.0",
      raw_text: toRaw(v30Sections),
      normalized_sections: JSON.stringify(v30Sections),
      imported_at: "2026-06-11T09:00:00Z"
    },
    {
      id: 2,
      title: "隐私政策",
      version_label: "v3.1",
      raw_text: toRaw(v31Sections),
      normalized_sections: JSON.stringify(v31Sections),
      imported_at: "2026-09-20T09:00:00Z"
    }
  ],
  policySection: [
    { id: 1, document_id: 1, section_no: "1", heading: v30Sections[0].heading, content: v30Sections[0].content, category: "数据收集", risk_level: "MEDIUM" },
    { id: 2, document_id: 1, section_no: "2", heading: v30Sections[1].heading, content: v30Sections[1].content, category: "保存期限", risk_level: "MEDIUM" },
    { id: 3, document_id: 1, section_no: "3", heading: v30Sections[2].heading, content: v30Sections[2].content, category: "数据共享", risk_level: "HIGH" },
    { id: 4, document_id: 1, section_no: "4", heading: v30Sections[3].heading, content: v30Sections[3].content, category: "用户权利", risk_level: "LOW" },
    { id: 5, document_id: 1, section_no: "5", heading: v30Sections[4].heading, content: v30Sections[4].content, category: "未成年人", risk_level: "HIGH" },
    { id: 6, document_id: 2, section_no: "1", heading: v31Sections[0].heading, content: v31Sections[0].content, category: "数据收集", risk_level: "MEDIUM" },
    { id: 7, document_id: 2, section_no: "2", heading: v31Sections[1].heading, content: v31Sections[1].content, category: "保存期限", risk_level: "MEDIUM" },
    { id: 8, document_id: 2, section_no: "3", heading: v31Sections[2].heading, content: v31Sections[2].content, category: "数据共享", risk_level: "HIGH" },
    { id: 9, document_id: 2, section_no: "4", heading: v31Sections[3].heading, content: v31Sections[3].content, category: "用户权利", risk_level: "LOW" },
    { id: 10, document_id: 2, section_no: "6", heading: v31Sections[4].heading, content: v31Sections[4].content, category: "跨境传输", risk_level: "CRITICAL" }
  ],
  diffResult: [
    { id: 1, old_document_id: 1, new_document_id: 2, section_id: 6, diff_type: "UNCHANGED", summary: "第1条内容未变", created_at: "2026-09-20T09:05:00Z" },
    { id: 2, old_document_id: 1, new_document_id: 2, section_id: 7, diff_type: "MODIFIED", summary: "第2条保存期限由三年缩短为一年", created_at: "2026-09-20T09:05:00Z" },
    { id: 3, old_document_id: 1, new_document_id: 2, section_id: 8, diff_type: "MODIFIED", summary: "第3条新增第三方统计分析SDK说明", created_at: "2026-09-20T09:05:00Z" },
    { id: 4, old_document_id: 1, new_document_id: 2, section_id: 9, diff_type: "UNCHANGED", summary: "第4条内容未变", created_at: "2026-09-20T09:05:00Z" },
    { id: 5, old_document_id: 1, new_document_id: 2, section_id: 5, diff_type: "REMOVED", summary: "第5条未成年人保护条款移除", created_at: "2026-09-20T09:05:00Z" },
    { id: 6, old_document_id: 1, new_document_id: 2, section_id: 10, diff_type: "ADDED", summary: "第6条新增跨境数据传输说明", created_at: "2026-09-20T09:05:00Z" }
  ],
  reviewNote: [
    { id: 1, diff_result_id: 2, tag: "保存期限", comment: "确认留存期限缩短合规", reviewer: "法务-王敏", status: "CONFIRMED" },
    { id: 2, diff_result_id: 3, tag: "数据共享", comment: "需补充SDK提供方名单链接", reviewer: "法务-王敏", status: "OPEN" },
    { id: 3, diff_result_id: 6, tag: "跨境传输", comment: "需核实安全评估是否已完成", reviewer: "安全-李峥", status: "OPEN" }
  ],
  gateDecision: [],
  releaseSnapshot: []
} as const;
