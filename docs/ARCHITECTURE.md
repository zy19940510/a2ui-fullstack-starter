# A2UI-Test: SSE 流式渲染框架 MVP 设计文档

## 一、项目概述

### 1.1 目标

构建一个支持 SSE (Server-Sent Events) 流式渲染的全栈框架 MVP，实现：

- Agent 执行过程中的**工具调用**、**思考过程**、**输出消息**实时流式传输到前端
- 完整的端到端流式体验（类似 ChatGPT）

### 1.2 技术栈

| 层级       | 技术                  | 说明                   |
| ---------- | --------------------- | ---------------------- |
| 前端       | React + Next.js       | SSE 消费、流式 UI 渲染 |
| 中转微服务 | Python + FastAPI      | SSE 转发、协议转换     |
| Agent      | LangChain + LangGraph | 智能代理、工具调用     |

### 1.3 项目结构

```
~/code/a2ui-test/
├── README.md
├── docker-compose.yml
├── packages/
│   ├── agent/                 # LangGraph Agent
│   │   ├── pyproject.toml
│   │   ├── src/
│   │   │   ├── __init__.py
│   │   │   ├── agent.py       # Agent 定义
│   │   │   ├── tools.py       # 工具定义
│   │   │   ├── state.py       # 状态定义
│   │   │   └── streaming.py   # 流式事件处理
│   │   └── tests/
│   ├── gateway/               # FastAPI 中转服务
│   │   ├── pyproject.toml
│   │   ├── src/
│   │   │   ├── __init__.py
│   │   │   ├── main.py        # FastAPI 入口
│   │   │   ├── routes/
│   │   │   │   ├── chat.py    # SSE 聊天端点
│   │   │   │   └── health.py
│   │   │   ├── services/
│   │   │   │   └── agent_client.py  # Agent 调用
│   │   │   └── models/
│   │   │       └── events.py  # 事件模型
│   │   └── tests/
│   └── web/                   # Next.js 前端
│       ├── package.json
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx
│       │   │   └── api/       # (可选) BFF
│       │   ├── components/
│       │   │   ├── Chat.tsx
│       │   │   ├── MessageList.tsx
│       │   │   ├── StreamingMessage.tsx
│       │   │   └── ToolCallDisplay.tsx
│       │   ├── hooks/
│       │   │   └── useSSE.ts  # SSE Hook
│       │   └── types/
│       │       └── events.ts
│       └── tests/
```

---

## 二、核心架构图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Architecture Overview                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     HTTP/SSE      ┌──────────────┐    async call    ┌──────────────┐
│              │ ───────────────▶  │              │ ───────────────▶ │              │
│   Frontend   │                   │   Gateway    │                  │    Agent     │
│  (Next.js)   │ ◀─────────────── │  (FastAPI)   │ ◀─────────────── │ (LangGraph)  │
│              │   SSE Stream      │              │  astream_events  │              │
└──────────────┘                   └──────────────┘                  └──────────────┘
      │                                   │                                │
      │                                   │                                │
      ▼                                   ▼                                ▼
┌──────────────┐                  ┌──────────────┐                 ┌──────────────┐
│ EventSource  │                  │ EventSource  │                 │   Tools      │
│ API          │                  │ Response     │                 │   - search   │
│ useSSE hook  │                  │ sse-starlette│                 │   - calc     │
└──────────────┘                  └──────────────┘                 └──────────────┘
```

---

## 三、核心流程图

### 3.1 完整请求流程

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ Browser │                    │ Gateway │                    │  Agent  │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │  1. POST /chat/stream        │                              │
     │  { message: "..." }          │                              │
     │ ────────────────────────────▶│                              │
     │                              │                              │
     │  2. SSE Connection           │  3. agent.astream_events()   │
     │     Content-Type:            │ ────────────────────────────▶│
     │     text/event-stream        │                              │
     │ ◀────────────────────────────│                              │
     │                              │                              │
     │                              │  4. on_chain_start           │
     │                              │ ◀────────────────────────────│
     │  5. event: thinking          │                              │
     │     data: {"status":...}     │                              │
     │ ◀────────────────────────────│                              │
     │                              │                              │
     │                              │  6. on_tool_start            │
     │                              │ ◀────────────────────────────│
     │  7. event: tool_call         │                              │
     │     data: {"tool":...}       │                              │
     │ ◀────────────────────────────│                              │
     │                              │                              │
     │                              │  8. on_tool_end              │
     │                              │ ◀────────────────────────────│
     │  9. event: tool_result       │                              │
     │     data: {"result":...}     │                              │
     │ ◀────────────────────────────│                              │
     │                              │                              │
     │                              │  10. on_chat_model_stream    │
     │                              │ ◀────────────────────────────│
     │  11. event: message          │                              │
     │      data: {"chunk":"Hi"}    │                              │
     │ ◀────────────────────────────│                              │
     │                              │                              │
     │  12. event: done             │  13. on_chain_end            │
     │      data: {}                │ ◀────────────────────────────│
     │ ◀────────────────────────────│                              │
     │                              │                              │
     ▼                              ▼                              ▼
```

