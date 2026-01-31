# a2ui-react-renderer 实际架构参考

本文档详细说明了 `a2ui-react-renderer` 包的实际架构和实现模式，作为 shadcn/ui 组件迁移的参考指南。

## 项目结构

```
a2ui-react-renderer/src/
├── A2UIRenderer.tsx          # 主渲染器（事件驱动，无轮询）
├── types.ts                   # 核心类型定义
├── index.ts                   # 导出入口
├── a2ui-components/           # A2UI 组件实现
│   └── navbar/                # Navbar 组件示例
│       ├── index.tsx          # 组件入口（服务端安全）
│       ├── nav.client.tsx     # 客户端组件
│       ├── nav-types.ts       # 类型定义
│       ├── nav-data.ts        # 默认数据
│       ├── nav-item.tsx       # 子组件
│       ├── nav-menu.tsx       # 子组件
│       ├── nav-actions.tsx    # 子组件
│       ├── nav-brand.tsx      # 子组件
│       ├── glass-panel.tsx    # 子组件
│      
├── catalog/                   # 组件注册系统
│   ├── ComponentCatalog.ts    # 目录类
│   ├── defaultCatalog.ts      # 默认组件注册
│   └── plugins.ts             # 插件系统
├── components/                # 渲染器核心组件
│   └── ComponentRenderer.tsx  # 动态组件渲染
├── context/                   # React Context
│   ├── A2UIProvider.tsx       # 全局环境 Provider
│   └── CatalogContext.tsx     # 组件目录 Context
├── hooks/                     # React Hooks
│   └── useA2UIValue.ts        # 数据绑定 Hook
├── utils/                     # 工具函数
│   ├── processorEvents.ts     # 事件系统（包装 processor）
│   ├── userAction.ts          # 用户操作工具
│   └── valueMap.ts            # ValueMap 工具
└── ssr/                       # SSR 支持（如果有）
```

## 核心架构

### 1. 主渲染器 (A2UIRenderer)

**特性**：
- **事件驱动**：使用 `useSyncExternalStore` 订阅 processor 变更，无轮询
- **React 17+ 兼容**：使用 `use-sync-external-store/shim`
- **SSR 支持**：支持 `initialSnapshot` 避免闪烁
- **组件目录系统**：通过 `ComponentCatalog` 动态加载组件

**关键代码**：
```typescript
export function A2UIRenderer({
  processor,
  surfaceId,
  catalog,
  catalogById,
  catalogId,
  onUserAction,
  onSurfaceMissing,
  initialSnapshot,
}: A2UIRendererProps) {
  // 1. 获取 processor（从 props 或 context）
  const env = useA2UIEnvironment()
  const effectiveProcessor = processor ?? env?.processor

  // 2. 创建事件发射器（包装 processor 方法）
  const emitter = useMemo(
    () => ensureProcessorEventEmitter(effectiveProcessor),
    [effectiveProcessor]
  )

  // 3. 计算 snapshot
  const computeSnapshot = useCallback(() => {
    const surface = effectiveProcessor.getSurfaces().get(surfaceId)
    return {
      tree: surface?.componentTree ?? null,
      version: surface?.components.size ?? 0,
      exists: !!surface,
    }
  }, [processor, surfaceId])

  // 4. 订阅变更（事件驱动）
  const snapshot = useSyncExternalStore(
    emitter.subscribe,  // 订阅函数
    computeSnapshot,    // 获取快照
    () => initialSnapshot ?? computeSnapshot()  // SSR 快照
  )

  // 5. 渲染组件树
  return (
    <CatalogProvider catalog={activeCatalog}>
      <ComponentRenderer
        node={snapshot.tree}
        processor={effectiveProcessor}
        surfaceId={surfaceId}
        emitUserAction={emitUserAction}
      />
    </CatalogProvider>
  )
}
```

### 2. 事件系统 (processorEvents.ts)

**目的**：将 processor 的方法调用转换为事件通知，支持 React 订阅。

