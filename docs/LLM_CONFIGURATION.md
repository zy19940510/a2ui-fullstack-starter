# LLM Provider 配置说明

本项目已支持多种 LLM Provider，包括 Ollama、火山方舟（ARK）和 LB One API。

## 快速配置

在 `packages/agent/.env` 和 `packages/gateway/.env` 中配置：

```bash
# 选择 Provider (ollama/ark/one)
LLM_PROVIDER=one

# LB One API 配置（默认已配置）
ONE_BASE_URL=https://lboneapi.longbridge-inc.com/v1
ONE_API_KEY=sk-WOc49F7TwttlijpI2w4nu70r1jFWqAMiQT818FK0yrOF9dJG
ONE_MODEL=gpt-5.1

# LLM 参数
LLM_TEMPERATURE=0.7
```

## 支持的 Provider

### 1. LB One API (默认)

```bash
LLM_PROVIDER=one
ONE_BASE_URL=https://lboneapi.longbridge-inc.com/v1
ONE_API_KEY=your-api-key
ONE_MODEL=gpt-5.1
```

### 2. 火山方舟 (ARK)

```bash
LLM_PROVIDER=ark
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
ARK_API_KEY=your-api-key
ARK_MODEL=deepseek-v3-2-251201
```

### 3. Ollama (本地)

```bash
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=deepseek-r1:8b
```

## 实现原理

agent.py 中的 `_get_llm_config()` 函数会根据 `LLM_PROVIDER` 环境变量自动选择对应的配置：

```python
def _get_llm_config():
    provider = os.getenv("LLM_PROVIDER", "ollama").strip().lower()

    if provider == "ark":
        return {...}  # 火山方舟配置
    elif provider == "one":
        return {...}  # LB One API 配置
    else:
        return {...}  # Ollama 配置
```

所有 provider 都通过 `ChatOpenAI` 统一调用（兼容 OpenAI API 的服务）。

## 测试配置

```bash
cd packages/agent
python test_config.py
```

应该看到类似输出：

```
✓ LLM Provider: one
  - Model: gpt-5.1
  - Base URL: https://lboneapi.longbridge-inc.com/v1
  - API Key: sk-WOc49F7Twttl...
  - Temperature: 0.7

✓ Agent 配置加载成功
✓ Agent 创建成功
```

## 运行服务

```bash
# Terminal 1: 启动 Gateway
cd packages/gateway
uvicorn src.main:app --reload --port 8000

# Terminal 2: 启动前端
cd packages/web
npm run dev
```

现在你的 Agent 将使用 LB One API 的 gpt-5.1 模型！
