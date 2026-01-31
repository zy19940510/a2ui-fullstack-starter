import json
import asyncio
from fastapi import APIRouter, Request
from pydantic import BaseModel
from sse_starlette import EventSourceResponse

import sys
sys.path.insert(0, "../../packages/agent/src")
from agent import run_agent_stream

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None

@router.post("/stream")
async def chat_stream(request: ChatRequest, req: Request):
    """SSE 流式聊天端点"""

    async def event_generator():
        processing_sent = False  # 跟踪是否已发送 processing
        try:
            async for event in run_agent_stream(
                request.message,
                request.conversation_id
            ):
                sse_event = transform_event(event, processing_sent)
                if sse_event:
                    # 如果是 processing 事件，标记已发送
                    if sse_event["event"] == "processing":
                        processing_sent = True
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

def transform_event(event: dict, processing_sent: bool = False) -> dict | None:
    """转换 LangGraph 事件为前端格式"""
    event_type = event.get("event")

    # 只在第一次模型开始时发送 processing (前端显示 loading)
    if event_type == "on_chat_model_start":
        if not processing_sent:
            return {
                "event": "processing",
                "data": {"id": event["run_id"], "content": {"status": "processing"}}
            }
        return None
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
        output = event.get("data", {}).get("output", "")
        # 处理 ToolMessage 对象
        if hasattr(output, "content"):
            result = output.content
        elif isinstance(output, dict):
            result = output
        else:
            result = str(output)

        return {
            "event": "tool_result",
            "data": {
                "id": event["run_id"],
                "content": {"result": result}
            }
        }
    elif event_type == "on_chat_model_stream":
        chunk = event.get("data", {}).get("chunk")
        if chunk and hasattr(chunk, "content") and chunk.content:
            # 过滤掉只包含 "..." 的 chunk（工具调用前的占位符）
            content = chunk.content.strip()
            if content and content != "...":
                return {
                    "event": "message",
                    "data": {"id": event["run_id"], "content": {"chunk": chunk.content}}
                }

    return None