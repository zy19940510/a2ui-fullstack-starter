# A2UI React Renderer - 全局 Registry 迁移指南

## 概览

本次重构将组件管理从 **ComponentCatalog** 迁移到 **全局 ComponentRegistry + 命名空间** 架构,简化 API 并支持多租户/微前端场景。

## 核心变化

### 旧设计 (ComponentCatalog)

```typescript
// ❌ 旧方式 - 需要手动管理 catalog
import { getDefaultCatalog, ComponentCatalog } from '@a2ui-web/a2ui-react-renderer'

// 1. 创建 custom catalog,手动传入 defaultCatalog 作为 fallback
const customCatalog = new ComponentCatalog(getDefaultCatalog())
customCatalog.use(navbarPlugin)

// 2. 在 A2UIProvider 中传递
<A2UIProvider value={{ processor, catalog: customCatalog }}>
  <A2UIRenderer surfaceId="navbar" />
</A2UIProvider>
```

**问题**:
- 用户需要手动调用 `getDefaultCatalog()` 作为 fallback
- `catalogId` / `catalogById` 系统复杂
- 职责不清晰 (Catalog vs Registry vs Proxy fallback)

---

### 新设计 (ComponentRegistry + Namespace)

```typescript
// ✅ 新方式 - 全局 Registry + 命名空间
import { componentRegistry, defineComponentPlugin } from '@a2ui-web/a2ui-react-renderer'

// 1. 定义命名空间
export const EXAMPLE_NAMESPACE = 'example.next12'

// 2. 注册组件到命名空间
const navbarPlugin = defineComponentPlugin('Navbar', Navbar)
componentRegistry.use(navbarPlugin, EXAMPLE_NAMESPACE)

// 3. 在 A2UIProvider 中只需指定 namespace
<A2UIProvider value={{ processor, namespace: EXAMPLE_NAMESPACE }}>
  <A2UIRenderer surfaceId="navbar" />
</A2UIProvider>
```

**优势**:
- ✅ 内置组件自动注册到 `'default'` 命名空间
- ✅ 自定义组件注册到独立命名空间,自动 fallback 到 `'default'`
- ✅ 移除 `catalog` / `catalogId` / `catalogById` props
- ✅ 支持多租户/微前端场景 (不同命名空间)

---

## 迁移步骤

### Step 1: 更新组件注册

**旧代码** (`example/src/lib/customCatalog.ts`):
```typescript
import { ComponentCatalog, getDefaultCatalog, defineComponentPlugin } from '@a2ui-web/a2ui-react-renderer'

export function getCustomCatalog(): ComponentCatalog {
  const catalog = new ComponentCatalog(getDefaultCatalog()) // ❌ 手动 fallback
  catalog.use(navbarPlugin)
  return catalog
}
```

**新代码**:
```typescript
import { componentRegistry, defineComponentPlugin } from '@a2ui-web/a2ui-react-renderer'

export const EXAMPLE_NAMESPACE = 'example.next12'

const navbarPlugin = defineComponentPlugin('Navbar', Navbar)
componentRegistry.use(navbarPlugin, EXAMPLE_NAMESPACE) // ✅ 全局注册
```

---

### Step 2: 更新 A2UIProvider

**旧代码** (`example/pages/_app.tsx`):
```typescript
import { getCustomCatalog } from '../src/lib/customCatalog'

const { processor, catalog } = useMemo(() => ({
  processor: new v0_8.Data.A2uiMessageProcessor(),
  catalog: getCustomCatalog() // ❌ 手动获取 catalog
}), [])

<A2UIProvider value={{ processor, catalog }}>
```

**新代码**:
```typescript
import { EXAMPLE_NAMESPACE } from '../src/lib/customCatalog'
import '../src/lib/customCatalog' // ✅ 导入即注册

const a2uiEnv = useMemo(() => ({
  processor: new v0_8.Data.A2uiMessageProcessor(),
  namespace: EXAMPLE_NAMESPACE // ✅ 只需指定 namespace
}), [])

<A2UIProvider value={a2uiEnv}>
```

---

### Step 3: 更新 A2UIRenderer (可选)

**旧代码**:
```typescript
<A2UIRenderer
  surfaceId="navbar"
  catalogId="example.next12:custom_catalog_0_1_0" // ❌ 复杂的 catalogId
/>
```

**新代码**:
```typescript
<A2UIRenderer
  surfaceId="navbar"
  namespace="example.next12" // ✅ 简单的 namespace (可省略,继承自 Provider)
/>
```

---

## API 参考

### ComponentRegistry

全局单例,管理所有命名空间的组件。

