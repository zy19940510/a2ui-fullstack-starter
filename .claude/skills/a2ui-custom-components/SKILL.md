---
name: a2ui-custom-components
description: 为 A2UI 0.8 React 渲染器创建自定义组件。基于 @a2ui-web/a2ui-react-renderer@0.3.0，使用 React + TypeScript + Tailwind CSS。包含事件驱动数据绑定、useA2UIValue hook、用户操作处理和完整的组件开发最佳实践。
---

# A2UI React 自定义组件开发指南

基于 `@a2ui-web/a2ui-react-renderer@0.3.0` 的完整 React 组件开发指南。

## 核心架构

### A2UI 0.8 React 渲染器特性

**v0.3.0 核心创新**：

1. **事件驱动更新（零轮询）**：使用 AOP 注入事件系统到 processor
2. **useSyncExternalStore**：React 18 原生支持外部状态
3. **useA2UIValue Hook**：自动响应数据更新的 BoundValue 解析
4. **ComponentCatalog**：插件化组件注册系统
5. **SSR 支持**：服务端渲染快照系统

### 组件 Props 接口

```typescript
import type { A2UIComponentProps } from '@a2ui-web/a2ui-react-renderer'

interface A2UIComponentProps {
  component: v0_8.Types.AnyComponentNode
  processor: InstanceType<typeof v0_8.Data.A2uiMessageProcessor>
  surfaceId: string
  emitUserAction?: (message: UserActionMessage) => void
}
```

## 快速开始

### 最小组件示例

```typescript
import type { A2UIComponentProps } from '@a2ui-web/a2ui-react-renderer'
import { useA2UIValue } from '@a2ui-web/a2ui-react-renderer/hooks/useA2UIValue'

export function MyComponent({ component, processor, surfaceId }: A2UIComponentProps) {
  // 自动响应数据更新的值解析
  const label = useA2UIValue(
    component.properties?.label,
    'Default Label',  // 默认值
    processor,
    component,
    surfaceId
  )

  return (
    <div className="auicom:p-4 auicom:bg-white auicom:rounded">
      {label}
    </div>
  )
}
```

### 注册组件

```typescript
import { ComponentCatalog } from '@a2ui-web/a2ui-react-renderer'
import { MyComponent } from './MyComponent'

const catalog = new ComponentCatalog()
catalog.register('MyComponent', MyComponent)

<A2UIRenderer catalog={catalog} surfaceId="app" />
```

### 在 A2UI 消息中使用

```typescript
processor.processMessages([
  {
    surfaceUpdate: {
      surfaceId: 'app',
      components: [{
        id: 'my-comp',
        component: {
          MyComponent: {
            label: { path: 'greeting' }  // 路径引用
          }
        }
      }]
    }
  },
  {
    dataModelUpdate: {
      surfaceId: 'app',
      path: '/',
      contents: [
        { key: 'greeting', valueString: 'Hello A2UI!' }
      ]
    }
  },
  {
    beginRendering: {
      surfaceId: 'app',
      root: 'my-comp'
    }
  }
])
```

## 核心概念

### 1. BoundValue 类型

A2UI 组件属性支持三种值类型：

#### 字面量（静态值）
```typescript
{ literalString: "Fixed Text" }
{ literalNumber: 42 }
{ literalBoolean: true }
```

#### 路径引用（动态值）
```typescript
{ path: "user.name" }      // 相对路径
{ path: "/users/0/name" }  // 绝对路径
```

#### ValueMap（已解析值）
```typescript
{ valueString: "John" }
{ valueNumber: 42 }
{ valueBoolean: true }
```

### 2. useA2UIValue Hook

**核心原理**：使用 `useSyncExternalStore` 订阅 processor 的事件系统

```typescript
function useA2UIValue<T = unknown>(
  prop: unknown,
  defaultValue: T,
  processor: InstanceType<typeof v0_8.Data.A2uiMessageProcessor>,
  component: v0_8.Types.AnyComponentNode,
  surfaceId: string
): T
```

**自动处理**：
- ✅ 字面量值直接返回
- ✅ 路径引用自动解析（通过 processor.getData）
- ✅ ValueMap 自动提取值
- ✅ 数据更新自动触发重渲染（事件驱动）

**示例**：

```typescript
// 处理所有值类型
const title = useA2UIValue(
  component.properties?.title,
  'Default Title',
  processor,
  component,
  surfaceId
)

// 类型推断
const count = useA2UIValue<number>(
  component.properties?.count,
  0,
  processor,
  component,
  surfaceId
)
```

### 3. 用户操作处理

