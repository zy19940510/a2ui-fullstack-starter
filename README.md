# A2UI Test - AI Agent 聊天应用

[English](./README_EN.md) | 简体中文

一个完整的 AI Agent 聊天应用，支持流式输出、工具调用、自定义 UI 组件，基于 LangGraph、FastAPI 和 Next.js 构建。

## ✨ 特性

- 🚀 **流式输出**: 使用 SSE (Server-Sent Events) 实现实时响应
- 🛠️ **工具调用**: 集成天气查询、网络搜索、计算器等工具
- 🎨 **A2UI 组件**: 基于 A2UI 0.8 协议的自定义组件系统
- 🌍 **实时天气**: 集成 Open-Meteo API，免费无需 API Key
- 🌙 **黑暗模式**: 完整的主题切换支持
- 🔐 **安全配置**: 环境变量管理敏感信息

## 🏗️ 技术栈

- **前端**: Next.js 15 + React + Tailwind CSS
- **网关**: Python + FastAPI
- **Agent**: LangGraph + LangChain
- **LLM**: Claude Sonnet 4.5 (支持 Anthropic API / OpenAI-compatible API)
- **天气 API**: Open-Meteo (免费、开源)
- **搜索 API**: DuckDuckGo

## 📁 项目结构

```
a2ui-test/
├── packages/
│   ├── agent/          # LangGraph Agent
│   ├── gateway/        # FastAPI 网关
│   └── web/            # Next.js 前端
└── docs/
    ├── ARCHITECTURE.md      # 架构文档
    └── LLM_CONFIGURATION.md # LLM 配置指南
```

## 🚀 快速开始

### 1. 环境准备

```bash
# 克隆项目
git clone https://github.com/yourusername/a2ui-test.git
cd a2ui-test

# 安装 Python 依赖
cd packages/agent && uv sync
cd ../gateway && uv sync

# 安装前端依赖
cd ../web
npm install  # 或 bun install
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp packages/agent/.env.example packages/agent/.env

# 编辑 .env 文件，填入你的 API Key
# 使用 Anthropic API (推荐):
# OPENAI_API_KEY=your-anthropic-api-key
# OPENAI_BASE_URL=https://api.anthropic.com/v1
# MODEL_NAME=claude-sonnet-4-5-20250929
```

详细配置说明请查看 [LLM 配置文档](./docs/LLM_CONFIGURATION.md)。

### 3. 启动服务

**终端 1 - 启动 Gateway:**

```bash
cd packages/gateway
uv run uvicorn main:app --reload --port 8000
```

**终端 2 - 启动前端:**

```bash
cd packages/web
npm run dev
```

### 4. 访问应用

- 聊天页面: http://localhost:3000
- 天气组件演示: http://localhost:3000/weather
- API 健康检查: http://localhost:8000/api/health
- API 文档: http://localhost:8000/docs

## 💡 使用示例

### 测试 SSE 流式聊天

使用 curl 测试 API:

```bash
curl -X POST http://localhost:8000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "查询成都的天气"}' \
  --no-buffer
```

### 工具调用示例

Agent 支持以下工具:

1. **天气查询**: "查询北京天气"
2. **网络搜索**: "搜索最新的 AI 新闻"
3. **计算器**: "计算 123 * 456"

## 📚 文档

- [架构文档](./docs/ARCHITECTURE.md) - 详细的系统架构说明
- [LLM 配置](./docs/LLM_CONFIGURATION.md) - LLM 配置指南

## 🔒 安全说明

- ✅ 所有敏感信息都存储在 `.env` 文件中
- ✅ `.env` 已被 `.gitignore` 忽略
- ✅ 提供 `.env.example` 作为配置模板
- ⚠️ 永远不要将 API Key 提交到 Git

## 🛠️ 开发指南

### 添加新工具

在 `packages/agent/src/tools.py` 中添加新工具:

```python
from langchain_core.tools import tool

@tool
def my_tool(param: str) -> str:
    """工具描述"""
    # 实现逻辑
    return result
```

### 添加 A2UI 组件

1. 在 `packages/web/a2ui-components/` 创建组件
2. 在 `packages/web/lib/customCatalog.ts` 注册组件
3. 在 Agent 中返回符合 A2UI 0.8 协议的消息

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

## 📄 许可证

MIT License

## 🙏 致谢

- [LangGraph](https://langchain-ai.github.io/langgraph/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Next.js](https://nextjs.org/)
- [A2UI](https://github.com/anthropics/anthropic-sdk-typescript/tree/main/packages/a2ui-react-renderer)
- [Open-Meteo](https://open-meteo.com/)