### 3.2 事件类型映射

| LangGraph 事件         | Gateway 转换  | 前端展示         |
| ---------------------- | ------------- | ---------------- |
| `on_chain_start`       | `thinking`    | 显示思考中...    |
| `on_tool_start`        | `tool_call`   | 显示工具调用卡片 |
| `on_tool_end`          | `tool_result` | 显示工具结果     |
| `on_chat_model_stream` | `message`     | 流式显示文本     |
| `on_chain_end`         | `done`        | 完成标记         |

---

## 四、关键设计决策

### 4.1 为什么选择 SSE 而不是 WebSocket？

| 维度       | SSE                   | WebSocket    |
| ---------- | --------------------- | ------------ |
| 复杂度     | 简单，基于 HTTP       | 需要握手协议 |
| 单向/双向  | 单向（服务器→客户端） | 双向         |
| 自动重连   | 浏览器原生支持        | 需手动实现   |
| 适用场景   | 流式输出（LLM）       | 实时聊天     |
| 本项目需求 | 足够                  | 过度设计     |

**决策：SSE 更适合 Agent 输出流式传输场景**

### 4.2 为什么需要 Gateway 中转层？

```
                    ❌ 直连方案（不推荐）
┌──────────┐                           ┌──────────┐
│ Frontend │ ─────── 直接调用 ────────▶ │  Agent   │
└──────────┘                           └──────────┘
问题：
- 前端暴露 LLM API Key
- 无法统一处理认证/限流
- Agent 变更影响前端

                    ✅ Gateway 方案（推荐）
┌──────────┐       ┌──────────┐       ┌──────────┐
│ Frontend │ ────▶ │ Gateway  │ ────▶ │  Agent   │
└──────────┘       └──────────┘       └──────────┘
优势：
- API Key 安全存储在后端
- 统一认证、限流、日志
- 协议转换和事件标准化
- 可扩展多个 Agent
```

### 4.3 LangGraph `astream_events` vs `astream`

| 方法               | 输出内容       | 适用场景                   |
| ------------------ | -------------- | -------------------------- |
| `astream()`        | 最终状态 delta | 只需要结果                 |
| `astream_events()` | 所有中间事件   | **需要工具调用、思考过程** |

**决策：使用 `astream_events(version="v2")` 获取完整执行过程**

### 4.4 SSE 事件格式设计

```typescript
// 统一事件格式
interface SSEEvent {
  event: 'thinking' | 'tool_call' | 'tool_result' | 'message' | 'error' | 'done';
  data: {
    id: string;           // 事件唯一 ID
    timestamp: number;    // 时间戳
    content: any;         // 事件内容
  };
}

// 示例
event: tool_call
data: {"id":"tc_1","timestamp":1706000000,"content":{"name":"search","args":{"query":"天气"}}}

event: message
data: {"id":"msg_1","timestamp":1706000001,"content":{"chunk":"今天"}}
```

---

## 五、API 设计文档

### 5.1 Gateway API

#### POST /api/chat/stream

发起流式对话请求，返回 SSE 流。

**Request:**

```typescript
POST /api/chat/stream
Content-Type: application/json

{
  "message": string,           // 用户消息
  "conversation_id"?: string,  // 会话 ID（可选）
  "model"?: string             // 模型选择（可选）
}
```

**Response (SSE Stream):**

```
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

event: thinking
data: {"id":"t1","timestamp":1706000000,"content":{"status":"processing"}}

event: tool_call
data: {"id":"tc1","timestamp":1706000001,"content":{"name":"search","args":{"q":"weather"}}}

event: tool_result
data: {"id":"tr1","timestamp":1706000002,"content":{"result":"Sunny, 25°C"}}

event: message
data: {"id":"m1","timestamp":1706000003,"content":{"chunk":"Based on"}}

event: message
data: {"id":"m2","timestamp":1706000004,"content":{"chunk":" my search"}}

event: done
data: {"id":"d1","timestamp":1706000005,"content":{}}
```

