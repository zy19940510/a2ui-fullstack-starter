from __future__ import annotations

from pathlib import Path
from typing import Dict, List, Optional

from fastmcp import FastMCP

# 组件文档与 MCP 服务放在同一目录，避免跨包路径耦合。
DOCS_DIR = Path(__file__).resolve().parent / "docs"

mcp = FastMCP("A2UI MCP Server")


def _load_docs() -> Dict[str, str]:
    docs: Dict[str, str] = {}
    if not DOCS_DIR.exists():
        return docs
    for path in DOCS_DIR.glob("*.md"):
        try:
            content = path.read_text(encoding="utf-8").strip()
        except OSError:
            continue
        if not content:
            continue
        docs[path.stem] = content
    return docs


def _resolve_name(name: str, docs: Dict[str, str]) -> Optional[str]:
    if name in docs:
        return name
    lowered = name.strip().lower()
    for key in docs:
        if key.lower() == lowered:
            return key
    return None


@mcp.tool
def list_components() -> Dict[str, List[str]]:
    docs = _load_docs()
    return {"components": sorted(docs.keys())}


@mcp.tool
def get_component(name: str) -> Dict[str, Optional[str]]:
    docs = _load_docs()
    resolved = _resolve_name(name, docs)
    if not resolved:
        return {"name": name, "content": None, "error": "component not found"}
    return {"name": resolved, "content": docs[resolved]}


@mcp.tool
def search_components(keyword: str, top_k: int = 5) -> Dict[str, object]:
    docs = _load_docs()
    query = keyword.strip().lower()
    results: List[Dict[str, object]] = []
    if query:
        for name, content in docs.items():
            haystack = f"{name} {content}".lower()
            if query in haystack:
                results.append({"name": name, "exists": True})
            if len(results) >= top_k:
                break
    return {"keyword": keyword, "results": results}


def main() -> None:
    mcp.run(transport="http", host="127.0.0.1", port=9527, path="/mcp")


if __name__ == "__main__":
    main()
