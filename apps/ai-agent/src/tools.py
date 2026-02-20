from langchain_core.tools import tool
import httpx
# ddgs 是可选依赖：本项目某些环境下只需要 MCP 相关工具，不一定安装了 ddgs
try:
    from ddgs import DDGS  # type: ignore
except Exception:  # pragma: no cover
    DDGS = None  # type: ignore
import json
from typing import Any, Dict

# MCP ComponentDoc Server URL
MCP_SERVER_URL = "http://127.0.0.1:9527/mcp"


def _call_mcp_tool(name: str, arguments: Dict[str, Any] | None = None, timeout: float = 10.0) -> Dict[str, Any]:
    """通过 fastmcp 官方 Client 调用 MCP tool。

    直接用裸 HTTPX 模拟 JSON-RPC 很容易因为 fastmcp>=2 的 HTTP transport
    协议/参数校验发生漂移而报错（406/400/-32602）。
    这里使用 fastmcp.client.Client 由官方实现负责握手、会话和 SSE 解析。
    """

    # fastmcp 依赖可能只在 apps/ai-agent 的 uv venv 里。
    # gateway 运行时会把 agent 源码直接塞进 sys.path，导致这里 import fastmcp 失败。
    # 这里做一次“从 agent venv 注入 site-packages”的兜底，让工具在 gateway 环境也能用。
    try:
        from fastmcp.client import Client  # type: ignore
    except Exception:
        import sys
        from pathlib import Path

        agent_root = Path(__file__).resolve().parents[1]  # apps/ai-agent
        # 仅支持 mac/linux 的常见 venv 布局：.venv/lib/pythonX.Y/site-packages
        candidates = list((agent_root / ".venv" / "lib").glob("python*/site-packages"))
        if candidates:
            sp = str(candidates[0])
            # 必须追加到 sys.path 尾部，避免覆盖 gateway/anaconda 环境里的 attrs 等依赖。
            if sp not in sys.path:
                sys.path.append(sp)

        try:
            from fastmcp.client import Client  # type: ignore
        except Exception as e:  # pragma: no cover
            raise RuntimeError(
                "缺少 fastmcp 依赖，无法调用 MCP。请先在 apps/ai-agent 下运行 uv sync 安装依赖。"
            ) from e

    import asyncio

    async def _run() -> Dict[str, Any]:
        async with Client(MCP_SERVER_URL, timeout=timeout) as client:
            result = await client.call_tool(name, arguments or {})
            # fastmcp 的返回对象包含 structured_content/data 等更易用字段。
            # 优先使用这些，避免再去 parse content[0].text。
            if hasattr(result, "structured_content") and result.structured_content is not None:
                return result.structured_content  # type: ignore[return-value]
            if hasattr(result, "data") and result.data is not None:
                return result.data  # type: ignore[return-value]

            # 兜底：结果通常是 pydantic 模型，统一转成 dict
            if hasattr(result, "model_dump"):
                return result.model_dump()  # pydantic v2
            if hasattr(result, "dict"):
                return result.dict()  # pydantic v1
            if isinstance(result, dict):
                return result
            return {"result": result}

    return asyncio.run(_run())

@tool
def list_available_components() -> str:
    """获取前端所有可用的 A2UI 组件列表（从 MCP 服务器动态获取）

    Returns:
        JSON 格式的组件列表，包含所有已注册的组件
    """
    try:
        mcp_result = _call_mcp_tool("list_components", {})
        # fastmcp client.call_tool 的返回一般是 {"content": [...]} 或 {"result": ...}
        components: list[str] = []

        # 情况 1：直接返回 dict，包含 components
        if "components" in mcp_result and isinstance(mcp_result.get("components"), list):
            components = mcp_result["components"]

        # 情况 2：返回 content[0].text 是 JSON 字符串
        elif "content" in mcp_result and mcp_result["content"]:
            try:
                components_data = json.loads(mcp_result["content"][0].get("text", "{}"))
                components = components_data.get("components", [])
            except Exception:
                components = []

        return json.dumps({"components": components, "total_count": len(components)}, ensure_ascii=False, indent=2)
    except Exception as e:
        return f"获取组件列表失败: {str(e)}"

@tool
def get_component(name: str) -> str:
    """获取指定组件的详细文档

    Args:
        name: 组件名称，例如 "Weather"

    Returns:
        组件的完整文档，包括 props、数据结构、使用示例等
    """
    try:
        mcp_result = _call_mcp_tool("get_component", {"name": name})

        # 优先：直接返回 {name, content, error}
        if isinstance(mcp_result, dict):
            if mcp_result.get("content"):
                return mcp_result["content"]
            if mcp_result.get("error"):
                return f"错误: {mcp_result.get('error')}"

        # 兜底：如果仍然是 content[0].text 形式
        if "content" in mcp_result and mcp_result["content"]:
            try:
                payload = json.loads(mcp_result["content"][0].get("text", "{}"))
                if payload.get("content"):
                    return payload["content"]
                return f"错误: {payload.get('error', '组件未找到')}"
            except Exception:
                pass

        return f"获取组件 '{name}' 文档失败"
    except Exception as e:
        return f"获取组件文档失败: {str(e)}"

