# 隐私政策差异对比器

纯前端隐私政策版本对比与风险标注工具，用户粘贴两版文本后查看条款差异、风险标签和审阅清单；新版本发布前由「发布门禁」按条款逐条审阅，满足放行条件后生成含版本时间、风险与例外说明的只读快照。数据全部存 localStorage，不接入第三方 API。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

启动后访问 <http://localhost:20112>，左侧导航依次为：文档导入 → 版本对比 → 发布门禁（默认页）。

## 发布门禁工作流

1. **文档导入**：粘贴新版本全文（使用 `1.` 或 `第1条` 编号），系统自动分段、分类并判定风险等级。
2. **版本对比**：选择新旧两版，按条款编号展示新增 / 移除 / 改写 / 移动 / 未变内容及风险标签。
3. **发布门禁**：审阅人逐条给出结论——**通过 / 需修改 / 接受例外**；选择“接受例外”时必须填写例外理由和到期时间。
4. **放行规则**：所有高风险（HIGH）与严重（CRITICAL）条款都有有效结论，且没有“需修改”条款时，发布按钮才可用；例外到期后自动视为无结论并阻塞发布。
5. **只读快照**：执行发布后生成只读快照，冻结版本号、发布时间、操作人、差异统计、风险分布和每条例外的理由与到期时间，不可修改。
6. **再导入新版本**：正文未变条款按条款编号 + 正文哈希自动沿用原结论（标记“沿用”），正文变化或新增条款回到“待审阅”；旧的逐条结论与已发布快照全部保留，可在门禁页底部查看历史。

## 访问地址或 CLI 示例

前端：<http://localhost:20112>

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 类型检查与构建：`cd frontend && npm run build`

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Pinia + localStorage |
| 后端 | -（本地 mock + localStorage API 封装） |
| 数据库 | localStorage（首次启动内置 v3.0 / v3.1 两版示例政策） |
| 部署 | Docker Compose（Nginx 托管 SPA） |

## 项目目录结构

```text
frontend/src/
├── api/                  # 按模型分文件封装 async API，GateDecision / ReleaseSnapshot 走 localStorage
├── stores/               # Pinia 独立 store，ReleaseGateStore 承载门禁校验、结论与快照
├── types/                # 数据模型类型（PolicyDocument/PolicySection/DiffResult/ReviewNote/GateDecision/ReleaseSnapshot/SectionDiff）
├── constants/            # 枚举、日志模板、错误码/错误消息、localStorage 键名
├── constructors/         # 默认对象 / 表单 / 响应对象构造器
├── components/common/    # ImportPanel、DiffViewer、RiskTag、ReviewChecklist、SectionCard、StatusBadge 等
├── hooks/                # useTextDiff、usePolicyParser、useLocalStorageState
├── pages/                # DocumentsPage、ComparePage、RisksPage、ReviewPage、ReleaseGatePage
├── router/               # 路由清单
├── utils/                # policyDiff（解析/哈希/分类/条款级对比）、formatters
└── mocks/                # 内置示例政策种子数据
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `policy-diff`
- `FRONTEND_PORT`: 前端端口，默认 `20112`

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: policy-diff`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-policy-diff}` 前缀。
- 前端端口映射 `${FRONTEND_PORT:-20112}:80`；纯前端应用无数据库卷，数据在浏览器 localStorage 中。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要清空本地演示数据时，在浏览器控制台执行 `localStorage.clear()` 后刷新。

## 枚举/常量出现位置清单

- DiffType（ADDED/REMOVED/MODIFIED/MOVED/UNCHANGED）：`constants/DiffType.ts`、`types/DiffType.ts`、`utils/policyDiff.ts`（对比产出）、`hooks/useTextDiff.ts`（筛选）、`utils/formatters.ts`（中文文案）、`components/common/DiffViewer.vue`、版本对比页与发布门禁页的差异徽标、快照统计字段。
- PrivacyRiskLevel（LOW/MEDIUM/HIGH/CRITICAL）：`constants/PrivacyRiskLevel.ts`、`types/PrivacyRiskLevel.ts`、`utils/policyDiff.ts`（风险分类）、`components/common/RiskTag.vue`、`components/common/ReviewChecklist.vue`、发布门禁放行校验（HIGH/CRITICAL 必须有结论）、只读快照。
- ReviewStatus（OPEN/CONFIRMED/IGNORED/RESOLVED）：`constants/ReviewStatus.ts`、`types/ReviewStatus.ts`、审阅备注种子数据与审阅清单。
- GateDecisionType（PENDING/APPROVED/NEEDS_CHANGES/EXCEPTION）：`constants/GateDecisionType.ts`、`types/GateDecision.ts`、`constants/statusText.ts`、`constructors/GateDecisionConstructor.ts`、`stores/ReleaseGateStore.ts`（沿用/重置/放行校验）、`utils/formatters.ts`、`components/common/ReviewChecklist.vue`、发布门禁页结论下拉与历史、只读快照详情。
- 配套常量：`constants/logTemplates.ts`（门禁与快照日志模板）、`constants/errorCodes.ts` + `constants/errorMessages.ts`（GATE_BLOCKED、例外理由/到期缺失、快照只读等错误）、`constants/storageKeys.ts`（localStorage 键）。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；新增一个审阅结论状态需要同步常量、类型、构造器、日志模板、错误消息、格式化函数、清单汇总、门禁校验和快照结构。条款对比依赖 `utils/policyDiff.ts` 的解析与哈希规则，版本对比页、发布门禁和“再导入沿用结论”三处共享同一套计算，修改分类或哈希口径会同时影响差异展示、风险判定与结论沿用。

## License

MIT
