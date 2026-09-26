export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  GATE_BLOCKED: "高风险项尚未全部结论或仍存在需修改项，发布门禁未放行",
  EXCEPTION_REASON_REQUIRED: "接受例外必须填写例外理由",
  EXCEPTION_EXPIRES_REQUIRED: "接受例外必须填写到期时间",
  DOCUMENT_PARSE_EMPTY: "未解析到任何编号条款，请使用“1.”或“第1条”格式的条款编号",
  SNAPSHOT_FROZEN: "发布快照为只读记录，不允许修改或删除"
};