@tool
def search_components(keyword: str, top_k: int = 5) -> str:
    """搜索包含指定关键词的组件

    Args:
        keyword: 搜索关键词
        top_k: 返回结果数量，默认 5 个

    Returns:
        匹配的组件列表
    """
    try:
        mcp_result = _call_mcp_tool("search_components", {"keyword": keyword, "top_k": top_k})

        results = []
        if "results" in mcp_result and isinstance(mcp_result.get("results"), list):
            results = mcp_result["results"]
        elif "content" in mcp_result and mcp_result["content"]:
            try:
                payload = json.loads(mcp_result["content"][0].get("text", "{}"))
                results = payload.get("results", [])
            except Exception:
                results = []

        if results:
            names = [r.get("name") for r in results if isinstance(r, dict) and r.get("name")]
            return f"找到 {len(names)} 个组件: {', '.join(names)}"

        return f"未找到包含 '{keyword}' 的组件"
    except Exception as e:
        return f"搜索组件失败: {str(e)}"


@tool
def web_search(query: str, max_results: int = 5) -> str:
    """使用 DuckDuckGo 搜索互联网获取最新信息

    Args:
        query: 搜索关键词
        max_results: 返回结果数量，默认 5 条

    Returns:
        搜索结果摘要
    """
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(query, max_results=max_results))

        if not results:
            return f"未找到关于 '{query}' 的搜索结果"

        output = f"🔍 搜索结果（共 {len(results)} 条）：\n\n"
        for i, result in enumerate(results, 1):
            title = result.get("title", "无标题")
            body = result.get("body", "无描述")
            url = result.get("href", "")
            output += f"{i}. **{title}**\n{body}\n🔗 {url}\n\n"

        return output.strip()

    except Exception as e:
        return f"搜索失败: {str(e)}"

@tool
def calculator(expression: str) -> str:
    """计算数学表达式"""
    try:
        result = eval(expression)
        return str(result)
    except Exception as e:
        return f"计算错误: {e}"

@tool
def get_weather(city: str) -> str:
    """查询城市天气信息

    Args:
        city: 城市名称，如 "北京"、"上海"、"London"、"New York"

    Returns:
        天气信息，包括温度、湿度、风速等
    """
    # 城市坐标映射（常用城市）
    city_coords = {
        "北京": (39.9042, 116.4074),
        "上海": (31.2304, 121.4737),
        "深圳": (22.5431, 114.0579),
        "广州": (23.1291, 113.2644),
        "杭州": (30.2741, 120.1551),
        "成都": (30.5728, 104.0668),
        "london": (51.5074, -0.1278),
        "new york": (40.7128, -74.0060),
        "tokyo": (35.6762, 139.6503),
        "paris": (48.8566, 2.3522),
    }

    city_lower = city.lower()
    if city_lower not in city_coords:
        return f"抱歉，暂不支持城市 '{city}'。支持的城市：{', '.join(list(city_coords.keys())[:5])} 等"

    lat, lon = city_coords[city_lower]

    try:
        # 使用 Open-Meteo API（无需 API Key）
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current_weather": True,
            "hourly": "temperature_2m,relative_humidity_2m,wind_speed_10m"
        }

        response = httpx.get(url, params=params, timeout=10.0)
        response.raise_for_status()
        data = response.json()

        current = data["current_weather"]
        temp = current["temperature"]
        windspeed = current["windspeed"]
        weather_code = current["weathercode"]

        # 天气代码映射
        weather_desc_map = {
            0: "晴空", 1: "基本晴", 2: "局部多云", 3: "阴天",
            45: "雾", 48: "雾冻",
            51: "弱毛毛雨", 53: "中毛毛雨", 55: "强毛毛雨",
            61: "小雨", 63: "中雨", 65: "大雨",
            71: "小雪", 73: "中雪", 75: "大雪",
            80: "小阵雨", 81: "中阵雨", 82: "暴雨",
            85: "小阵雪", 86: "大阵雪",
            95: "雷暴", 96: "雷暴伴小冰雹", 99: "雷暴伴大冰雹"
        }
        weather_desc = weather_desc_map.get(weather_code, "未知")

        return f"""{city} 当前天气：
🌡️ 温度: {temp}°C
💨 风速: {windspeed} km/h
🌤️ 天气: {weather_desc}
⏰ 更新时间: {current['time']}""".strip()

    except Exception as e:
        return f"获取天气信息失败: {str(e)}"

def get_tools():
    return [
        # Component Discovery Tools
        list_available_components,  # 获取所有可用组件（从 MCP 动态获取）
        get_component,              # 获取组件文档
        search_components,          # 搜索组件
        # Other Tools
        web_search,
        calculator,
        get_weather
    ]
