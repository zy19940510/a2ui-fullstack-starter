# @a2ui-web/lit-core

A2UI 0.8 核心库的 Webpack 5 兼容版本。

## 问题背景

原始的 `@a2ui/lit@0.8.1` 包在 Next.js 12 + Webpack 5 环境中存在编译错误，原因是使用了 ES2024 的 JSON Import Assertions 语法：

```typescript
// ❌ 原始代码（不兼容 Webpack 5）
import data from './data.json' with { type: 'json' };
```

这会导致 Next.js 12 的 Webpack 5 无法处理该语法，抛出 "Module parse failed" 错误。

## 解决方案

本包通过以下方式解决了兼容性问题：

1. **使用 tsup 打包**：利用 esbuild 自动将 JSON 文件内联为 JavaScript 对象
2. **移除 Import Assertions**：将源码中的 `with { type: "json" }` 语法移除
3. **保留模块结构**：配置 `bundle: false`，保留原始的目录结构和模块划分

## 安装

```bash
# 使用 bun
bun add @a2ui-web/lit-core

# 使用 npm
npm install @a2ui-web/lit-core

# 使用 yarn
yarn add @a2ui-web/lit-core
```

## 使用

```typescript
// 导入整个库
import * as v0_8 from '@a2ui-web/lit-core'

// 或导入特定模块
import { Events, Types, Data } from '@a2ui-web/lit-core'
import type { AnyComponentNode } from '@a2ui-web/lit-core/Types'

// 使用消息处理器
const processor = new v0_8.Data.A2uiMessageProcessor()
```

## 导出模块

- **Events** - 事件相关类型和工具
- **Types** - 组件节点类型定义
- **Primitives** - 原始类型定义
- **Styles** - 样式相关类型
- **Data** - 数据处理器和工具
  - `A2uiMessageProcessor` - 主消息处理器类
  - `createSignalA2uiMessageProcessor` - 创建 Signal 版本的处理器
  - `Guards` - 类型守卫函数
- **Schemas** - JSON Schema 定义
- **UI** - UI 组件（Lit Web Components）

## 与原包的区别

| 特性 | @a2ui/lit | @a2ui-web/lit-core |
|------|----------|-------------------|
| JSON 导入方式 | Import Assertions (`with { type: "json" }`) | 内联为 JavaScript 对象 |
| 构建工具 | tsc (TypeScript Compiler) | tsup (esbuild) |
| Webpack 5 兼容性 | ❌ 不兼容 | ✅ 完全兼容 |
| Next.js 12 支持 | ❌ 需要额外配置 | ✅ 开箱即用 |
| 包大小 | 较小（未内联 JSON） | 稍大（JSON 已内联） |

## 技术细节

### 构建配置

**tsup.config.ts**:
```typescript
export default defineConfig({
  entry: ['src/**/*.{ts,tsx}', '!src/**/*.test.ts'],
  format: ['esm'],
  bundle: false,  // 保留模块结构
  esbuildOptions(options) {
    options.loader = {
      '.json': 'json',  // 自动内联 JSON
    }
  },
})
```

### JSON 内联原理

tsup 使用 esbuild 作为底层引擎，当配置 `.json: 'json'` loader 时：

1. esbuild 读取 JSON 文件内容
2. 将 JSON 内容转换为 JavaScript 对象字面量
3. 直接嵌入到编译后的代码中

**编译前**:
```typescript
import schema from './schema.json';
```

**编译后**:
```javascript
const schema = { /* JSON 内容作为对象字面量 */ };
```

## 许可证

Apache-2.0（与原始 Google 包保持一致）

## 相关链接

- [原始包文档](https://github.com/google/android-auto-companion-app/tree/main/packages/lit)
- [Webpack 错误分析](./WEBPACK_ERROR_ANALYSIS.md)
- [tsup 文档](https://tsup.egoist.dev/)
