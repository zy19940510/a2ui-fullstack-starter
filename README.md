# A2UI Test Monorepo

[English](./README_EN.md) | 简体中文

A2UI Test 是一个基于 Monorepo 的全栈示例项目，包含 Web 前端、Gateway 网关、AI Agent，以及供 Agent 消费的 ComponentDoc MCP 服务。

## 当前结构（最新）

```text
a2ui-test/
├── ARCHITECTURE.md
├── README.md
├── README_EN.md
├── apps/
│   ├── web/                    # Next.js 16 + React 19
│   ├── gateway/                # FastAPI SSE 网关
│   └── ai-agent/               # LangGraph Agent 能力与工具
├── packages/
│   ├── a2ui-web/               # 从 a2ui-component 并入的 UI/配置包
│   └── mcp/
│       └── ComponentDoc/
│           ├── main.py         # MCP 服务入口（9527）
│           └── docs/           # 组件文档（MCP 消费）
├── package.json                # workspace 与根脚本
└── bun.lock
```

## 技术栈

- Web: Next.js 16.1.6 + React 19 + Tailwind CSS 4
- Gateway: FastAPI + SSE
- Agent: LangGraph + LangChain OpenAI-compatible
- MCP: FastMCP（ComponentDoc）
- Workspace: Bun Workspaces + uv

## 前置要求

- Bun >= 1.3
- Python >= 3.13
- uv

## 安装依赖

```bash
# 根目录（Bun workspaces）
cd /Users/ethan/code/a2ui-test
bun install

# Python 子应用
cd apps/ai-agent && uv sync
cd ../gateway && uv sync
cd ../../packages/mcp/ComponentDoc && uv sync
```

## 环境变量

Agent 读取 `apps/ai-agent/.env`：

```bash
cd /Users/ethan/code/a2ui-test
cp apps/ai-agent/.env.example apps/ai-agent/.env
```

需要配置：

- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `MODEL_NAME`

## 启动（开发模式）

建议 3 个终端：

```bash
# 终端 1: ComponentDoc MCP
cd /Users/ethan/code/a2ui-test/packages/mcp/ComponentDoc
uv run python main.py

# 终端 2: Gateway
cd /Users/ethan/code/a2ui-test/apps/gateway
uv run uvicorn main:app --reload --port 8000

# 终端 3: Web
cd /Users/ethan/code/a2ui-test/apps/web
bun run dev
```

说明：

- `apps/web` 的 `predev/prebuild` 会自动执行 `build:deps`，预构建 `packages/a2ui-web` 产物。
- Gateway 会直接按路径加载 `apps/ai-agent/src`，不需要单独启动 Agent HTTP 服务。

## 常用命令

```bash
# 预构建 a2ui-web 依赖包
cd /Users/ethan/code/a2ui-test
bun run build:a2ui-web

# Web 质量检查
cd /Users/ethan/code/a2ui-test/apps/web
bun run lint
bun run build
```

## 访问地址

- Web: <http://localhost:3000>
- Weather Demo: <http://localhost:3000/weather>
- Gateway Health: <http://localhost:8000/api/health>
- Gateway Docs: <http://localhost:8000/docs>
- MCP Endpoint: <http://127.0.0.1:9527/mcp>

## 相关文档

- 架构文档: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Web 说明: [apps/web/README.md](./apps/web/README.md)
- Gateway 说明: [apps/gateway/README.md](./apps/gateway/README.md)
- Agent 说明: [apps/ai-agent/README.md](./apps/ai-agent/README.md)
- ComponentDoc 说明: [packages/mcp/ComponentDoc/README.md](./packages/mcp/ComponentDoc/README.md)