#### GET /api/health

健康检查端点。

**Response:**

```json
{
  "status": "healthy",
  "version": "0.1.0",
  "agent_status": "connected"
}
```

### 5.2 Agent 内部接口

```python
# Agent 调用签名
async def run_agent(
    message: str,
    conversation_id: str | None = None
) -> AsyncIterator[StreamEvent]:
    """
    运行 Agent 并流式返回事件

    Yields:
        StreamEvent: 包含 event_type 和 data 的事件对象
    """
```

---

## 六、实现步骤详解

### 阶段一：项目初始化 (30 分钟)

```bash
# 1. 创建项目目录
mkdir -p ~/code/a2ui-test/packages/{agent,gateway,web}
cd ~/code/a2ui-test

# 2. 初始化 Agent (Python)
cd packages/agent
uv init --name a2ui-agent
uv add langchain langgraph langchain-openai python-dotenv

# 3. 初始化 Gateway (Python)
cd ../gateway
uv init --name a2ui-gateway
uv add fastapi uvicorn sse-starlette pydantic python-dotenv

# 4. 初始化 Web (Next.js)
cd ../web
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir
npm install
```

### 阶段二：Agent 核心实现 (45 分钟)

**文件：`packages/agent/src/agent.py`**

```python
from typing import Annotated, AsyncIterator
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from typing_extensions import TypedDict

from .tools import get_tools

class State(TypedDict):
    messages: Annotated[list, add_messages]

def create_agent():
    """创建 LangGraph Agent"""
    llm = ChatOpenAI(model="gpt-4o-mini", streaming=True)
    tools = get_tools()
    llm_with_tools = llm.bind_tools(tools)

    def call_model(state: State):
        response = llm_with_tools.invoke(state["messages"])
        return {"messages": [response]}

    def should_continue(state: State):
        last_message = state["messages"][-1]
        if last_message.tool_calls:
            return "tools"
        return END

    # 构建图
    graph = StateGraph(State)
    graph.add_node("agent", call_model)
    graph.add_node("tools", ToolNode(tools))

    graph.add_edge(START, "agent")
    graph.add_conditional_edges("agent", should_continue)
    graph.add_edge("tools", "agent")

    return graph.compile()

async def run_agent_stream(
    message: str,
    conversation_id: str | None = None
) -> AsyncIterator[dict]:
    """流式运行 Agent"""
    agent = create_agent()

    async for event in agent.astream_events(
        {"messages": [{"role": "user", "content": message}]},
        version="v2"
    ):
        yield event
```

**文件：`packages/agent/src/tools.py`**

```python
from langchain_core.tools import tool

@tool
def search(query: str) -> str:
    """搜索互联网获取信息"""
    # MVP: 模拟搜索结果
    return f"搜索结果: 关于 '{query}' 的信息..."

@tool
def calculator(expression: str) -> str:
    """计算数学表达式"""
    try:
        result = eval(expression)  # MVP 简化，生产环境需安全处理
        return str(result)
    except Exception as e:
        return f"计算错误: {e}"

def get_tools():
    return [search, calculator]
```

### 阶段三：Gateway 中转服务 (45 分钟)

**文件：`packages/gateway/src/main.py`**

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import chat, health

app = FastAPI(title="A2UI Gateway", version="0.1.0")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, prefix="/api")
app.include_router(chat.router, prefix="/api/chat")
```

**文件：`packages/gateway/src/routes/chat.py`**

```python
import json
import asyncio
from fastapi import APIRouter, Request
from pydantic import BaseModel
from sse_starlette import EventSourceResponse

# 假设 agent 作为模块导入
import sys
sys.path.insert(0, "../../agent/src")
from agent import run_agent_stream

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None

@router.post("/stream")
async def chat_stream(request: ChatRequest, req: Request):
    """SSE 流式聊天端点"""

    async def event_generator():
        try:
            async for event in run_agent_stream(
                request.message,
                request.conversation_id
            ):
                # 转换 LangGraph 事件为标准格式
                sse_event = transform_event(event)
                if sse_event:
                    yield {
                        "event": sse_event["event"],
                        "data": json.dumps(sse_event["data"])
                    }

            # 发送完成事件
            yield {
                "event": "done",
                "data": json.dumps({"id": "done", "content": {}})
            }
        except asyncio.CancelledError:
            # 客户端断开连接
            pass
        except Exception as e:
            yield {
                "event": "error",
                "data": json.dumps({"error": str(e)})
            }

    return EventSourceResponse(event_generator())

