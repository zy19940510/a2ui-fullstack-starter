# @a2ui-web/lit-core 包改造总结

## 改造背景

原始的 `@a2ui/lit@0.8.1` 包在 Next.js 12 + Webpack 5 环境中存在编译错误：

```
Module parse failed: Unexpected token (23:91)
import A2UIClientEventMessage from "./schemas/server_to_client_with_standard_catalog.json" with { type: "json" };
```

**根本原因**：`@a2ui/lit` 使用了 ES2024 的 JSON Import Assertions 语法，而 Next.js 12 的 Webpack 5 不支持该语法。

## 解决方案

创建 `@a2ui-web/lit-core` 包，作为 `@a2ui/lit` 的 Webpack 5 兼容版本。

## 改造步骤

### 1. 创建包结构

```
lit-core/
├── package.json          # 包配置
├── tsconfig.json         # TypeScript 配置
├── tsup.config.ts        # 构建配置（关键）
├── README.md             # 文档
└── src/                  # 源代码（来自 0.8 目录）
    ├── core.ts           # 主入口（已修复 JSON import）
    ├── index.ts
    ├── data/
    ├── events/
    ├── schemas/          # JSON schema 文件
    ├── styles/
    ├── types/
    └── ui/
```

### 2. 核心配置

#### package.json
```json
{
  "name": "@a2ui-web/lit-core",
  "version": "0.1.0",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "peerDependencies": {
    "lit": "^3.0.0"
  }
}
```

#### tsup.config.ts（关键配置）
```typescript
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.{ts,tsx}', '!src/**/*.test.ts'],
  format: ['esm'],
  dts: true,
  bundle: false,  // 保留模块结构
  sourcemap: true,
  clean: true,

  // 关键：将 JSON 文件内联，避免 import assertions
  esbuildOptions(options) {
    options.loader = {
      ...options.loader,
      '.json': 'json',  // esbuild 自动将 JSON 内联为 JS 对象
    }
  },

  external: ['lit', /^lit\//],
})
```

### 3. 源代码修复

**修改前**（core.ts:25）：
```typescript
import A2UIClientEventMessage from "./schemas/server_to_client_with_standard_catalog.json" with { type: "json" };
```

**修改后**：
```typescript
// 移除 JSON Import Assertions 语法，改为标准的 JSON 导入
// tsup 会自动将 JSON 文件内联为 JavaScript 对象
import A2UIClientEventMessage from "./schemas/server_to_client_with_standard_catalog.json";
```

### 4. 工作原理

1. **编译时**：tsup 使用 esbuild 读取 JSON 文件
2. **转换**：esbuild 将 JSON 内容转换为 JavaScript 对象字面量
3. **输出**：直接嵌入到编译后的 JavaScript 代码中

**编译前**：
```typescript
import schema from './schema.json';
```

**编译后**（dist/core.js）：
```javascript
const schema = { /* JSON 内容作为对象字面量 */ };
```

## 使用方式

### 安装

```bash
bun add @a2ui-web/lit-core
```

### 导入

```typescript
// 方式 1：导入整个库
import * as v0_8 from '@a2ui-web/lit-core'

// 方式 2：导入特定模块
import { Events, Types, Data } from '@a2ui-web/lit-core'
import type { AnyComponentNode } from '@a2ui-web/lit-core/Types'

// 使用
const processor = new v0_8.Data.A2uiMessageProcessor()
```

## 与原包的对比

| 特性 | @a2ui/lit | @a2ui-web/lit-core |
|------|----------|-------------------|
| JSON 导入方式 | Import Assertions | 内联为 JS 对象 |
| 构建工具 | tsc | tsup (esbuild) |
| Webpack 5 兼容 | ❌ | ✅ |
| Next.js 12 支持 | ❌ | ✅ |
| 包大小 | 较小 | 稍大（JSON 已内联） |

## 发布流程

```bash
# 1. 升级版本
make patch-lit-core    # 0.1.0 → 0.1.1
make minor-lit-core    # 0.1.0 → 0.2.0
make major-lit-core    # 0.1.0 → 1.0.0

# 2. 发布
make publish-lit-core  # 创建 tag 并触发 CI/CD
```

## 注意事项

1. **许可证**：保持 Apache-2.0，与 Google 原始包一致
2. **不要手动修改源码**：`src/` 目录来自原始 0.8 包，除了修复 JSON import，其他代码保持原样
3. **同步更新**：如果上游 `@a2ui/lit` 有更新，需要手动同步

## 技术学习

### 关键知识点

1. **JSON Import Assertions** 是 ES2024 新特性，旧版打包工具支持有限
2. **TypeScript 编译器不会内联 JSON**，需要使用打包工具（Rollup/esbuild）
3. **tsup 基于 esbuild**，可以自动处理 JSON 内联
4. **`bundle: false`** 保留模块结构，适合库开发

### 问题排查步骤

1. 定位错误代码位置（源文件 vs 构建产物）
2. 检查包的构建工具（package.json scripts）
3. 查看配置文件（tsconfig.json/rollup.config.js/tsup.config.ts）
4. 对比源码和产物的差异
5. 分析目标环境的语法支持
6. 选择合适的解决方案

## 相关文件

- [WEBPACK_ERROR_ANALYSIS.md](../0.8/WEBPACK_ERROR_ANALYSIS.md) - 详细的错误分析报告
- [README.md](./README.md) - 包使用文档
- [tsup.config.ts](./tsup.config.ts) - 构建配置
- [CLAUDE.md](../CLAUDE.md) - 项目整体说明

## 未来优化

1. 考虑是否需要提供 CommonJS 版本（目前仅 ESM）
2. 考虑是否需要 bundle 版本（目前 bundle: false）
3. 跟进上游更新，保持同步
