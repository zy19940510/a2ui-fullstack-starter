# A2UI Test Monorepo

English | [简体中文](./README.md)

A2UI Test is a monorepo full-stack sample including a Web app, Gateway, AI Agent, and a ComponentDoc MCP service used by the agent tooling.

## Current Structure (Latest)

```text
a2ui-test/
├── ARCHITECTURE.md
├── README.md
├── README_EN.md
├── apps/
│   ├── web/                    # Next.js 16 + React 19
│   ├── gateway/                # FastAPI SSE gateway
│   └── ai-agent/               # LangGraph agent logic and tools
├── packages/
│   ├── a2ui-web/               # UI/config packages migrated from a2ui-component
│   └── mcp/
│       └── ComponentDoc/
│           ├── main.py         # MCP server entry (port 9527)
│           └── docs/           # Component docs consumed by MCP
├── package.json                # workspace and root scripts
└── bun.lock
```

## Tech Stack

- Web: Next.js 16.1.6 + React 19 + Tailwind CSS 4
- Gateway: FastAPI + SSE
- Agent: LangGraph + LangChain OpenAI-compatible
- MCP: FastMCP (ComponentDoc)
- Workspace: Bun Workspaces + uv

## Prerequisites

- Bun >= 1.3
- Python >= 3.13
- uv

## Install Dependencies

```bash
# Repo root (Bun workspaces)
cd /Users/ethan/code/a2ui-test
bun install

# Python apps
cd apps/ai-agent && uv sync
cd ../gateway && uv sync
cd ../../packages/mcp/ComponentDoc && uv sync
```

## Environment Variables

Agent reads `apps/ai-agent/.env`:

```bash
cd /Users/ethan/code/a2ui-test
cp apps/ai-agent/.env.example apps/ai-agent/.env
```

Required keys:

- `OPENAI_API_KEY`
- `OPENAI_BASE_URL`
- `MODEL_NAME`

If your provider uses `ONE_API_KEY / ONE_BASE_URL`, map them to the `OPENAI_*` keys above.

## Start (Development)

Use 3 terminals:

```bash
# Terminal 1: ComponentDoc MCP
cd /Users/ethan/code/a2ui-test/packages/mcp/ComponentDoc
uv run python main.py

# Terminal 2: Gateway
cd /Users/ethan/code/a2ui-test/apps/gateway
uv run uvicorn main:app --reload --port 8000

# Terminal 3: Web
cd /Users/ethan/code/a2ui-test/apps/web
bun run dev
```

Notes:

- `apps/web` has `predev/prebuild` hooks to build `packages/a2ui-web` dependencies automatically.
- Gateway imports `apps/ai-agent/src` directly by path, so no standalone agent HTTP service is required.

## Common Commands

```bash
# Build a2ui-web package dependencies
cd /Users/ethan/code/a2ui-test
bun run build:a2ui-web

# Web checks
cd /Users/ethan/code/a2ui-test/apps/web
bun run lint
bun run build
```

## Endpoints

- Web: <http://localhost:3000>
- Weather Demo: <http://localhost:3000/weather>
- Gateway Health: <http://localhost:8000/api/health>
- Gateway Docs: <http://localhost:8000/docs>
- MCP Endpoint: <http://127.0.0.1:9527/mcp>

## Related Docs

- Architecture: [ARCHITECTURE.md](./ARCHITECTURE.md)
- Web: [apps/web/README.md](./apps/web/README.md)
- Gateway: [apps/gateway/README.md](./apps/gateway/README.md)
- Agent: [apps/ai-agent/README.md](./apps/ai-agent/README.md)
- ComponentDoc: [packages/mcp/ComponentDoc/README.md](./packages/mcp/ComponentDoc/README.md)
