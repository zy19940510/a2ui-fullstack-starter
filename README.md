# 快速启动指南

## 方式一：使用启动脚本（推荐）

```bash
# 在项目根目录运行
./start-gateway.sh
```

## 方式二：手动启动

### 1. 启动 Gateway

```bash
cd packages/gateway
.venv/bin/uvicorn src.main:app --reload --port 8000
```

Gateway 会自动导入并使用 agent（无需单独启动 agent）。

### 2. 启动前端（可选）

```bash
cd packages/web
npm run dev
```

## 验证服务

启动成功后，访问：

- **健康检查**: http://localhost:8000/api/health
- **API 文档**: http://localhost:8000/docs
- **SSE 测试**: POST http://localhost:8000/api/chat/stream

## 测试 SSE 流式聊天

使用 curl 测试：

```bash
curl -X POST http://localhost:8000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "你好"}' \
  --no-buffer
```

应该看到类似输出：

```
event: thinking
data: {"id":"xxx","content":{"status":"thinking"}}

event: message
data: {"id":"xxx","content":{"chunk":"你好"}}

event: done
data: {"id":"done","content":{}}
```

## Agent 配置

Agent 已配置为使用 **LB One API**：

- Model: `claude-sonnet-4-5-20250929`
- Base URL: `https://lboneapi.longbridge-inc.com/v1`
- API Key: 已在代码中配置

如需修改配置，编辑 `packages/agent/src/agent.py` 的 `create_agent()` 函数。

## 常见问题

### Q: Gateway 启动报错找不到 agent 模块

A: 确保项目结构正确：
```
packages/
  ├── agent/src/agent.py
  └── gateway/src/routes/chat.py
```

### Q: 如何查看日志？

A: uvicorn 会输出到控制台，添加 `--log-level debug` 查看详细日志：

```bash
.venv/bin/uvicorn src.main:app --reload --port 8000 --log-level debug
```

### Q: Agent 无法调用 LB One API？

A: 检查 `packages/agent/src/agent.py` 中的 API key 是否正确。
