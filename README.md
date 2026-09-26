# 隐私政策差异对比器

纯前端隐私政策版本对比与发布门禁工具：粘贴两版文本后按条款编号查看新增、移除、改写、未变差异与风险标签，审阅人逐条给出通过 / 需修改 / 接受例外结论，门禁通过后才能发布并生成只读快照，数据存 localStorage。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20112>

## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`

## 发布门禁流程

1. **文档导入** `/documents`：粘贴新版全文，自动按条款编号分段；导入第二个及以后的版本时自动生成新一轮门禁清单——正文未变的条款沿用上一轮结论，正文变化或新增的条款回到待办，旧轮结论记录打标保留不删除。
2. **版本对比** `/compare`：任选两个版本，按条款编号展示新增 / 移除 / 改写 / 移动 / 未变，支持按差异类型过滤。
3. **风险标注** `/risks`：调整条款风险等级（同步到门禁清单），并给条款写审阅备注。
4. **发布门禁** `/review`：审阅人对每条差异选择 通过 / 需修改 / 接受例外；例外必须填写理由和未过期的到期时间，否则视为待办。高风险（HIGH / CRITICAL）条款全部有结论且没有任何「需修改」项时，「执行发布」才可点击；发布成功后清单锁定，生成只读快照。
5. **发布快照** `/snapshots`：查看每次发布的只读快照（版本时间、风险统计、例外说明、逐条结论），以及被新一轮取代的历史结论记录。

## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus + Pinia + localStorage |
| 后端 | - |
| 数据库 | 本地模拟数据 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `policy-diff`
- `FRONTEND_PORT`: 前端端口，默认 `20112`

## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: policy-diff`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-policy-diff}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- DiffType: constants/DiffType、types/DiffType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- PrivacyRiskLevel: constants/PrivacyRiskLevel、types/PrivacyRiskLevel、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- ReviewStatus: constants/ReviewStatus、types/ReviewStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- GateDecision: constants/GateDecision、types/GateDecision、constructors/GateReviewConstructor、utils/gateRules、logTemplates、errorMessages、formatters、ReviewChecklist 筛选与展示、ReviewPage 门禁面板均有引用。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
