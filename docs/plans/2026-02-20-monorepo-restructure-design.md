# Monorepo 重构设计（apps + a2ui-web 包内聚）

## 目标

将仓库重构为统一 monorepo 结构：

- 应用层：`apps/web`、`apps/ai-agent`、`apps/gateway`
- 包层：`packages/a2ui-web/*`（来自 `/Users/ethan/lb-code/a2ui-component` 全量包）
- 现有保留：`packages/docs`、`packages/mcp`

## 设计决策

1. 采用“一次性重排”方案（A）
   - 优点：快速消除双路径、依赖图清晰、后续 CI 和发布策略统一
   - 代价：变更面较大，需要同步修复配置与文档

2. Node + Python 混合仓治理
   - Node 侧：继续使用 Bun Workspaces 作为统一包管理入口
   - Python 侧：保持 `uv` 独立工作流，不强行接入 Bun 生命周期

3. a2ui-web 全量并入
   - 将 `a2ui-component` 的核心包迁入 `packages/a2ui-web/*`
   - 使用 `workspace:*` 让 `apps/web` 直接消费本地包，避免私仓发布依赖

4. 包名对齐策略
   - 修复 `config-tailwind` 包名不一致：
     - 当前来源包名为 `@a2ui-web/config-tailwind-old`
     - 目标统一为 `@a2ui-web/config-tailwind`（与 `apps/web` 依赖一致）

## 执行与风险

- 分阶段执行：骨架重排 -> 包导入 -> 配置修正 -> 文档同步 -> 验证
- 风险控制：每阶段独立提交、失败可按阶段 `git revert`
- 非目标：本次不新增功能，不修改业务行为，只做结构与依赖治理

## 验收标准

- 根 workspace 可解析 `apps/*` 与 `packages/*`
- `apps/web` 能完成依赖解析并通过最小构建验证
- `apps/ai-agent`、`apps/gateway` 可完成 `uv sync` 与基本启动验证
- 文档路径与启动命令全部对齐新结构