**实现原理**：
```typescript
export function ensureProcessorEventEmitter(processor: Processor): Emitter {
  // 1. 创建事件发射器
  const target = new SimpleEmitter()

  // 2. 包装 processor 的关键方法
  const patchKeys = ['processMessages', 'clearSurfaces', 'setData']

  for (const key of patchKeys) {
    const original = processor[key]
    const wrapped = (...args) => {
      const result = original.apply(processor, args)
      target.notify()  // 方法调用后触发通知
      return result
    }
    processor[key] = wrapped
  }

  return {
    subscribe: target.subscribe,  // 组件订阅
    notify: target.notify,         // 触发更新
  }
}

class SimpleEmitter {
  private listeners = new Set<() => void>()

  subscribe = (fn: () => void) => {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  notify = () => {
    queueMicrotask(() => {
      for (const fn of this.listeners) {
        fn()
      }
    })
  }
}
```

**关键点**：
- 包装 processor 方法，调用后自动触发通知
- 使用 `queueMicrotask` 批量更新
- 无轮询，完全事件驱动

### 3. 组件目录系统 (ComponentCatalog)

**目的**：动态注册和查找组件，支持运行时扩展。

**核心类**：
```typescript
export class ComponentCatalog {
  private catalog = new Map<string, React.ComponentType<A2UIComponentProps>>()

  register(name: string, component: React.ComponentType<A2UIComponentProps>): void {
    this.catalog.set(name, component)
  }

  get(name: string): React.ComponentType<A2UIComponentProps> | undefined {
    return this.catalog.get(name)
  }

  has(name: string): boolean {
    return this.catalog.has(name)
  }

  getRegisteredComponents(): string[] {
    return Array.from(this.catalog.keys())
  }

  // 插件系统
  use(plugin: ComponentPlugin): void {
    plugin({
      catalog: this,
      register: this.register.bind(this),
      has: this.has.bind(this),
      get: this.get.bind(this),
      getRegisteredComponents: this.getRegisteredComponents.bind(this),
    })
  }
}
```

**默认目录**：
```typescript
// defaultCatalog.ts
import { Navbar } from '../a2ui-components/navbar'

const defaultComponents = [
  ['Navbar', Navbar]
]

export function getDefaultCatalog(): ComponentCatalog {
  const catalog = new ComponentCatalog()
  for (const [name, component] of defaultComponents) {
    catalog.register(name, component)
  }
  return catalog
}
```

### 4. 组件渲染器 (ComponentRenderer)

**目的**：根据组件类型动态渲染组件。

```typescript
const ComponentRendererBase = ({
  node,
  processor,
  surfaceId,
  emitUserAction,
}: ComponentRendererProps) => {
  const catalog = useCatalog()  // 从 Context 获取目录

  const componentType = node.type
  const Component = useMemo(() => catalog.get(componentType), [catalog, componentType])

  if (!Component) {
    console.warn(`未知组件类型：${componentType}`)
    return <div>未知组件：{componentType}</div>
  }

  return (
    <Component
      component={node}
      processor={processor}
      surfaceId={surfaceId}
      emitUserAction={emitUserAction}
    />
  )
}

// 使用 memo 优化性能
export const ComponentRenderer = memo(ComponentRendererBase, ...)
```

### 5. 数据绑定 Hook (useA2UIValue)

**目的**：解析 A2UI 的 BoundValue 到实际值，支持响应式更新。

**支持的值类型**：
1. **字面量**：`{ literalString: 'hello' }` / `{ literalNumber: 42 }` / `{ literalBoolean: true }`
2. **路径绑定**：`{ path: '/user/name' }`
3. **ValueMap**：`{ valueString: 'hello' }` / `{ valueNumber: 42 }` / `{ valueBoolean: true }`
4. **原始值**：`'hello'` / `42` / `true`