```typescript
import { emitUserAction } from '@a2ui-web/a2ui-react-renderer/utils/userAction'

function MyButton({ component, surfaceId, emitUserAction: emit }: A2UIComponentProps) {
  const label = useA2UIValue(/* ... */)

  const handleClick = () => {
    emitUserAction(emit, {
      name: 'button_click',
      surfaceId,
      sourceComponentId: component.id,
      timestamp: new Date().toISOString(),
      context: { label }
    })
  }

  return <button onClick={handleClick}>{label}</button>
}
```

## 组件开发模式

### 模式 1：简单数据展示组件

```typescript
import type { A2UIComponentProps } from '@a2ui-web/a2ui-react-renderer'
import { useA2UIValue } from '@a2ui-web/a2ui-react-renderer/hooks/useA2UIValue'

export function StatCard({ component, processor, surfaceId }: A2UIComponentProps) {
  const label = useA2UIValue(component.properties?.label, '', processor, component, surfaceId)
  const value = useA2UIValue(component.properties?.value, 0, processor, component, surfaceId)
  const icon = useA2UIValue(component.properties?.icon, '📊', processor, component, surfaceId)

  return (
    <div className="auicom:p-6 auicom:bg-gradient-to-br auicom:from-blue-50 auicom:to-indigo-50 auicom:rounded-lg auicom:shadow-lg">
      <div className="auicom:flex auicom:items-center auicom:gap-3">
        <span className="auicom:text-3xl">{icon}</span>
        <div>
          <div className="auicom:text-sm auicom:text-gray-600">{label}</div>
          <div className="auicom:text-2xl auicom:font-bold">{value}</div>
        </div>
      </div>
    </div>
  )
}
```

### 模式 2：复杂对象解析（参考 Navbar）

```typescript
import { valueMapToObject } from '@a2ui-web/a2ui-react-renderer/utils/valueMap'

function MyComplexComponent({ component, processor, surfaceId }: A2UIComponentProps) {
  const rawItems = useA2UIValue(
    component.properties?.items,
    [],
    processor,
    component,
    surfaceId
  )

  // 解析 ValueMap 为普通对象
  const items = valueMapToObject(rawItems) as MyItem[]

  return (
    <div>
      {items.map((item, i) => (
        <div key={i}>{item.label}</div>
      ))}
    </div>
  )
}
```

### 模式 3：多层级翻译（参考 Navbar）

```typescript
type Translations = Record<'en' | 'zh', {
  nav: Record<string, string>
  actions: Record<string, string>
}>

const defaultTranslations: Translations = {
  en: {
    nav: { home: 'Home', about: 'About' },
    actions: { login: 'Login' }
  },
  zh: {
    nav: { home: '首页', about: '关于' },
    actions: { login: '登录' }
  }
}

function MyComponent({ component, processor, surfaceId }: A2UIComponentProps) {
  const locale = useA2UIValue<'en' | 'zh'>(
    component.properties?.locale,
    'en',
    processor,
    component,
    surfaceId
  )

  const translations = useA2UIValue<Translations>(
    component.properties?.translations,
    defaultTranslations,
    processor,
    component,
    surfaceId
  )

  const t = translations[locale]?.nav ?? defaultTranslations[locale].nav

  return <div>{t.home}</div>
}
```

### 模式 4：Client/Server 分离（SSR）

```typescript
// MyComponent.tsx (Server Component - 数据准备)
import { useA2UIValue } from '@a2ui-web/a2ui-react-renderer/hooks/useA2UIValue'
import { MyComponentClient } from './MyComponent.client'

export function MyComponent(props: A2UIComponentProps) {
  const { component, processor, surfaceId } = props

  // 服务端解析所有数据
  const data = useA2UIValue(component.properties?.data, {}, processor, component, surfaceId)
  const config = useA2UIValue(component.properties?.config, {}, processor, component, surfaceId)

  // 传递给 Client Component
  return <MyComponentClient data={data} config={config} {...props} />
}

// MyComponent.client.tsx (Client Component - 交互逻辑)
'use client'
import { useState, useEffect } from 'react'

export function MyComponentClient({ data, config, component, surfaceId, emitUserAction }) {
  const [state, setState] = useState(data)

  // 客户端交互逻辑
  const handleAction = () => {
    emitUserAction?.({
      userAction: {
        name: 'action',
        surfaceId,
        sourceComponentId: component.id,
        timestamp: new Date().toISOString()
      }
    })
  }

  return (
    <div onClick={handleAction}>
      {/* 客户端渲染 */}
    </div>
  )
}
```

## 完整示例：Navbar 组件分析

基于 `a2ui-react-renderer/src/a2ui-components/navbar`：

### 架构设计

```
Navbar (Server Component)
  ↓ 数据解析（useA2UIValue）
NavClient (Client Component)
  ↓ 拆分子组件
NavBrand + NavMenu + NavActions
```

### 关键设计模式

