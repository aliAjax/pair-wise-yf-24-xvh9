export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "请先登录后再继续操作",
  RBAC_DENIED: "当前角色没有执行该动作的权限",
  VALIDATION_FAILED: "表单字段缺失或格式错误",
  RATE_LIMITED: "请求过于频繁，请稍后再试",
  GATE_BLOCKED: "发布门禁未通过：高风险项需全部有结论，且不能存在需修改项",
  EXCEPTION_INCOMPLETE: "接受例外必须填写例外理由和到期时间，且到期时间不能早于当前时间",
  ALREADY_RELEASED: "该版本已发布，结论已锁定，请导入新版本后再审阅",
  NO_CANDIDATE_VERSION: "请先在文档导入页导入至少两个版本，才能生成门禁清单"
};