def transform_event(event: dict) -> dict | None:
    """转换 LangGraph 事件为前端格式"""
    event_type = event.get("event")

    if event_type == "on_chain_start":
        return {
            "event": "thinking",
            "data": {"id": event["run_id"], "content": {"status": "thinking"}}
        }
    elif event_type == "on_tool_start":
        return {
            "event": "tool_call",
            "data": {
                "id": event["run_id"],
                "content": {
                    "name": event["name"],
                    "args": event.get("data", {}).get("input", {})
                }
            }
        }
    elif event_type == "on_tool_end":
        return {
            "event": "tool_result",
            "data": {
                "id": event["run_id"],
                "content": {"result": event.get("data", {}).get("output", "")}
            }
        }
    elif event_type == "on_chat_model_stream":
        chunk = event.get("data", {}).get("chunk")
        if chunk and hasattr(chunk, "content") and chunk.content:
            return {
                "event": "message",
                "data": {"id": event["run_id"], "content": {"chunk": chunk.content}}
            }

    return None
```

**文件：`packages/gateway/src/routes/health.py`**

```python
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "0.1.0",
        "agent_status": "connected"
    }
```

### 阶段四：前端实现 (60 分钟)

**文件：`packages/web/src/hooks/useSSE.ts`**

```typescript
import { useState, useCallback, useRef } from "react";

export interface SSEEvent {
  event:
    | "thinking"
    | "tool_call"
    | "tool_result"
    | "message"
    | "error"
    | "done";
  data: {
    id: string;
    content: any;
  };
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: Array<{
    name: string;
    args: any;
    result?: string;
  }>;
  isStreaming?: boolean;
}

export function useSSE(apiUrl: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentThinking, setCurrentThinking] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (message: string) => {
      // 添加用户消息
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      // 创建助手消息占位
      const assistantId = `assistant-${Date.now()}`;
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        toolCalls: [],
        isStreaming: true,
      };
      setMessages((prev) => [...prev, assistantMessage]);

      try {
        abortControllerRef.current = new AbortController();

        const response = await fetch(`${apiUrl}/api/chat/stream`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
          signal: abortControllerRef.current.signal,
        });

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          let currentEventType = "message";
          for (const line of lines) {
            if (line.startsWith("event:")) {
              currentEventType = line.slice(6).trim();
              continue;
            }
            if (line.startsWith("data:")) {
              try {
                const data = JSON.parse(line.slice(5).trim());
                handleSSEEvent({
                  event: currentEventType as SSEEvent["event"],
                  data,
                });
              } catch (e) {
                // ignore parse errors
              }
            }
          }
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("SSE Error:", error);
        }
      } finally {
        setIsLoading(false);
        setCurrentThinking(null);
        // 标记流式完成
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m,
          ),
        );
      }

      function handleSSEEvent(event: SSEEvent) {
        switch (event.event) {
          case "thinking":
            setCurrentThinking("思考中...");
            break;
          case "tool_call":
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id === assistantId) {
                  return {
                    ...m,
                    toolCalls: [
                      ...(m.toolCalls || []),
                      {
                        name: event.data.content.name,
                        args: event.data.content.args,
                      },
                    ],
                  };
                }
                return m;
              }),
            );
            setCurrentThinking(`调用工具: ${event.data.content.name}`);
            break;
          case "tool_result":
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id === assistantId && m.toolCalls?.length) {
                  const toolCalls = [...m.toolCalls];
                  toolCalls[toolCalls.length - 1].result =
                    event.data.content.result;
                  return { ...m, toolCalls };
                }
                return m;
              }),
            );
            setCurrentThinking(null);
            break;
          case "message":
            setMessages((prev) =>
              prev.map((m) => {
                if (m.id === assistantId) {
                  return {
                    ...m,
                    content: m.content + event.data.content.chunk,
                  };
                }
                return m;
              }),
            );
            setCurrentThinking(null);
            break;
          case "done":
            setIsLoading(false);
            break;
        }
      }
    },
    [apiUrl],
  );

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  return { messages, isLoading, currentThinking, sendMessage, stop };
}
```

**文件：`packages/web/src/app/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useSSE } from "@/hooks/useSSE";