1. **数据标准化**：
```typescript
function normalizeNavItems(raw: unknown): NavItem[] {
  const parsed = valueMapToObject(raw) as NavItem[] | Record<string, NavItem>

  // 处理数组
  if (Array.isArray(parsed)) {
    return parsed.length ? parsed : defaultNavItems
  }

  // 处理对象（数字键 = 数组）
  if (parsed && typeof parsed === 'object') {
    const entries = Object.entries(parsed)
    const allNumeric = entries.every(([key]) => !Number.isNaN(Number(key)))

    if (allNumeric) {
      return entries
        .sort((a, b) => Number(a[0]) - Number(b[0]))
        .map(([, value]) => value as NavItem)
    }

    return entries.map(([, value]) => value as NavItem)
  }

  return defaultNavItems
}
```

2. **类型安全的翻译系统**：
```typescript
export type NavKey = 'download' | 'developer' | 'customer'
export type NavTranslations = Record<'en' | 'zh', {
  nav: Record<NavKey, string>
  navChildren: Record<NavSubKey, string>
}>

const nav: Record<NavKey, string> =
  translations[locale]?.nav ??
  defaultTranslations[locale]?.nav ??
  defaultTranslations.en.nav
```

3. **Framer Motion 集成**：
```typescript
import { motion, useReducedMotion } from '@a2ui-web/animations/motion'

const shouldReduceMotion = useReducedMotion()

<motion.nav
  initial={{ y: -100 }}
  animate={{ y: 0 }}
  className="auicom:fixed auicom:top-0 auicom:left-0 auicom:right-0"
>
  {/* ... */}
</motion.nav>
```

4. **事件驱动的用户交互**：
```typescript
// Navbar 组件通过事件将 locale 切换交给宿主处理
const handleLocaleToggle = () => {
  const nextLocale = locale === "en" ? "zh" : "en";
  emitUserAction({
    name: toggleLocaleAction?.name ?? "toggle-locale",
    surfaceId,
    componentId: component.id,
    context: { nextLocale },
  });
};

// 宿主应用监听事件并处理
<A2UIRenderer
  onUserAction={(msg) => {
    if (msg.userAction.name === "toggle-locale") {
      const nextLocale = msg.userAction.context?.nextLocale;
      // 宿主应用处理 locale 切换逻辑
      setAppLocale(nextLocale);
    }
  }}
/>
```

## 样式系统

### Tailwind CSS with auicom 前缀

所有组件样式使用 `auicom:` 前缀隔离：

```typescript
<div className="auicom:flex auicom:items-center auicom:gap-4 auicom:p-6">
  <span className="auicom:text-2xl auicom:font-bold">Title</span>
</div>
```

**为什么需要前缀？**
- ✅ 避免与宿主项目样式冲突
- ✅ Tailwind CSS v4 配置自动生成前缀
- ✅ 清晰标识 A2UI 组件样式

### CSS 导入

```typescript
// 在应用入口导入
import '@a2ui-web/a2ui-react-renderer/styles.css'
```

## 最佳实践

### 1. 组件文件组织

```
my-component/
├── index.tsx              # 主组件（Server Component）
├── my-component.client.tsx # Client Component
├── my-component-types.ts  # TypeScript 类型
├── my-component-data.ts   # 默认数据和常量
└── sub-components/        # 子组件
    ├── header.tsx
    └── footer.tsx
```

### 2. 类型定义

```typescript
// my-component-types.ts
export type MyComponentKey = 'home' | 'about' | 'contact'

export type MyComponentItem = {
  key: MyComponentKey
  href?: string
  icon?: string
}

export type MyComponentTranslations = Record<
  'en' | 'zh',
  Record<MyComponentKey, string>
>
```

### 3. 默认值和回退

```typescript
// my-component-data.ts
import type { MyComponentItem, MyComponentTranslations } from './my-component-types'

export const defaultItems: MyComponentItem[] = [
  { key: 'home', href: '#', icon: 'Home' },
  { key: 'about', href: '#', icon: 'Info' }
]

export const defaultTranslations: MyComponentTranslations = {
  en: {
    home: 'Home',
    about: 'About'
  },
  zh: {
    home: '首页',
    about: '关于'
  }
}
```

### 4. Props 验证和标准化

```typescript
function normalizeData(raw: unknown, defaultData: any) {
  // 1. 解析 ValueMap
  const parsed = valueMapToObject(raw)

  // 2. 验证类型
  if (!parsed || typeof parsed !== 'object') {
    return defaultData
  }

  // 3. 标准化结构
  if (Array.isArray(parsed)) {
    return parsed.length > 0 ? parsed : defaultData
  }

  // 4. 处理特殊情况
  return parsed
}
```

### 5. 错误处理

