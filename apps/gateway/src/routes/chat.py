import json
import re
import asyncio
from fastapi import APIRouter, Request
from pydantic import BaseModel
from sse_starlette import EventSourceResponse

import sys
from pathlib import Path

# 基于文件绝对路径定位 ai-agent，避免依赖启动目录。
AGENT_SRC = Path(__file__).resolve().parents[3] / "ai-agent" / "src"
if str(AGENT_SRC) not in sys.path:
    sys.path.insert(0, str(AGENT_SRC))
from agent import run_agent_stream

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    conversation_id: str | None = None

@router.post("/stream")
async def chat_stream(request: ChatRequest, req: Request):
    """SSE 流式聊天端点（支持 A2UI）"""

    async def event_generator():
        processing_sent = False  # 跟踪是否已发送 processing
        accumulated_text = ""  # 累积所有文本用于解析 A2UI

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
                    # 累积 message 文本
                    elif sse_event["event"] == "message":
                        chunk = sse_event["data"]["content"]["chunk"]
                        accumulated_text += chunk

                        # 先发送文本（流式）
                        yield {
                            "event": "message",
                            "data": json.dumps(sse_event["data"])
                        }
                    # 其他事件直接发送
                    else:
                        yield {
                            "event": sse_event["event"],
                            "data": json.dumps(sse_event["data"])
                        }

            # 流结束后，尝试解析 A2UI JSON
            a2ui_messages = extract_a2ui_json(accumulated_text)

            if a2ui_messages:
                print(f"✅ Found {len(a2ui_messages)} A2UI messages")

                # 逐条发送 A2UI 消息
                for msg in a2ui_messages:
                    yield {
                        "event": "a2ui",
                        "data": json.dumps(msg)
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
            print(f"❌ Error in event_generator: {e}")
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

def extract_a2ui_json(text: str) -> list:
    """
    从 LLM 输出中提取 A2UI JSON

    格式:
    [conversational text]

    ---a2ui_JSON---

    [A2UI JSON array]
    """
    # 匹配 ---a2ui_JSON--- 分隔符后的内容
    # 支持两种格式：
    # 1. ---a2ui_JSON---\n```json\n[...]\n```
    # 2. ---a2ui_JSON---\n[...]
    pattern = r'---a2ui_JSON---\s*(?:```(?:json)?\s*)?([\s\S]*?)(?:```|---|\Z)'
    match = re.search(pattern, text, re.IGNORECASE)

    if not match:
        print(f"⚠️  No A2UI delimiter found in text")
        return []

    json_text = match.group(1).strip()
    print(f"📝 Raw JSON text (first 200 chars): {json_text[:200]}")

    # 额外清理：移除尾部可能残留的非 JSON 内容
    # 找到最后一个 ] 或 }
    last_bracket = max(json_text.rfind(']'), json_text.rfind('}'))
    if last_bracket != -1:
        json_text = json_text[:last_bracket + 1]

    json_text = json_text.strip()

    print(f"🧹 Cleaned JSON text (first 200 chars): {json_text[:200]}")

    try:
        messages = json.loads(json_text)

        # 验证是否为数组
        if not isinstance(messages, list):
            print(f"⚠️  A2UI JSON is not an array: {type(messages)}")
            return []

        # 验证每个消息是否有效
        valid_message_types = ["surfaceUpdate", "dataModelUpdate", "beginRendering", "deleteSurface"]
        for msg in messages:
            if not isinstance(msg, dict):
                print(f"⚠️  Invalid message type: {type(msg)}")
                return []

            # 检查是否包含至少一个有效的消息类型
            if not any(key in msg for key in valid_message_types):
                print(f"⚠️  Message missing valid type: {msg.keys()}")
                return []

        return messages

    except json.JSONDecodeError as e:
        print(f"❌ Failed to parse A2UI JSON: {e}")
        print(f"JSON text: {json_text[:200]}...")
        return []