**实现**：
```typescript
export function useA2UIValue<T = string | number | boolean>(
  prop: unknown,
  defaultValue: T,
  processor: Processor,
  component: AnyComponentNode,
  surfaceId: string
): T {
  // 1. 解析函数
  const resolveNow = useCallback((): T => {
    if (prop === null || prop === undefined) {
      return defaultValue
    }

    // 原始值
    if (typeof prop === 'number' || typeof prop === 'boolean' || typeof prop === 'string') {
      if (typeof prop === 'string') {
        const resolved = processor.getData(component, prop, surfaceId)
        if (resolved !== null && resolved !== undefined) {
          return normalizeResolved(resolved as T)
        }
      }
      return prop as T
    }

    // 对象值
    if (typeof prop === 'object') {
      const obj = prop as Record<string, unknown>

      // 字面量
      if ('literalString' in obj) return obj.literalString as T
      if ('literalNumber' in obj) return obj.literalNumber as T
      if ('literalBoolean' in obj) return obj.literalBoolean as T

      // 路径绑定
      if ('path' in obj && typeof obj.path === 'string') {
        const resolved = processor.getData(component, obj.path, surfaceId)
        if (resolved !== null && resolved !== undefined) {
          return normalizeResolved(resolved as T)
        }
        return defaultValue
      }

      // ValueMap
      if ('valueString' in obj) return obj.valueString as T
      if ('valueNumber' in obj) return obj.valueNumber as T
      if ('valueBoolean' in obj) return obj.valueBoolean as T
    }

    return defaultValue
  }, [prop, processor, component, surfaceId, defaultValue])

  // 2. 订阅 processor 变更
  const [value, setValue] = useState<T>(resolveNow)
  const emitter = useMemo(() => ensureProcessorEventEmitter(processor), [processor])

  useEffect(() => {
    const resolveValue = () => setValue(resolveNow())
    setValue(resolveNow())
    const unsubscribe = emitter.subscribe(resolveValue)
    return () => unsubscribe()
  }, [resolveNow, emitter])

  return value
}
```

**关键特性**：
- 支持多种值类型（字面量、路径、ValueMap）
- 响应式：订阅 processor 变更自动更新
- 类型安全：泛型参数 `<T>`

### 6. 用户操作工具 (userAction.ts)

**目的**：标准化用户操作消息构建。

```typescript
export interface UserActionParams {
  name: string
  surfaceId: string
  componentId: string
  context?: Record<string, unknown>
  timestamp?: string
}

export function buildUserAction(params: UserActionParams): UserActionMessage {
  return {
    userAction: {
      name: params.name,
      surfaceId: params.surfaceId,
      sourceComponentId: params.componentId,
      timestamp: params.timestamp ?? new Date().toISOString(),
      context: params.context && Object.keys(params.context).length
        ? params.context
        : undefined,
    },
  }
}

export function emitUserAction(
  emit: ((message: UserActionMessage) => void) | undefined,
  params: UserActionParams
): void {
  if (!emit) return
  emit(buildUserAction(params))
}
```

### 7. ValueMap 工具 (valueMap.ts)

**目的**：构造和解析 A2UI ValueMap 数据结构。

```typescript
// 构造函数
export const valueString = (key: string, valueString: string): ValueMapEntry => ({
  key,
  valueString,
})

export const valueNumber = (key: string, valueNumber: number): ValueMapEntry => ({
  key,
  valueNumber,
})

export const valueBoolean = (key: string, valueBoolean: boolean): ValueMapEntry => ({
  key,
  valueBoolean,
})

export const valueMap = (key: string, valueMap: ValueMapEntry[]): ValueMapEntry => ({
  key,
  valueMap,
})

// 解析函数
export function valueMapToObject(map: ValueMapEntry[] | undefined): unknown {
  if (!Array.isArray(map)) return map
  const result: Record<string, unknown> = {}
  for (const entry of map) {
    if (!entry?.key) continue
    if ('valueMap' in entry && Array.isArray(entry.valueMap)) {
      result[entry.key] = valueMapToObject(entry.valueMap)  // 递归
    } else if ('valueString' in entry) {
      result[entry.key] = entry.valueString
    } else if ('valueNumber' in entry) {
      result[entry.key] = entry.valueNumber
    } else if ('valueBoolean' in entry) {
      result[entry.key] = entry.valueBoolean
    }
  }
  return result
}
```

