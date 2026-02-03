from langchain_core.tools import tool
import httpx
from ddgs import DDGS
import json

# MCP ComponentDoc Server URL
MCP_SERVER_URL = "http://127.0.0.1:9527/mcp"

@tool
def list_available_components() -> str:
    """获取前端所有可用的 A2UI 组件列表（从 MCP 服务器动态获取）

    Returns:
        JSON 格式的组件列表，包含所有已注册的组件
    """
    try:
        response = httpx.post(
            MCP_SERVER_URL,
            json={
                "jsonrpc": "2.0",
                "method": "tools/call",
                "params": {
                    "name": "list_components",
                    "arguments": {}
                },
                "id": 1
            },
            timeout=5.0
        )
        response.raise_for_status()
        result = response.json()

        if "result" in result and "content" in result["result"]:
            components_data = json.loads(result["result"]["content"][0]["text"])
            components = components_data.get("components", [])

            # 返回格式化的组件列表
            return json.dumps({
                "components": components,
                "total_count": len(components)
            }, ensure_ascii=False, indent=2)

        return json.dumps({"components": [], "total_count": 0}, ensure_ascii=False)
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
        response = httpx.post(
            MCP_SERVER_URL,
            json={
                "jsonrpc": "2.0",
                "method": "tools/call",
                "params": {
                    "name": "get_component",
                    "arguments": {"name": name}
                },
                "id": 1
            },
            timeout=5.0
        )
        response.raise_for_status()
        result = response.json()

        if "result" in result and "content" in result["result"]:
            component_data = json.loads(result["result"]["content"][0]["text"])
            content = component_data.get("content")

            if content:
                return content

            error = component_data.get("error", "组件未找到")
            return f"错误: {error}"

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
        response = httpx.post(
            MCP_SERVER_URL,
            json={
                "jsonrpc": "2.0",
                "method": "tools/call",
                "params": {
                    "name": "search_components",
                    "arguments": {"keyword": keyword, "top_k": top_k}
                },
                "id": 1
            },
            timeout=5.0
        )
        response.raise_for_status()
        result = response.json()

        if "result" in result and "content" in result["result"]:
            search_data = json.loads(result["result"]["content"][0]["text"])
            results = search_data.get("results", [])

            if results:
                names = [r["name"] for r in results]
                return f"找到 {len(names)} 个组件: {', '.join(names)}"

            return f"未找到包含 '{keyword}' 的组件"

        return "搜索失败"
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