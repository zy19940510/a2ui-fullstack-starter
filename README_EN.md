# A2UI Test - AI Agent Chat Application

English | [简体中文](./README.md)

A complete AI Agent chat application with streaming output, tool calling, and custom UI components, built with LangGraph, FastAPI, and Next.js.

## ✨ Features

- 🚀 **Streaming Output**: Real-time responses using SSE (Server-Sent Events)
- 🛠️ **Tool Calling**: Integrated weather query, web search, calculator, and more
- 🎨 **A2UI Components**: Custom component system based on A2UI 0.8 protocol
- 🌍 **Real-time Weather**: Integrated with Open-Meteo API, free and no API key required
- 🌙 **Dark Mode**: Complete theme switching support
- 🔐 **Secure Configuration**: Environment variable management for sensitive information

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 + React + Tailwind CSS
- **Gateway**: Python + FastAPI
- **Agent**: LangGraph + LangChain
- **LLM**: Claude Sonnet 4.5 (supports Anthropic API / OpenAI-compatible API)
- **Weather API**: Open-Meteo (free, open-source)
- **Search API**: DuckDuckGo

## 📁 Project Structure

```
a2ui-test/
├── packages/
│   ├── agent/          # LangGraph Agent
│   ├── gateway/        # FastAPI Gateway
│   └── web/            # Next.js Frontend
└── docs/
    ├── ARCHITECTURE.md      # Architecture Documentation
    └── LLM_CONFIGURATION.md # LLM Configuration Guide
```

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Clone the project
git clone https://github.com/yourusername/a2ui-test.git
cd a2ui-test

# Install Python dependencies
cd packages/agent && uv sync
cd ../gateway && uv sync

# Install frontend dependencies
cd ../web
npm install  # or bun install
```

### 2. Configure Environment Variables

```bash
# Copy environment template
cp packages/agent/.env.example packages/agent/.env

# Edit .env file and fill in your API Key
# Using Anthropic API (recommended):
# OPENAI_API_KEY=your-anthropic-api-key
# OPENAI_BASE_URL=https://api.anthropic.com/v1
# MODEL_NAME=claude-sonnet-4-5-20250929
```

See [LLM Configuration Guide](./docs/LLM_CONFIGURATION.md) for detailed configuration instructions.

### 3. Start Services

**Terminal 1 - Start Gateway:**

```bash
cd packages/gateway
uv run uvicorn main:app --reload --port 8000
```

**Terminal 2 - Start Frontend:**

```bash
cd packages/web
npm run dev
```

### 4. Access Application

- Chat Page: http://localhost:3000
- Weather Component Demo: http://localhost:3000/weather
- API Health Check: http://localhost:8000/api/health
- API Documentation: http://localhost:8000/docs

## 💡 Usage Examples

### Test SSE Streaming Chat

Test the API using curl:

```bash
curl -X POST http://localhost:8000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the weather in Beijing?"}' \
  --no-buffer
```

### Tool Calling Examples

The Agent supports the following tools:

1. **Weather Query**: "What's the weather in Beijing?"
2. **Web Search**: "Search for latest AI news"
3. **Calculator**: "Calculate 123 * 456"

## 📚 Documentation

- [Architecture Documentation](./docs/ARCHITECTURE.md) - Detailed system architecture
- [LLM Configuration](./docs/LLM_CONFIGURATION.md) - LLM configuration guide

## 🔒 Security Notes

- ✅ All sensitive information is stored in `.env` files
- ✅ `.env` is ignored by `.gitignore`
- ✅ `.env.example` provided as configuration template
- ⚠️ Never commit API Keys to Git

## 🛠️ Development Guide

### Adding New Tools

Add new tools in `packages/agent/src/tools.py`:

```python
from langchain_core.tools import tool

@tool
def my_tool(param: str) -> str:
    """Tool description"""
    # Implementation logic
    return result
```

### Adding A2UI Components

1. Create component in `packages/web/a2ui-components/`
2. Register component in `packages/web/lib/customCatalog.ts`
3. Return A2UI 0.8 protocol-compliant messages from Agent

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📄 License

MIT License

## 🙏 Acknowledgments

- [LangGraph](https://langchain-ai.github.io/langgraph/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Next.js](https://nextjs.org/)
- [A2UI](https://github.com/anthropics/anthropic-sdk-typescript/tree/main/packages/a2ui-react-renderer)
- [Open-Meteo](https://open-meteo.com/)
