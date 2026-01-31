# A2UI-Test: 架构文档

## 一、项目概述

### 1.1 目标

构建一个完整的 AI Agent 聊天应用，支持：

- **流式输出**：SSE (Server-Sent Events) 实时传输
- **工具调用**：天气查询、网络搜索、计算器等
- **A2UI 组件**：基于 A2UI 0.8 协议的自定义组件系统
- **实时天气展示**：集成 Open-Meteo API
- **黑暗模式**：完整的主题切换支持

### 1.2 技术栈

| 层级       | 技术                     | 说明                          |
| ---------- | ------------------------ | ----------------------------- |
| 前端       | Next.js 15 + React       | App Router, Tailwind CSS      |
| 中转网关   | Python + FastAPI         | SSE 转发、协议转换            |
| Agent      | LangGraph + LangChain    | 智能代理、工具调用            |
| UI 组件    | A2UI 0.8                 | 自定义组件系统（天气组件等）  |
| LLM        | Claude Sonnet 4.5        | 通过 Anthropic API / OpenAI-compatible API |
| 天气 API   | Open-Meteo               | 免费、无需 API Key            |
| 搜索 API   | DuckDuckGo (ddgs)        | 免费网络搜索                  |

### 1.3 项目结构

```
a2ui-test/
├── packages/
│   ├── agent/                    # LangGraph Agent
│   │   ├── src/
│   │   │   ├── agent.py          # Agent 核心逻辑
│   │   │   └── tools.py          # 工具定义（天气、搜索、计算器）
│   │   ├── .env                  # 环境变量（已忽略）
│   │   ├── .env.example          # 环境变量模板
│   │   └── pyproject.toml
│   │
│   ├── gateway/                  # FastAPI 网关
│   │   ├── src/
│   │   │   ├── main.py           # FastAPI 入口
│   │   │   └── routes/
│   │   │       ├── chat.py       # SSE 流式聊天端点
│   │   │       └── health.py     # 健康检查
│   │   └── pyproject.toml
│   │
│   └── web/                      # Next.js 前端
│       ├── app/
│       │   ├── page.tsx          # 聊天主页
│       │   ├── weather/
│       │   │   └── page.tsx      # 天气组件演示页
│       │   ├── layout.tsx        # 全局布局（主题切换）
│       │   └── providers.tsx     # A2UI Provider
│       ├── hooks/
│       │   └── useSSE.ts         # SSE 消费 Hook
│       ├── a2ui-components/
│       │   └── weather/          # 天气组件
│       │       ├── weather.client.tsx
│       │       ├── weather-data.ts
│       │       └── weather-types.ts
│       └── lib/
│           ├── customCatalog.ts  # A2UI 组件注册
│           └── weather-messages.ts  # 天气数据逻辑
│
└── docs/
    ├── ARCHITECTURE.md           # 本文档
    └── LLM_CONFIGURATION.md      # LLM 配置说明
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
└──────┬───────┘                   └──────────────┘                  └──────┬───────┘
       │                                                                     │
       │                                                                     │
       ▼                                                                     ▼
┌──────────────┐                                                     ┌──────────────┐
│ A2UI 组件    │                                                     │   Tools      │
│ - Weather    │                                                     │ - web_search │
│ - Custom UI  │                                                     │ - get_weather│
└──────────────┘                                                     │ - calculator │
                                                                     └──────────────┘
                                                                            │
                                                                            ▼
                                                                     ┌──────────────┐
                                                                     │  External    │
                                                                     │  APIs        │
                                                                     │ - Open-Meteo │
                                                                     │ - DuckDuckGo │
                                                                     └──────────────┘
```

---

## 三、核心流程

### 3.1 聊天流程（SSE）

```
┌─────────┐                    ┌─────────┐                    ┌─────────┐
│ Browser │                    │ Gateway │                    │  Agent  │
└────┬────┘                    └────┬────┘                    └────┬────┘
     │                              │                              │
     │  1. POST /api/chat/stream    │                              │
     │  { message: "查询成都天气" } │                              │
     │ ────────────────────────────▶│                              │
     │                              │                              │
     │  2. SSE Connection           │  3. agent.astream_events()   │
     │     Content-Type:            │ ────────────────────────────▶│
     │     text/event-stream        │                              │
     │ ◀────────────────────────────│                              │
     │                              │                              │
     │                              │  4. on_chat_model_start      │
     │                              │ ◀────────────────────────────│
     │  5. event: processing        │                              │
     │     data: {...}              │                              │
     │ ◀────────────────────────────│                              │
     │                              │                              │
     │                              │  6. on_tool_start            │
     │                              │ ◀────────────────────────────│
     │  7. event: tool_call         │                              │
     │     data: {name:"get_weather"}│                             │
     │ ◀────────────────────────────│                              │
     │                              │                              │
     │                              │  8. Tool execution           │
     │                              │     (Open-Meteo API)         │
     │                              │ ────────────────────────────▶│
     │                              │                              │
     │                              │  9. on_tool_end              │
     │                              │ ◀────────────────────────────│
     │  10. event: tool_result      │                              │
     │      data: {result:"12°C"}   │                              │
     │ ◀────────────────────────────│                              │
     │                              │                              │
     │                              │  11. on_chat_model_stream    │
     │                              │ ◀────────────────────────────│
     │  12. event: message          │                              │
     │      data: {chunk:"成都"}    │                              │
     │ ◀────────────────────────────│                              │
     │                              │                              │
     │  13. event: done             │  14. on_chain_end            │
     │      data: {}                │ ◀────────────────────────────│
     │ ◀────────────────────────────│                              │
     │                              │                              │
     ▼                              ▼                              ▼
```