```typescript
import { componentRegistry, DEFAULT_NAMESPACE } from '@a2ui-web/a2ui-react-renderer'

// 注册到默认命名空间
componentRegistry.register('MyComponent', MyComponent)

// 注册到自定义命名空间
componentRegistry.register('Navbar', CustomNavbar, 'tenant-a')

// 批量注册 (插件模式)
componentRegistry.use(navbarPlugin, 'my-app')

// 获取组件 (自动 fallback)
const Component = componentRegistry.get('Typography', 'my-app') // 找不到会自动从 'default' 查找

// 检查组件是否存在
const exists = componentRegistry.has('Navbar', 'tenant-a')

// 获取命名空间的所有组件
const components = componentRegistry.getRegisteredComponents('my-app')

// 创建命名空间 (通常不需要手动调用,register 会自动创建)
componentRegistry.createNamespace('tenant-a', {
  autoFallback: true, // 默认 true,自动 fallback 到 'default'
  fallbackNamespace: 'default' // 默认 'default'
})
```

---

### 命名空间配置

```typescript
export interface NamespaceConfig {
  /**
   * 是否启用自动 fallback 到 default 命名空间
   * @default true
   */
  autoFallback?: boolean
  /**
   * 自定义 fallback 命名空间 (默认为 'default')
   */
  fallbackNamespace?: string
}
```

---

### A2UIProvider

```typescript
export type A2UIEnvironment = {
  processor: InstanceType<typeof v0_8.Data.A2uiMessageProcessor>
  /**
   * 默认命名空间
   * @default 'default'
   */
  namespace?: string
}

<A2UIProvider value={{ processor, namespace: 'my-app' }}>
  <A2UIRenderer surfaceId="navbar" />
</A2UIProvider>
```

---

### A2UIRenderer

```typescript
<A2UIRenderer
  processor={processor} // 可选,继承自 A2UIProvider
  surfaceId="navbar"
  namespace="my-app" // 可选,继承自 A2UIProvider,默认 'default'
  onUserAction={handleAction}
  initialMessages={messages}
  initialSnapshot={snapshot}
/>
```

---

## SSR 支持

新设计完全支持 SSR,命名空间在服务端和客户端都使用全局单例:

```typescript
// pages/_app.tsx (服务端和客户端都执行)
import '../src/lib/customCatalog' // 注册到全局 Registry

function MyApp({ Component, pageProps }: AppProps) {
  const a2uiEnv = useMemo(() => ({
    processor: new v0_8.Data.A2uiMessageProcessor(),
    namespace: EXAMPLE_NAMESPACE
  }), [])

  return (
    <A2UIProvider value={a2uiEnv}>
      <Component {...pageProps} />
    </A2UIProvider>
  )
}
```

---

## 多租户/微前端场景

命名空间天然支持多租户和微前端:

```typescript
// 租户 A
componentRegistry.use(tenantANavbarPlugin, 'tenant-a')

// 租户 B
componentRegistry.use(tenantBNavbarPlugin, 'tenant-b')

// 使用
<A2UIProvider value={{ processor, namespace: 'tenant-a' }}>
  <A2UIRenderer surfaceId="navbar" /> {/* 使用租户 A 的 Navbar */}
</A2UIProvider>

<A2UIProvider value={{ processor, namespace: 'tenant-b' }}>
  <A2UIRenderer surfaceId="navbar" /> {/* 使用租户 B 的 Navbar */}
</A2UIProvider>
```

---

## 向后兼容

旧的 ComponentCatalog API 仍然可用 (标记为 `@deprecated`),但建议迁移到新 API:

```typescript
// 仍然可用,但已废弃
import { ComponentCatalog, getDefaultCatalog } from '@a2ui-web/a2ui-react-renderer'
```

---

## 常见问题

### Q: 内置组件 (Typography, Column, Row, ShadcnButton) 如何使用?

A: 内置组件自动注册到 `'default'` 命名空间,所有自定义命名空间默认会 fallback 到 `'default'`,无需手动处理。

---

### Q: 如何覆盖内置组件?

A: 在自定义命名空间中注册同名组件即可:

```typescript
componentRegistry.register('Typography', CustomTypography, 'my-app')
// 'my-app' 命名空间会优先使用 CustomTypography
```

---

### Q: 如何禁用 fallback?

A: 创建命名空间时设置 `autoFallback: false`:

```typescript
componentRegistry.createNamespace('isolated', { autoFallback: false })
// 'isolated' 命名空间不会 fallback,只能使用自己注册的组件
```

---

### Q: 全局 Registry 是否线程安全?

A: 是的。ComponentRegistry 是单例,在 Node.js (SSR) 和浏览器环境都使用同一个实例。每个命名空间独立,互不干扰。

---

## 总结

新设计通过 **全局 Registry + 命名空间** 简化了组件管理:
- ✅ 自动 fallback,无需手动处理
- ✅ 清晰的 API,移除冗余概念
- ✅ 支持多租户/微前端
- ✅ 完全 SSR 安全