export default function Home() {
  const [input, setInput] = useState("");
  const { messages, isLoading, currentThinking, sendMessage, stop } = useSSE(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  return (
    <main className="flex flex-col h-screen max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">A2UI Chat</h1>

      {/* 消息列表 */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-4 rounded-lg ${
              msg.role === "user" ? "bg-blue-100 ml-8" : "bg-gray-100 mr-8"
            }`}
          >
            <div className="font-semibold mb-1">
              {msg.role === "user" ? "你" : "AI"}
            </div>

            {/* 工具调用展示 */}
            {msg.toolCalls?.map((tool, i) => (
              <div
                key={i}
                className="my-2 p-2 bg-yellow-50 rounded border border-yellow-200"
              >
                <div className="text-sm font-medium">🔧 {tool.name}</div>
                <div className="text-xs text-gray-500">
                  参数: {JSON.stringify(tool.args)}
                </div>
                {tool.result && (
                  <div className="text-sm mt-1">结果: {tool.result}</div>
                )}
              </div>
            ))}

            {/* 消息内容 */}
            <div className="whitespace-pre-wrap">
              {msg.content}
              {msg.isStreaming && <span className="animate-pulse">▌</span>}
            </div>
          </div>
        ))}

        {/* 思考状态 */}
        {currentThinking && (
          <div className="text-gray-500 italic">{currentThinking}</div>
        )}
      </div>

      {/* 输入框 */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入消息..."
          className="flex-1 p-2 border rounded-lg"
          disabled={isLoading}
        />
        {isLoading ? (
          <button
            type="button"
            onClick={stop}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            停止
          </button>
        ) : (
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            发送
          </button>
        )}
      </form>
    </main>
  );
}
```

---

## 七、运行与测试

### 7.1 启动服务

```bash
# Terminal 1: 启动 Agent + Gateway
cd ~/code/a2ui-test/packages/gateway
OPENAI_API_KEY=sk-xxx uvicorn src.main:app --reload --port 8000

# Terminal 2: 启动前端
cd ~/code/a2ui-test/packages/web
npm run dev
```

### 7.2 测试流程

1. 打开 `http://localhost:3000`
2. 输入 "帮我搜索今天的天气，然后计算 123 \* 456"
3. 观察：
   - 显示"思考中..."
   - 显示工具调用卡片 (search, calculator)
   - 流式显示最终回答

---

## 八、面试 Coding 要点

### 8.1 时间分配 (2小时)

| 阶段     | 时间   | 内容                 |
| -------- | ------ | -------------------- |
| 项目搭建 | 10 min | 目录结构、依赖安装   |
| Agent    | 30 min | LangGraph + 工具定义 |
| Gateway  | 30 min | FastAPI + SSE        |
| 前端     | 40 min | useSSE hook + UI     |
| 联调     | 10 min | 端到端测试           |

### 8.2 核心代码记忆点

```python
# 1. LangGraph 流式事件
async for event in agent.astream_events(input, version="v2"):
    if event["event"] == "on_chat_model_stream":
        yield event["data"]["chunk"].content

# 2. FastAPI SSE
from sse_starlette import EventSourceResponse
return EventSourceResponse(async_generator())

# 3. React SSE 消费
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  // 解析 SSE 格式
}
```

### 8.3 常见问题应对

| 问题                  | 回答要点                                     |
| --------------------- | -------------------------------------------- |
| 为什么用 SSE 不用 WS? | 单向推送足够，SSE 更简单，原生重连           |
| 如何处理断连?         | EventSource 自动重连，或手动 AbortController |
| 如何扩展多 Agent?     | Gateway 路由分发，Agent 注册机制             |
| 生产环境考虑?         | 认证、限流、持久化、监控                     |

---

## 九、下一步扩展

1. **会话持久化**: Redis 存储历史
2. **认证鉴权**: JWT Token
3. **多模型支持**: 模型路由
4. **RAG 集成**: 知识库检索
5. **容器化**: Docker Compose

---

## 十、参考资源

- [LangGraph Streaming Docs](https://langchain-ai.github.io/langgraph/how-tos/streaming-tokens/)
- [FastAPI StreamingResponse](https://fastapi.tiangolo.com/advanced/custom-response/)
- [sse-starlette](https://github.com/sysid/sse-starlette)
- [MDN EventSource](https://developer.mozilla.org/en-US/docs/Web/API/EventSource)
