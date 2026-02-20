# Monorepo 重构实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将仓库从 `packages/*` 应用布局迁移为 `apps/*` + `packages/a2ui-web/*`，并保留 `packages/docs`、`packages/mcp`。

**Architecture:** 先完成目录骨架迁移，再导入外部 a2ui-web 包并修复包名/依赖，最后同步文档与验证。Node 与 Python 维持分层治理，避免跨生态耦合。

**Tech Stack:** Bun Workspaces、Next.js、FastAPI、LangGraph、uv。

---

### Task 1: 建立目录骨架并迁移三大应用

**Files:**
- Modify: `package.json`
- Move: `packages/web -> apps/web`
- Move: `packages/agent -> apps/ai-agent`
- Move: `packages/gateway -> apps/gateway`

**Step 1: 写迁移前检查脚本（失败即停止）**

```bash
ls packages/web packages/agent packages/gateway
```

**Step 2: 执行目录迁移**

```bash
mkdir -p apps
git mv packages/web apps/web
git mv packages/agent apps/ai-agent
git mv packages/gateway apps/gateway
```

**Step 3: 修正根 workspace 定义**

```json
{
  "workspaces": [
    "apps/*",
    "packages/*",
    "packages/a2ui-web/*"
  ]
}
```

**Step 4: 基线验证**

Run: `rg -n "packages/(web|agent|gateway)" README.md docs/ARCHITECTURE.md package.json`
Expected: 只剩待修正文档引用。

### Task 2: 导入 a2ui-web 全量包并对齐路径

**Files:**
- Create: `packages/a2ui-web/*`（全量包目录）
- Source: `/Users/ethan/lb-code/a2ui-component/*`

**Step 1: 创建目标目录并复制内容**

```bash
mkdir -p packages/a2ui-web
rsync -a --exclude '.git' --exclude 'node_modules' --exclude '.DS_Store' /Users/ethan/lb-code/a2ui-component/ packages/a2ui-web/
```

**Step 2: 删除非 monorepo 必需内容（如 example）**

```bash
rm -rf packages/a2ui-web/example
```

**Step 3: 验证包清单完整性**

Run: `ls packages/a2ui-web`
Expected: 包含 `a2ui-react-renderer`、`animations`、`assets`、`config-postcss`、`config-tailwind`、`config-typescript`、`lit-core`、`shadcn-ui`、`utils`。

### Task 3: 修正 a2ui 包名/依赖与 web 引用

**Files:**
- Modify: `packages/a2ui-web/config-tailwind/package.json`
- Modify: `apps/web/package.json`
- Modify: `apps/web/*`（仅必要路径）

**Step 1: 包名统一**

```json
{
  "name": "@a2ui-web/config-tailwind"
}
```

**Step 2: 验证 web 依赖全可解析**

Run: `cat apps/web/package.json`
Expected: `@a2ui-web/*` 均可在 workspace 中找到对应包。

**Step 3: 校验 Next 配置转译包清单无误**

Run: `cat apps/web/next.config.ts`
Expected: `transpilePackages` 中均是存在的 workspace 包。

### Task 4: 文档与脚本更新

**Files:**
- Modify: `README.md`
- Modify: `README_EN.md`
- Modify: `docs/ARCHITECTURE.md`

**Step 1: 目录结构改为 apps + packages/a2ui-web**

```markdown
apps/
  web/
  ai-agent/
  gateway/
packages/
  a2ui-web/
  docs/
  mcp/
```

**Step 2: 启动命令修正为新路径**

- `cd apps/gateway`
- `cd apps/web`
- `cd apps/ai-agent`

**Step 3: 关键路径回归检查**

Run: `rg -n "packages/web|packages/agent|packages/gateway" README.md README_EN.md docs/ARCHITECTURE.md`
Expected: 无旧路径残留。

### Task 5: 验证与交付

**Files:**
- Verify: 全仓

**Step 1: Workspace 安装验证**

Run: `bun install`
Expected: 不再出现 `@a2ui-web/* workspace not found`。

**Step 2: Web 构建验证**

Run: `cd apps/web && bun run lint && bun run build`
Expected: lint/build 成功。

**Step 3: Python 环境验证**

Run: `cd apps/ai-agent && uv sync`
Run: `cd apps/gateway && uv sync`
Expected: 依赖安装完成。

**Step 4: Commit**

```bash
git add .
git commit -m "重构为多应用monorepo"
```