### 3.2 事件类型映射

| LangGraph 事件         | Gateway 转换  | 前端展示                    |
| ---------------------- | ------------- | --------------------------- |
| `on_chat_model_start`  | `processing`  | 显示光标动画（● ● ●）      |
| `on_tool_start`        | `tool_call`   | 显示工具卡片 + ⏳ 运行中   |
| `on_tool_end`          | `tool_result` | 更新工具结果 + ✓ 完成      |
| `on_chat_model_stream` | `message`     | 流式显示文本 + 光标         |
| `on_chain_end`         | `done`        | 结束标记                    |

---

## 四、关键组件详解

### 4.1 Agent (LangGraph)

**核心代码：** `packages/agent/src/agent.py`

```python
def create_agent():
    # 从环境变量加载 LLM 配置
    llm = ChatOpenAI(
        model=os.getenv("MODEL_NAME", "claude-sonnet-4-5-20250929"),
        base_url=os.getenv("OPENAI_BASE_URL"),
        api_key=os.getenv("OPENAI_API_KEY"),
        temperature=0.7,
        streaming=True
    )

    # 绑定工具
    tools = get_tools()  # [web_search, calculator, get_weather]
    llm_with_tools = llm.bind_tools(tools)

    # 构建 LangGraph
    graph = StateGraph(State)
    graph.add_node("agent", call_model)
    graph.add_node("tools", ToolNode(tools))

    graph.add_edge(START, "agent")
    graph.add_conditional_edges("agent", should_continue)
    graph.add_edge("tools", "agent")

    return graph.compile()
```

**工具列表：**

1. **web_search**: 使用 DuckDuckGo 搜索
2. **get_weather**: 调用 Open-Meteo API 获取天气
3. **calculator**: 安全的数学表达式计算

### 4.2 Gateway (FastAPI)

**核心代码：** `packages/gateway/src/routes/chat.py`

```python
@router.post("/stream")
async def chat_stream(request: ChatRequest, req: Request):
    async def event_generator():
        processing_sent = False
        async for event in run_agent_stream(request.message):
            sse_event = transform_event(event, processing_sent)
            if sse_event:
                if sse_event["event"] == "processing":
                    processing_sent = True
                yield {
                    "event": sse_event["event"],
                    "data": json.dumps(sse_event["data"])
                }
        yield {"event": "done", "data": json.dumps({})}

    return EventSourceResponse(event_generator())
```

**关键优化：**
- 使用 `processing_sent` 标志位避免重复发送 processing 事件
- 过滤掉 "..." 占位符（Claude 工具调用前的输出）
- 处理客户端断开（CancelledError）

### 4.3 前端 (Next.js + A2UI)

**SSE 消费：** `packages/web/hooks/useSSE.ts`

```typescript
// 关键特性：
- 状态管理：isProcessing, isRunning, toolCalls
- 流式更新：逐字追加消息内容
- 工具展示：动态显示工具调用状态
- 错误处理：自动重连和异常捕获
```

**UI 展示：** `packages/web/app/page.tsx`

```tsx
// 工具调用卡片
- 蓝色渐变背景
- 运行中：⏳ 旋转动画 + "运行中"
- 完成：✓ 绿色徽章
- 参数：key-value 格式展示
- 结果：白色卡片 + 圆角

// Loading 状态
- processing：三个蓝色跳动点（● ● ●）
- streaming：光标动画（▌）
```

### 4.4 A2UI 天气组件

**组件注册：** `packages/web/lib/customCatalog.ts`

```typescript
export const APP_NAMESPACE = 'a2ui-test'

export const customCatalog = {
  namespace: APP_NAMESPACE,
  components: {
    Weather: WeatherComponent,
  },
}
```

**数据流：**

```
页面加载 → fetchWeatherData(上海)
         → Open-Meteo API
         → getWeatherFromCode(weatherCode)
         → 创建 A2UI 消息
         → 渲染天气组件

用户点击刷新 → handleUserAction
            → fetchWeatherData(当前城市)
            → processor.processMessages
            → 更新组件数据
```

**天气代码映射：**
- 使用 `getWeatherFromCode()` 映射 0-99 天气代码
- 返回图标、condition、中文描述
- 示例：代码 2 → ⛅ "局部多云"