## 组件实现模式（以 Navbar 为例）

### 组件结构

Navbar 组件采用了**服务端/客户端分离**的架构：

```
navbar/
├── index.tsx           # 服务端组件（数据解析）
├── nav.client.tsx      # 客户端组件（交互逻辑）
├── nav-types.ts        # TypeScript 类型
├── nav-data.ts         # 默认数据
└── [子组件].tsx        # 子组件
```

### 服务端组件 (index.tsx)

**职责**：
1. 使用 `useA2UIValue` 解析组件属性
2. 处理默认值和数据规范化
3. 传递数据到客户端组件

```typescript
export function Navbar(props: NavbarProps) {
  const { component, surfaceId, emitUserAction, processor } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // 解析各个属性
  const locale = useA2UIValue<'en' | 'zh'>(
    componentProps.locale,
    'en',
    processor,
    component,
    surfaceId
  )

  const translations = useA2UIValue<NavTranslations>(
    componentProps.translations,
    defaultTranslations,
    processor,
    component,
    surfaceId
  )

  const navItems = normalizeNavItems(
    useA2UIValue(componentProps.navItems, defaultNavItems, processor, component, surfaceId)
  )

  const navAlign = useA2UIValue<NavAlignment>(
    componentProps.navAlign,
    'center',
    processor,
    component,
    surfaceId
  )

  // 传递到客户端组件
  return (
    <NavClient
      component={component}
      processor={processor}
      surfaceId={surfaceId}
      emitUserAction={emitUserAction}
      locale={locale}
      nav={nav}
      navChildren={navChildren}
      navItems={navItems}
      navAlign={navAlign}
    />
  )
}
```

### 客户端组件 (nav.client.tsx)

**职责**：
1. 处理客户端状态（`useState`, `useEffect`）
2. 浏览器 API（`window`, `document`）
3. 用户交互逻辑

```typescript
'use client'

export function NavClient({
  component,
  processor,
  surfaceId,
  emitUserAction,
  locale,
  nav,
  navChildren,
  navItems,
  navAlign,
}: NavClientProps) {
  // 客户端状态
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // 浏览器 API
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 用户操作
  const handleItemClick = (item: NavItem) => {
    emitUserAction?.(
      buildUserAction({
        name: 'nav.item.click',
        surfaceId,
        componentId: component.id,
        context: { href: item.href, label: item.label },
      })
    )
  }

  // 渲染
  return (
    <nav className={cn(/* ... */)}>
      {/* 组件内容 */}
    </nav>
  )
}
```

### 类型定义 (nav-types.ts)

```typescript
export interface NavItem {
  href: string
  label: string
  subItems?: NavSubItem[]
  badge?: string
}

export interface NavSubItem {
  href: string
  label: string
  description?: string
}

export type NavAlignment = 'left' | 'center' | 'right'

export type NavKey = 'home' | 'about' | 'services' | 'contact'
export type NavSubKey = 'web' | 'mobile' | 'design'

export interface NavTranslations {
  [locale: string]: {
    nav: Record<NavKey, string>
    navChildren: Record<NavSubKey, string>
  }
}
```

### 默认数据 (nav-data.ts)

```typescript
export const defaultNavItems: NavItem[] = [
  { href: '/', label: 'Home' },
  {
    href: '/services',
    label: 'Services',
    subItems: [
      { href: '/services/web', label: 'Web Development' },
      { href: '/services/mobile', label: 'Mobile Apps' },
    ],
  },
]

export const defaultTranslations: NavTranslations = {
  en: {
    nav: {
      home: 'Home',
      about: 'About',
      services: 'Services',
      contact: 'Contact',
    },
    navChildren: {
      web: 'Web Development',
      mobile: 'Mobile Apps',
      design: 'UI/UX Design',
    },
  },
  zh: {
    nav: {
      home: '首页',
      about: '关于',
      services: '服务',
      contact: '联系',
    },
    navChildren: {
      web: '网页开发',
      mobile: '移动应用',
      design: 'UI/UX 设计',
    },
  },
}
```

