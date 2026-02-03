from typing import Annotated, AsyncIterator
from langchain_openai import ChatOpenAI
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode
from typing_extensions import TypedDict
from langchain_core.messages import SystemMessage
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv()

try:
    from .tools import get_tools
    from .skill_loader import SkillLoader
except ImportError:
    from tools import get_tools
    from skill_loader import SkillLoader

class State(TypedDict):
    messages: Annotated[list, add_messages]

def create_agent():
    """创建 LangGraph Agent（集成 A2UI Skill）"""

    # 1. 加载 A2UI skill
    loader = SkillLoader()
    skill_result = loader.load_skill("a2ui")

    if not skill_result["success"]:
        print(f"⚠️  Warning: Failed to load A2UI skill: {skill_result.get('error')}")
        system_message_content = "You are a helpful assistant."
    else:
        print(f"✅ Successfully loaded skill: {skill_result['name']}")
        # 2. 构建 System Message（注入 skill）
        system_message_content = f"""You are a helpful assistant that can generate rich UI interfaces using A2UI protocol.

{skill_result['content']}

## IMPORTANT OUTPUT FORMAT

When generating UI, your output MUST follow this format:

[Your conversational response text]

---a2ui_JSON---

[A2UI JSON array]

Rules:
- Always provide conversational text BEFORE the ---a2ui_JSON--- delimiter
- The A2UI JSON part must be a valid JSON array (no markdown code blocks)
- Do NOT wrap the JSON in ```json code blocks

## When to Generate UI

Generate A2UI JSON when:
- User asks for visual displays, dashboards, cards, or interactive elements
- User requests data visualization (weather, charts, lists, etc.)
- User wants forms, buttons, or UI components
"""

    # 3. 从环境变量读取配置
    llm = ChatOpenAI(
        model=os.getenv("MODEL_NAME", "claude-sonnet-4-5-20250929"),
        base_url=os.getenv("OPENAI_BASE_URL"),
        api_key=os.getenv("OPENAI_API_KEY"),
        temperature=0.7,
        streaming=True
    )

    tools = get_tools()
    # 绑定工具到 LLM
    llm_with_tools = llm.bind_tools(tools)

    def call_model(state: State):
        # 注入 System Message
        messages = [SystemMessage(content=system_message_content)] + state["messages"]
        response = llm_with_tools.invoke(messages)
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