```typescript
function MyComponent({ component, processor, surfaceId }: A2UIComponentProps) {
  try {
    const data = useA2UIValue(component.properties?.data, [], processor, component, surfaceId)

    if (!data || data.length === 0) {
      return (
        <div className="auicom:p-4 auicom:text-gray-500">
          No data available
        </div>
      )
    }

    return <div>{/* render data */}</div>

  } catch (error) {
    console.error('Component error:', error)
    return (
      <div className="auicom:p-4 auicom:text-red-500">
        Error loading component
      </div>
    )
  }
}
```

## 插件系统

### 创建组件插件

```typescript
import { defineComponentPlugin } from '@a2ui-web/a2ui-react-renderer'
import { StatCard } from './stat-card'
import { ProgressBar } from './progress-bar'
import { DataTable } from './data-table'

export const myComponentsPlugin = defineComponentPlugin(({ register }) => {
  register('StatCard', StatCard)
  register('ProgressBar', ProgressBar)
  register('DataTable', DataTable)
})
```

### 使用插件

```typescript
import { ComponentCatalog } from '@a2ui-web/a2ui-react-renderer'
import { myComponentsPlugin } from './plugins/my-components'

const catalog = new ComponentCatalog()
catalog.use(myComponentsPlugin)

<A2UIRenderer catalog={catalog} surfaceId="app" />
```

## 调试技巧

### 1. 查看原始 Props

```typescript
function MyComponent({ component }: A2UIComponentProps) {
  useEffect(() => {
    console.log('Component props:', component.properties)
  }, [component])

  // ...
}
```

### 2. 监听数据更新

```typescript
import { ensureProcessorEventEmitter } from '@a2ui-web/a2ui-react-renderer'

function DebugComponent({ processor }: A2UIComponentProps) {
  useEffect(() => {
    const emitter = ensureProcessorEventEmitter(processor)

    const unsubscribe = emitter.subscribe(() => {
      console.log('Data updated:', processor.getData())
    })

    return unsubscribe
  }, [processor])

  return null
}
```

### 3. 检查 BoundValue 解析

```typescript
const value = useA2UIValue(component.properties?.value, null, processor, component, surfaceId)

useEffect(() => {
  console.log('Raw prop:', component.properties?.value)
  console.log('Resolved value:', value)
}, [component.properties?.value, value])
```

## 常见问题

### Q: 数据不更新？

**A**: 检查事件系统是否正常工作：

```typescript
// 确保使用 useA2UIValue，而不是直接访问 processor.getData()
// ❌ 错误
const data = processor.getData(component, 'path', surfaceId)

// ✅ 正确
const data = useA2UIValue(component.properties?.data, [], processor, component, surfaceId)
```

### Q: 组件未找到？

**A**: 检查注册：

```typescript
// 1. 组件已注册
catalog.register('MyComponent', MyComponent)

// 2. 类型名称匹配
{
  component: {
    MyComponent: { /* ... */ }  // 必须与注册名称一致
  }
}
```

### Q: 样式不生效？

**A**: 检查：

1. CSS 已导入：`import '@a2ui-web/a2ui-react-renderer/styles.css'`
2. 使用 `auicom:` 前缀：`className="auicom:flex"`
3. Tailwind 配置扫描了包：
```javascript
// tailwind.config.js
export default {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './node_modules/@a2ui-web/a2ui-react-renderer/**/*.{js,ts,jsx,tsx}'
  ]
}
```

### Q: TypeScript 类型错误？

**A**: 使用正确的类型：

```typescript
import type { A2UIComponentProps } from '@a2ui-web/a2ui-react-renderer'
import type { v0_8 } from '@a2ui/lit'

// 组件 Props
const props: A2UIComponentProps = { /* ... */ }

// Processor 类型
const processor: InstanceType<typeof v0_8.Data.A2uiMessageProcessor>
```

## 性能优化

### 1. 组件 Memo（自动）

ComponentRenderer 已使用 `React.memo`，无需手动优化。

### 2. 数据标准化缓存

```typescript
import { useMemo } from 'react'

function MyComponent({ component, processor, surfaceId }: A2UIComponentProps) {
  const rawItems = useA2UIValue(/* ... */)

  const normalizedItems = useMemo(() => {
    return normalizeItems(rawItems)
  }, [rawItems])

  return <div>{/* use normalizedItems */}</div>
}
```

### 3. 避免重复解析

```typescript
// ✅ 推荐：一次解析，多次使用
const translations = useA2UIValue(/* ... */)
const nav = useMemo(() => translations[locale]?.nav, [translations, locale])

// ❌ 不推荐：多次调用 useA2UIValue
const nav1 = useA2UIValue(component.properties?.nav1, /* ... */)
const nav2 = useA2UIValue(component.properties?.nav2, /* ... */)
```

## 参考资源

- [A2UI React Renderer 主技能](../a2ui-react-renderer/SKILL.md)
- [示例文档](examples.md)
- [API 参考](reference.md)
- [A2UI 0.8 协议规范](https://github.com/a2ui/spec)