## 核心类型定义 (types.ts)

```typescript
export type BoundValue =
  | { literalString: string }
  | { literalNumber: number }
  | { literalBoolean: boolean }
  | { path: string }
  | { valueString: string }
  | { valueNumber: number }
  | { valueBoolean: boolean }

export interface A2UIComponentProps {
  component: v0_8.Types.AnyComponentNode
  processor: InstanceType<typeof v0_8.Data.A2uiMessageProcessor>
  surfaceId: string
  weight?: string | number
  emitUserAction?: (message: UserActionMessage) => void
}

export interface UserActionMessage {
  userAction: {
    name: string
    surfaceId: string
    sourceComponentId: string
    timestamp: string
    context?: Record<string, unknown>
  }
}

export interface ActionContextEntry {
  key: string
  value: BoundValue
}
```

## 关键设计原则

### 1. 事件驱动，无轮询

- 使用 `ensureProcessorEventEmitter` 包装 processor
- 利用 `useSyncExternalStore` 订阅变更
- 性能优于轮询方案

### 2. React 17+ 兼容

- 使用 `use-sync-external-store/shim`
- 避免使用 React 18 专属 API

### 3. SSR 支持

- `initialSnapshot` 参数避免首次渲染闪烁
- 服务端/客户端组件分离
- `'use client'` 指令标记客户端代码

### 4. 组件目录系统

- 动态注册组件
- 支持运行时扩展
- 插件化架构

### 5. 类型安全

- 严格的 TypeScript 类型
- `A2UIComponentProps` 统一接口
- 泛型 `useA2UIValue<T>`

### 6. 性能优化

- `React.memo` 优化组件渲染
- `useMemo` / `useCallback` 缓存计算
- 批量更新（`queueMicrotask`）

## 与 shadcn/ui 集成

### 导入 shadcn/ui 组件

```typescript
import { Button } from '@a2ui-web/shadcn-ui/components/button'
import { Card } from '@a2ui-web/shadcn-ui/components/card'
import { Dialog } from '@a2ui-web/shadcn-ui/components/dialog'
import { cn } from '@a2ui-web/shadcn-ui/lib/utils'
```

### 使用 Tailwind CSS

```typescript
<div className={cn(
  'flex items-center gap-2',
  scrolled && 'shadow-md',
  isMobileOpen && 'bg-background'
)}>
```

### 主题系统

```typescript
// 使用 CSS 变量
<button className="bg-primary text-primary-foreground">
  Click me
</button>

// 使用 next-themes 切换主题
import { useTheme } from 'next-themes'

const { theme, setTheme } = useTheme()
setTheme('dark')
```

## 常见模式总结

### 模式 1: 简单属性解析

```typescript
const label = useA2UIValue(
  componentProps.label,
  'Default Label',
  processor,
  component,
  surfaceId
)
```

### 模式 2: 复杂对象解析

```typescript
const items = useA2UIValue<Item[]>(
  componentProps.items,
  defaultItems,
  processor,
  component,
  surfaceId
)
```

### 模式 3: 用户操作

```typescript
const handleClick = () => {
  emitUserAction(emitUserActionProp, {
    name: 'button.click',
    surfaceId,
    componentId: component.id,
    context: { value: someValue },
  })
}
```

### 模式 4: 服务端/客户端分离

```typescript
// index.tsx (服务端)
export function MyComponent(props: A2UIComponentProps) {
  const data = useA2UIValue(...)
  return <MyComponentClient data={data} {...props} />
}

// my-component.client.tsx (客户端)
'use client'
export function MyComponentClient({ data, ...props }) {
  const [state, setState] = useState()
  // 客户端逻辑
}
```

### 模式 5: 组件注册

```typescript
// defaultCatalog.ts
import { MyComponent } from '../a2ui-components/my-component'

const defaultComponents = [
  ['MyComponent', MyComponent],
  // ... 其他组件
]
```
