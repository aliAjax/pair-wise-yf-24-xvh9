export const formatDate = (value: string) => (value ? new Date(value).toLocaleString("zh-CN") : "-");
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => ({ LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" }[value] ?? value);
export const formatDiffType = (value: string) => ({ ADDED: "新增", REMOVED: "移除", MODIFIED: "改写", MOVED: "移动", UNCHANGED: "未变" }[value] ?? value);
export const formatDecision = (value: string) => ({ PENDING: "待办", APPROVED: "通过", NEEDS_CHANGES: "需修改", EXCEPTION: "接受例外" }[value] ?? value);