---

## 五、关键设计决策

### 5.1 为什么使用 SSE？

| 维度       | SSE                   | WebSocket    |
| ---------- | --------------------- | ------------ |
| 复杂度     | 简单，基于 HTTP       | 需要握手协议 |
| 单向/双向  | 单向（服务器→客户端） | 双向         |
| 自动重连   | 浏览器原生支持        | 需手动实现   |
| 适用场景   | LLM 流式输出          | 实时聊天     |
| 本项目需求 | ✅ 足够               | ⚠️ 过度设计  |

### 5.2 为什么需要 Gateway？

```
✅ Gateway 方案（当前实现）
┌──────────┐       ┌──────────┐       ┌──────────┐
│ Frontend │ ────▶ │ Gateway  │ ────▶ │  Agent   │
└──────────┘       └──────────┘       └──────────┘

优势：
✓ API Key 安全存储在后端 .env
✓ 统一事件格式转换（processing, tool_call 等）
✓ 可扩展：支持多 Agent、认证、限流
✓ 协议隔离：前端不感知 LangGraph 内部事件
```

### 5.3 环境变量管理

**安全实践：**
- ✅ `.env` 文件存储敏感信息（已加入 .gitignore）
- ✅ `.env.example` 提供配置模板
- ✅ 使用 `python-dotenv` 加载环境变量
- ✅ 从 git 历史中删除暴露的 key

**配置文件：**
```bash
# packages/agent/.env
OPENAI_API_KEY=sk-your-actual-key
OPENAI_BASE_URL=https://lboneapi.longbridge-inc.com/v1
MODEL_NAME=claude-sonnet-4-5-20250929
```

### 5.4 天气数据集成

**为什么选择 Open-Meteo？**
- ✅ 完全免费、开源
- ✅ 无需 API Key
- ✅ 全球覆盖
- ✅ 返回标准天气代码（WMO）

**数据流：**
```
用户请求 → Agent 工具调用
        → httpx.get(Open-Meteo API)
        → 解析 weathercode
        → 映射为中文描述
        → 返回格式化结果
```

---

## 六、运行指南

### 6.1 环境准备

```bash
# 1. 安装 Python 依赖（agent + gateway）
cd packages/agent && uv sync
cd ../gateway && uv sync

# 2. 配置环境变量
cp packages/agent/.env.example packages/agent/.env
# 编辑 .env，填入你的 API Key

# 3. 安装前端依赖
cd packages/web
npm install  # 或 bun install
```

### 6.2 启动服务

```bash
# Terminal 1: 启动 Gateway
cd packages/gateway
uv run uvicorn main:app --reload --port 8000

# Terminal 2: 启动前端
cd packages/web
npm run dev
```

### 6.3 访问地址

- **聊天页面**: http://localhost:3000
- **天气组件**: http://localhost:3000/weather
- **API 健康检查**: http://localhost:8000/api/health

---

## 七、技术亮点

### 7.1 流式体验优化

1. **渐进式加载**：
   - processing → tool_call → tool_result → message
   - 每个阶段都有可视化反馈

2. **状态管理**：
   - `isProcessing`: 显示光标动画
   - `isRunning`: 工具运行中状态
   - `isStreaming`: 消息流式输出

3. **错误处理**：
   - AbortController 支持取消
   - 自动清理状态
   - 异常捕获和降级

### 7.2 A2UI 组件系统

1. **协议版本**: A2UI 0.8
2. **消息类型**:
   - `surfaceUpdate`: 定义组件树
   - `dataModelUpdate`: 更新数据
   - `beginRendering`: 开始渲染
3. **用户交互**:
   - `userAction`: 刷新、切换城市
   - 异步数据更新

### 7.3 黑暗模式支持

- 使用 `next-themes` 实现主题切换
- 所有组件适配 `dark:` 类名
- 自动保存用户偏好

---

## 八、扩展方向

### 8.1 短期优化

- [ ] 添加会话历史（LocalStorage）
- [ ] 支持更多城市天气查询
- [ ] 工具调用结果缓存
- [ ] 添加错误重试机制

### 8.2 中期规划

- [ ] 集成 RAG（知识库检索）
- [ ] 多模型切换支持
- [ ] 用户认证系统
- [ ] 对话持久化（数据库）

### 8.3 长期愿景

- [ ] 多 Agent 协作
- [ ] 自定义工具插件系统
- [ ] 移动端适配
- [ ] Docker 容器化部署

---

## 九、参考资源

- [LangGraph 文档](https://langchain-ai.github.io/langgraph/)
- [FastAPI SSE](https://fastapi.tiangolo.com/)
- [A2UI 0.8 规范](https://github.com/anthropics/anthropic-sdk-typescript/tree/main/packages/a2ui-react-renderer)
- [Open-Meteo API](https://open-meteo.com/)
- [DuckDuckGo Search](https://github.com/deedy5/ddgs)
