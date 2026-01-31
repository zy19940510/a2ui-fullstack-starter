# LLM 配置说明

## 概述

本项目使用环境变量管理 LLM 配置，支持通过 `.env` 文件配置 API Key 和模型参数。

## 快速开始

### 1. 创建环境变量文件

```bash
cd packages/agent
cp .env.example .env
```

### 2. 编辑 `.env` 文件

```bash
# LLM API 配置
OPENAI_API_KEY=your-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1
MODEL_NAME=claude-sonnet-4-5-20250929
```


**重要**：不要将 API Key 提交到 Git！`.env` 文件已被 `.gitignore` 忽略。

## 配置参数说明

| 参数                | 说明                           | 示例                                         |
| ------------------- | ------------------------------ | -------------------------------------------- |
| `OPENAI_API_KEY`    | LLM API 密钥                   | `sk-ant-...` 或 `sk-proj-...`                |
| `OPENAI_BASE_URL`   | API 端点地址                   | `https://api.anthropic.com/v1`               |
| `MODEL_NAME`        | 模型名称                       | `claude-sonnet-4-5-20250929`                 |

## 支持的模型

当前配置使用 **Claude Sonnet 4.5**：

- **模型 ID**: `claude-sonnet-4-5-20250929`
- **特点**:
  - 强大的推理能力
  - 支持工具调用（Function Calling）
  - 流式输出
  - 上下文长度：200K tokens

## 代码实现

**Agent 配置** (`packages/agent/src/agent.py`):

```python
import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

# 加载环境变量
load_dotenv()

def create_agent():
    # 从环境变量读取配置
    llm = ChatOpenAI(
        model=os.getenv("MODEL_NAME", "claude-sonnet-4-5-20250929"),
        base_url=os.getenv("OPENAI_BASE_URL"),
        api_key=os.getenv("OPENAI_API_KEY"),
        temperature=0.7,
        streaming=True
    )

    # ... 其他代码
```

## 安全最佳实践

### ✅ 正确做法

1. **使用 .env 文件**：
   ```bash
   # packages/agent/.env
   OPENAI_API_KEY=sk-actual-key-here
   ```

2. **添加到 .gitignore**：
   ```bash
   # .gitignore
   .env
   ```

3. **提供示例文件**：
   ```bash
   # .env.example
   OPENAI_API_KEY=your-api-key-here
   ```

### ❌ 错误做法

1. **硬编码 API Key**：
   ```python
   # ❌ 不要这样做
   api_key = "sk-WOc49F7..."
   ```

2. **提交 .env 到 Git**：
   ```bash
   # ❌ 不要提交
   git add .env
   ```

3. **在代码中暴露**：
   ```python
   # ❌ 不要在注释中写 key
   # My API key: sk-xxx...
   ```

## 切换模型

### 使用其他 Claude 模型

编辑 `.env` 文件：

```bash
# Claude Opus 4.5 (更强大)
MODEL_NAME=claude-opus-4-5-20251101

# Claude Haiku 4.0 (更快速)
MODEL_NAME=claude-haiku-4-0-20250514
```

### 使用其他 API 提供商

如果你使用其他兼容 OpenAI API 的服务：

```bash
# OpenAI 官方
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=sk-proj-...
MODEL_NAME=gpt-4o

# Azure OpenAI
OPENAI_BASE_URL=https://your-resource.openai.azure.com
OPENAI_API_KEY=your-azure-key
MODEL_NAME=gpt-4
```

## 环境变量加载

项目使用 `python-dotenv` 自动加载环境变量：

```python
from dotenv import load_dotenv
import os

# 加载 .env 文件
load_dotenv()

# 读取变量
api_key = os.getenv("OPENAI_API_KEY")
```

**加载顺序**：
1. `.env` 文件中的变量
2. 系统环境变量（如果未在 .env 中定义）
3. 代码中的默认值

## 验证配置

启动服务后，检查日志确认配置正确：

```bash
cd packages/gateway
uv run uvicorn main:app --reload
```

你应该看到 Agent 成功创建，没有报错。

## 故障排查

### 问题：API Key 无效

```
Error: Invalid API key
```

**解决**：
1. 检查 `.env` 文件中的 `OPENAI_API_KEY` 是否正确
2. 确认 API Key 没有过期
3. 验证 `OPENAI_BASE_URL` 与 API Key 匹配

### 问题：找不到 .env 文件

```
Error: No such file or directory: '.env'
```

**解决**：
```bash
cd packages/agent
cp .env.example .env
# 编辑 .env 填入你的配置
```

### 问题：模型不存在

```
Error: Model 'xxx' not found
```

**解决**：
1. 检查 `MODEL_NAME` 拼写是否正确
2. 确认你的 API 提供商支持该模型
3. 查看 API 文档确认可用模型列表

## 多环境配置

### 开发环境

```bash
# packages/agent/.env.development
OPENAI_API_KEY=sk-dev-key
MODEL_NAME=claude-haiku-4-0-20250514  # 使用更便宜的模型
```

### 生产环境

```bash
# packages/agent/.env.production
OPENAI_API_KEY=sk-prod-key
MODEL_NAME=claude-sonnet-4-5-20250929  # 使用更强大的模型
```

### 加载指定环境

```python
from dotenv import load_dotenv
import os

env = os.getenv("ENV", "development")
load_dotenv(f".env.{env}")
```

## 相关文件

- `packages/agent/.env`: 环境变量（已忽略）
- `packages/agent/.env.example`: 配置模板
- `packages/agent/.gitignore`: 忽略规则
- `packages/agent/src/agent.py`: Agent 实现
- `docs/ARCHITECTURE.md`: 架构文档

## 参考资源

- [Claude API 文档](https://docs.anthropic.com/)
- [OpenAI API 文档](https://platform.openai.com/docs)
- [python-dotenv 文档](https://github.com/theskumar/python-dotenv)
- [环境变量最佳实践](https://12factor.net/config)
