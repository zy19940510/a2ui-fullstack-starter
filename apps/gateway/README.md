# gateway

`gateway` 是 FastAPI 网关，负责：

- 接收前端请求
- 调用 `ai-agent` 流式事件
- 将 LangGraph 事件转换为前端可消费的 SSE 事件
- 在流结束时解析并下发 A2UI 消息

## 依赖安装

```bash
cd /Users/ethan/code/a2ui-test/apps/gateway
uv sync
```

## 启动

```bash
cd /Users/ethan/code/a2ui-test/apps/gateway
uv run uvicorn main:app --reload --port 8000
```

## API

- `GET /api/health`: 健康检查
- `POST /api/chat/stream`: SSE 流式聊天

## 快速测试

```bash
curl -X POST http://localhost:8000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"message": "查询上海天气"}' \
  --no-buffer
```

## 依赖关系

- 通过绝对路径导入 `apps/ai-agent/src`，不依赖当前工作目录。
- 如需使用组件文档工具，请确保 `packages/mcp/ComponentDoc` 已启动。
