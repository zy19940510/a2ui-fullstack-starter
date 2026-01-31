# shadcn/ui 组件迁移完整指南

本文档提供将 shadcn/ui 组件迁移到 a2ui-react-renderer 的完整步骤和最佳实践。

## 迁移工作流

### 步骤 1: 确定组件对应关系

查看 A2UI 0.8 规范中的组件类型，确定要实现的组件：

| A2UI 组件 | shadcn/ui 组件 | 复杂度 | 优先级 |
|-----------|----------------|--------|--------|
| **Button** | Button | 低 | 高 |
| **Text** | Typography | 低 | 高 |
| **Card** | Card | 低 | 高 |
| **TextField** | Input + Label | 中 | 高 |
| **Checkbox** | Checkbox + Label | 低 | 高 |
| **Modal** | Dialog | 中 | 高 |
| **Tabs** | Tabs | 中 | 高 |
| **Row** | div (flex-row) | 低 | 高 |
| **Column** | div (flex-col) | 低 | 高 |
| **List** | div (flex) | 低 | 中 |
| **Image** | img | 低 | 中 |
| **Icon** | Lucide icons | 低 | 中 |
| **Divider** | Separator | 低 | 中 |
| **Slider** | Slider | 低 | 中 |
| **MultipleChoice** | Checkbox Group / Radio Group | 中 | 中 |
| **DateTimeInput** | Calendar + Input | 高 | 低 |
| **Video** | video element | 低 | 低 |
| **AudioPlayer** | audio element | 低 | 低 |

### 步骤 2: 创建组件目录结构

在 `a2ui-react-renderer/src/a2ui-components/` 下创建组件目录：

```bash
# 简单组件（单文件）
a2ui-components/
└── button/
    └── index.tsx

# 复杂组件（多文件）
a2ui-components/
└── tabs/
    ├── index.tsx          # 服务端组件
    ├── tabs.client.tsx    # 客户端组件
    ├── tabs-types.ts      # 类型定义
    └── tabs-data.ts       # 默认数据（如果需要）
```

**命名约定**：
- 目录名：小写 + 短横线（`button`, `text-field`, `date-time-input`）
- 文件名：小写 + 短横线
- 组件名：PascalCase（`Button`, `TextField`, `DateTimeInput`）
- 服务端组件：`index.tsx`
- 客户端组件：`*.client.tsx`

### 步骤 3: 定义 TypeScript 类型

基于 A2UI 0.8 规范定义组件接口（无需创建单独的类型文件，直接使用 `@a2ui-web/lit-core` 的类型）：

```typescript
// 导入 A2UI 核心类型
import type * as v0_8 from '@a2ui-web/lit-core'

// 使用现有类型
type ButtonNode = Extract<v0_8.Types.AnyComponentNode, { type: 'Button' }>
type TextNode = Extract<v0_8.Types.AnyComponentNode, { type: 'Text' }>

// 组件 Props 使用统一接口
import type { A2UIComponentProps } from '../../types'

// 如果需要扩展 props（如传递解析后的数据到客户端组件）
interface ButtonClientProps extends A2UIComponentProps {
  resolvedLabel?: string
  onClick?: () => void
}
```

### 步骤 4: 实现服务端组件

创建 `index.tsx`，负责数据解析：

```typescript
// a2ui-components/button/index.tsx
import { useA2UIValue } from '../../hooks/useA2UIValue'
import type { A2UIComponentProps } from '../../types'
import { ComponentRenderer } from '../../components/ComponentRenderer'
import { Button as ShadcnButton } from '@a2ui-web/shadcn-ui/components/button'
import { cn } from '@a2ui-web/shadcn-ui/lib/utils'
import { emitUserAction } from '../../utils/userAction'

export function Button(props: A2UIComponentProps) {
  const { component, processor, surfaceId, emitUserAction: emitUserActionProp } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // 1. 解析 action（如果有）
  const action = componentProps.action as { name?: string; context?: unknown[] } | undefined

  // 2. 处理点击事件
  const handleClick = () => {
    if (!action?.name) return

    emitUserAction(emitUserActionProp, {
      name: action.name,
      surfaceId,
      componentId: component.id,
      // TODO: 解析 action.context
    })
  }

  // 3. 渲染按钮 + 子组件
  return (
    <ShadcnButton
      onClick={handleClick}
      className={cn(/* 主题类 */)}
      data-component-id={component.id}
    >
      {/* 渲染 child 组件 */}
      {componentProps.child && (
        <ComponentRenderer
          node={componentProps.child as v0_8.Types.AnyComponentNode}
          processor={processor}
          surfaceId={surfaceId}
          emitUserAction={emitUserActionProp}
        />
      )}
    </ShadcnButton>
  )
}
```

**关键点**：
- 使用 `useA2UIValue` 解析属性
- 使用 `ComponentRenderer` 渲染子组件
- 使用 `emitUserAction` 处理用户操作
- 添加 `data-component-id` 用于调试

### 步骤 5: 实现客户端组件（如果需要）

如果组件需要客户端状态或浏览器 API，创建 `*.client.tsx`：

```typescript
// a2ui-components/tabs/tabs.client.tsx
'use client'

import { useState } from 'react'
import {
  Tabs as ShadcnTabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@a2ui-web/shadcn-ui/components/tabs'
import { ComponentRenderer } from '../../components/ComponentRenderer'
import type * as v0_8 from '@a2ui-web/lit-core'

interface TabsClientProps {
  component: v0_8.Types.AnyComponentNode
  processor: InstanceType<typeof v0_8.Data.A2uiMessageProcessor>
  surfaceId: string
  emitUserAction?: (message: unknown) => void
  tabItems: Array<{
    title: string
    child: v0_8.Types.AnyComponentNode
  }>
}

export function TabsClient({
  component,
  processor,
  surfaceId,
  emitUserAction,
  tabItems,
}: TabsClientProps) {
  const [activeTab, setActiveTab] = useState(tabItems[0]?.child.id || '')

  return (
    <ShadcnTabs
      value={activeTab}
      onValueChange={setActiveTab}
      data-component-id={component.id}
    >
      <TabsList>
        {tabItems.map((item, index) => (
          <TabsTrigger key={item.child.id} value={item.child.id}>
            {item.title}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabItems.map((item) => (
        <TabsContent key={item.child.id} value={item.child.id}>
          <ComponentRenderer
            node={item.child}
            processor={processor}
            surfaceId={surfaceId}
            emitUserAction={emitUserAction}
          />
        </TabsContent>
      ))}
    </ShadcnTabs>
  )
}
```

然后在 `index.tsx` 中：

```typescript
// a2ui-components/tabs/index.tsx
import { useA2UIValue } from '../../hooks/useA2UIValue'
import type { A2UIComponentProps } from '../../types'
import { TabsClient } from './tabs.client'

export function Tabs(props: A2UIComponentProps) {
  const { component, processor, surfaceId, emitUserAction } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // 解析 tabItems
  const tabItems = componentProps.tabItems as Array<{
    title: unknown
    child: unknown
  }> || []

  const resolvedTabItems = tabItems.map((item) => ({
    title: useA2UIValue(item.title, '', processor, component, surfaceId),
    child: item.child,
  }))

  return (
    <TabsClient
      component={component}
      processor={processor}
      surfaceId={surfaceId}
      emitUserAction={emitUserAction}
      tabItems={resolvedTabItems}
    />
  )
}
```

### 步骤 6: 注册组件

在 `catalog/defaultCatalog.ts` 中注册组件：

```typescript
import { Button } from '../a2ui-components/button'
import { Tabs } from '../a2ui-components/tabs'
import { Navbar } from '../a2ui-components/navbar'

const defaultComponents: Array<[string, React.ComponentType<A2UIComponentProps>]> = [
  ['Navbar', Navbar],
  ['Button', Button],
  ['Tabs', Tabs],
  // ... 其他组件
]

export function getDefaultCatalog(): ComponentCatalog {
  if (cached) return cached
  const catalog = new ComponentCatalog()
  for (const [name, component] of defaultComponents) {
    catalog.register(name, component)
  }
  cached = catalog
  return catalog
}
```

**注意**：组件名必须与 A2UI 协议中的 `type` 字段完全匹配。

### 步骤 7: 测试组件

创建测试用例（可选）：

```typescript
// a2ui-components/button/__tests__/button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from '../index'
import type * as v0_8 from '@a2ui-web/lit-core'

describe('Button', () => {
  it('renders child component', () => {
    const mockProcessor = createMockProcessor()
    const component: v0_8.Types.AnyComponentNode = {
      id: 'btn-1',
      type: 'Button',
      properties: {
        child: {
          id: 'text-1',
          type: 'Text',
          properties: {
            text: { literalString: 'Click me' },
            usageHint: 'body',
          },
        },
        action: {
          name: 'onClick',
        },
      },
    }

    render(
      <Button
        component={component}
        processor={mockProcessor}
        surfaceId="test"
      />
    )

    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('emits user action on click', () => {
    const mockEmit = jest.fn()
    // ... test implementation
  })
})
```

## 组件实现模式

### 模式 1: 简单叶组件（无子组件）

**示例**：Text, Icon, Image, Divider

```typescript
// a2ui-components/icon/index.tsx
import { useA2UIValue } from '../../hooks/useA2UIValue'
import type { A2UIComponentProps } from '../../types'
import * as Icons from '@a2ui-web/animations/icons'
import { cn } from '@a2ui-web/shadcn-ui/lib/utils'

export function Icon(props: A2UIComponentProps) {
  const { component, processor, surfaceId } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // 解析 icon 名称
  const name = useA2UIValue<string>(
    componentProps.name,
    'AlertCircle',
    processor,
    component,
    surfaceId
  )

  // 获取对应的 icon 组件
  const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[name]

  if (!IconComponent) {
    console.warn(`Icon not found: ${name}`)
    return <Icons.AlertCircle className="h-4 w-4 text-destructive" />
  }

  return (
    <IconComponent
      className={cn('h-4 w-4', /* 主题类 */)}
      data-component-id={component.id}
    />
  )
}
```

### 模式 2: 单子组件（Button, Card, Modal）

**示例**：Button

```typescript
// a2ui-components/button/index.tsx
import { Button as ShadcnButton } from '@a2ui-web/shadcn-ui/components/button'
import { ComponentRenderer } from '../../components/ComponentRenderer'
import { emitUserAction } from '../../utils/userAction'
import type { A2UIComponentProps } from '../../types'
import type * as v0_8 from '@a2ui-web/lit-core'

export function Button(props: A2UIComponentProps) {
  const { component, processor, surfaceId, emitUserAction: emitUserActionProp } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  const action = componentProps.action as { name?: string } | undefined

  const handleClick = () => {
    if (!action?.name) return
    emitUserAction(emitUserActionProp, {
      name: action.name,
      surfaceId,
      componentId: component.id,
    })
  }

  return (
    <ShadcnButton
      onClick={handleClick}
      data-component-id={component.id}
    >
      {componentProps.child && (
        <ComponentRenderer
          node={componentProps.child as v0_8.Types.AnyComponentNode}
          processor={processor}
          surfaceId={surfaceId}
          emitUserAction={emitUserActionProp}
        />
      )}
    </ShadcnButton>
  )
}
```

### 模式 3: 多子组件容器（Row, Column, List）

**示例**：Row

```typescript
// a2ui-components/row/index.tsx
import { ComponentRenderer } from '../../components/ComponentRenderer'
import { cn } from '@a2ui-web/shadcn-ui/lib/utils'
import type { A2UIComponentProps } from '../../types'
import type * as v0_8 from '@a2ui-web/lit-core'

const distributionClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  spaceBetween: 'justify-between',
  spaceAround: 'justify-around',
  spaceEvenly: 'justify-evenly',
}

const alignmentClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
}

export function Row(props: A2UIComponentProps) {
  const { component, processor, surfaceId, emitUserAction } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  const children = (componentProps.children as v0_8.Types.AnyComponentNode[]) ?? []
  const distribution = (componentProps.distribution as keyof typeof distributionClasses) ?? 'start'
  const alignment = (componentProps.alignment as keyof typeof alignmentClasses) ?? 'stretch'

  return (
    <div
      className={cn(
        'flex flex-row gap-2',
        distributionClasses[distribution],
        alignmentClasses[alignment]
      )}
      data-component-id={component.id}
    >
      {children.map((child) => (
        <ComponentRenderer
          key={child.id}
          node={child}
          processor={processor}
          surfaceId={surfaceId}
          emitUserAction={emitUserAction}
        />
      ))}
    </div>
  )
}
```

### 模式 4: 表单输入组件（TextField, Checkbox, Slider）

**示例**：TextField

```typescript
// a2ui-components/text-field/index.tsx
'use client'

import { useState, useEffect } from 'react'
import { Input } from '@a2ui-web/shadcn-ui/components/input'
import { Label } from '@a2ui-web/shadcn-ui/components/label'
import { Textarea } from '@a2ui-web/shadcn-ui/components/textarea'
import { useA2UIValue } from '../../hooks/useA2UIValue'
import type { A2UIComponentProps } from '../../types'

export function TextField(props: A2UIComponentProps) {
  const { component, processor, surfaceId } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // 解析属性
  const label = useA2UIValue(componentProps.label, '', processor, component, surfaceId)
  const initialText = useA2UIValue(componentProps.text, '', processor, component, surfaceId)
  const type = (componentProps.type as string) ?? 'shortText'

  // 本地状态
  const [value, setValue] = useState(initialText || '')

  // 同步外部变更
  useEffect(() => {
    if (initialText !== undefined) {
      setValue(initialText)
    }
  }, [initialText])

  // 处理输入
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value
    setValue(newValue)

    // 如果有 path 绑定，更新数据模型
    const textProp = componentProps.text as { path?: string } | undefined
    if (textProp?.path) {
      processor.setData(component, textProp.path, newValue, surfaceId)
    }
  }

  const isLongText = type === 'longText'
  const inputType = type === 'number' ? 'number' : type === 'date' ? 'date' : 'text'

  return (
    <div className="flex flex-col gap-2" data-component-id={component.id}>
      {label && <Label htmlFor={component.id}>{label}</Label>}

      {isLongText ? (
        <Textarea id={component.id} value={value} onChange={handleChange} />
      ) : (
        <Input id={component.id} type={inputType} value={value} onChange={handleChange} />
      )}
    </div>
  )
}
```

### 模式 5: 复杂状态组件（Modal, Tabs, Drawer）

**示例**：Modal

```typescript
// a2ui-components/modal/modal.client.tsx
'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@a2ui-web/shadcn-ui/components/dialog'
import { ComponentRenderer } from '../../components/ComponentRenderer'
import type * as v0_8 from '@a2ui-web/lit-core'

interface ModalClientProps {
  component: v0_8.Types.AnyComponentNode
  processor: InstanceType<typeof v0_8.Data.A2uiMessageProcessor>
  surfaceId: string
  emitUserAction?: (message: unknown) => void
  entryPointChild: v0_8.Types.AnyComponentNode
  contentChild: v0_8.Types.AnyComponentNode
}

export function ModalClient({
  component,
  processor,
  surfaceId,
  emitUserAction,
  entryPointChild,
  contentChild,
}: ModalClientProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <ComponentRenderer
            node={entryPointChild}
            processor={processor}
            surfaceId={surfaceId}
            emitUserAction={emitUserAction}
          />
        </div>
      </DialogTrigger>

      <DialogContent data-component-id={component.id}>
        <ComponentRenderer
          node={contentChild}
          processor={processor}
          surfaceId={surfaceId}
          emitUserAction={emitUserAction}
        />
      </DialogContent>
    </Dialog>
  )
}
```

```typescript
// a2ui-components/modal/index.tsx
import type { A2UIComponentProps } from '../../types'
import type * as v0_8 from '@a2ui-web/lit-core'
import { ModalClient } from './modal.client'

export function Modal(props: A2UIComponentProps) {
  const { component, processor, surfaceId, emitUserAction } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  const entryPointChild = componentProps.entryPointChild as v0_8.Types.AnyComponentNode
  const contentChild = componentProps.contentChild as v0_8.Types.AnyComponentNode

  if (!entryPointChild || !contentChild) {
    console.warn('Modal requires entryPointChild and contentChild')
    return null
  }

  return (
    <ModalClient
      component={component}
      processor={processor}
      surfaceId={surfaceId}
      emitUserAction={emitUserAction}
      entryPointChild={entryPointChild}
      contentChild={contentChild}
    />
  )
}
```

## 常见问题和解决方案

### 问题 1: useA2UIValue 在服务端组件中报错

**原因**：`useA2UIValue` 使用了 React hooks，必须在客户端组件中使用。

**解决方案**：
- 方案 A：将整个组件标记为 `'use client'`
- 方案 B：分离服务端/客户端组件，仅在客户端组件中使用 `useA2UIValue`

**推荐**：方案 B（参考 Navbar 的实现）

```typescript
// index.tsx (服务端)
export function MyComponent(props: A2UIComponentProps) {
  const { component, ...rest } = props
  const componentProps = component.properties as Record<string, unknown>

  // 直接传递原始 prop 到客户端
  return (
    <MyComponentClient
      rawLabel={componentProps.label}
      {...rest}
    />
  )
}

// my-component.client.tsx (客户端)
'use client'

export function MyComponentClient({ rawLabel, component, processor, surfaceId }) {
  // 在客户端解析
  const label = useA2UIValue(rawLabel, '', processor, component, surfaceId)
  return <div>{label}</div>
}
```

### 问题 2: 如何处理复杂的数据结构（如 navItems）

**解决方案**：使用 `valueMapToObject` 工具函数

```typescript
import { valueMapToObject } from '../../utils/valueMap'

function normalizeItems(raw: unknown): Item[] {
  const parsed = valueMapToObject(raw) as Item[] | Record<string, Item> | undefined

  if (Array.isArray(parsed)) {
    return parsed.length ? parsed : defaultItems
  }

  if (parsed && typeof parsed === 'object') {
    // 处理对象格式
    const entries = Object.entries(parsed)
    return entries.map(([, value]) => value)
  }

  return defaultItems
}
```

### 问题 3: 如何在组件中使用 Framer Motion 动画

**解决方案**：从 `@a2ui-web/animations` 导入

```typescript
import { motion } from '@a2ui-web/animations/motion'

export function AnimatedButton(props: A2UIComponentProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="auianim:rounded-lg auianim:bg-primary"
    >
      Click me
    </motion.button>
  )
}
```

**注意**：CSS 类使用 `auianim:` 前缀（来自 animations 包的 Tailwind 配置）

### 问题 4: 如何处理 Theme 系统

**当前状态**：项目暂未实现完整的 Theme 系统（A2UI 规范中的 `theme` 参数）

**临时方案**：直接使用 Tailwind CSS 类和 next-themes

```typescript
import { useTheme } from 'next-themes'

export function ThemedComponent() {
  const { theme, setTheme } = useTheme()

  return (
    <div className={cn(
      'p-4',
      theme === 'dark' ? 'bg-background text-foreground' : 'bg-white text-black'
    )}>
      {/* content */}
    </div>
  )
}
```

### 问题 5: 如何调试组件

**工具**：
1. **data-component-id 属性**：所有组件都应添加
   ```typescript
   <div data-component-id={component.id}>
   ```

2. **React DevTools**：检查组件树和 props

3. **Console 日志**：
   ```typescript
   console.log('Component props:', componentProps)
   console.log('Resolved value:', resolvedValue)
   ```

4. **TypeScript 类型检查**：
   ```typescript
   const typed = component as Extract<v0_8.Types.AnyComponentNode, { type: 'Button' }>
   console.log(typed.properties.action)  // 有类型提示
   ```

## 最佳实践

### 1. 始终使用 ComponentRenderer 渲染子组件

❌ **错误**：
```typescript
<div>
  {child}  // 不会正确渲染
</div>
```

✅ **正确**：
```typescript
<div>
  <ComponentRenderer
    node={child}
    processor={processor}
    surfaceId={surfaceId}
    emitUserAction={emitUserAction}
  />
</div>
```

### 2. 优先使用服务端组件

- 服务端组件可以更好地利用 RSC（React Server Components）
- 仅在需要客户端状态或浏览器 API 时使用 `'use client'`
- 参考 Navbar 的分离模式

### 3. 提供默认值

```typescript
const label = useA2UIValue(
  componentProps.label,
  'Default Label',  // 始终提供默认值
  processor,
  component,
  surfaceId
)
```

### 4. 处理空值情况

```typescript
const children = (componentProps.children as AnyComponentNode[]) ?? []

if (!children.length) {
  return <div>No children</div>
}
```

### 5. 使用 cn() 合并类名

```typescript
import { cn } from '@a2ui-web/shadcn-ui/lib/utils'

<div className={cn(
  'flex items-center',  // 基础类
  isMobile && 'flex-col',  // 条件类
  className  // 外部类
)} />
```

### 6. 组件注册后立即测试

每实现一个组件后：
1. 在 `defaultCatalog.ts` 中注册
2. 重启开发服务器
3. 创建测试消息并渲染

### 7. 遵循 A2UI 规范

- 组件名必须与 A2UI 规范的 `type` 字段匹配
- 属性名必须与规范定义一致
- 返回的数据结构必须符合规范

## 迁移检查清单

每个组件迁移完成后，检查以下项：

- [ ] 组件文件创建在正确的目录
- [ ] 导入了正确的 shadcn/ui 组件
- [ ] 使用 `useA2UIValue` 解析所有属性
- [ ] 使用 `ComponentRenderer` 渲染子组件
- [ ] 使用 `emitUserAction` 处理用户操作（如果适用）
- [ ] 添加 `data-component-id` 属性
- [ ] 在 `defaultCatalog.ts` 中注册
- [ ] 提供合理的默认值
- [ ] 处理了空值/错误情况
- [ ] 遵循服务端/客户端分离（如果需要）
- [ ] 添加了 TypeScript 类型（如果需要）
- [ ] 测试通过

## 组件迁移顺序建议

### 第一阶段（基础组件）

1. **Text** - 最简单，用于测试流程
2. **Icon** - 简单叶组件
3. **Button** - 单子组件 + 用户操作
4. **Row** / **Column** - 容器组件
5. **Card** - 简单容器

### 第二阶段（表单组件）

6. **TextField** - 表单输入 + 数据绑定
7. **Checkbox** - 表单控件
8. **Slider** - 范围输入

### 第三阶段（复杂组件）

9. **Modal** - 状态管理 + 多插槽
10. **Tabs** - 状态管理 + 动态内容
11. **List** - 动态列表渲染

### 第四阶段（低优先级）

12. **Image** / **Video** / **AudioPlayer** - 媒体组件
13. **Divider** - 简单装饰组件
14. **MultipleChoice** - 复杂表单
15. **DateTimeInput** - 日期选择器

## 示例：完整的 Button 组件实现

```typescript
// a2ui-components/button/index.tsx
import { Button as ShadcnButton } from '@a2ui-web/shadcn-ui/components/button'
import { ComponentRenderer } from '../../components/ComponentRenderer'
import { emitUserAction } from '../../utils/userAction'
import { cn } from '@a2ui-web/shadcn-ui/lib/utils'
import type { A2UIComponentProps } from '../../types'
import type * as v0_8 from '@a2ui-web/lit-core'

export function Button(props: A2UIComponentProps) {
  const { component, processor, surfaceId, emitUserAction: emitUserActionProp, weight } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // 1. 解析 action
  const action = componentProps.action as { name?: string; context?: unknown[] } | undefined

  // 2. 解析 child
  const child = componentProps.child as v0_8.Types.AnyComponentNode | undefined

  // 3. 处理点击事件
  const handleClick = () => {
    if (!action?.name) return

    emitUserAction(emitUserActionProp, {
      name: action.name,
      surfaceId,
      componentId: component.id,
      // TODO: 解析 action.context
    })
  }

  // 4. 渲染
  return (
    <ShadcnButton
      onClick={handleClick}
      className={cn(
        // shadcn/ui 默认样式已经包含
      )}
      style={{ flex: weight ?? component.weight ?? 1 }}
      data-component-id={component.id}
      data-weight={weight ?? component.weight}
    >
      {child ? (
        <ComponentRenderer
          node={child}
          processor={processor}
          surfaceId={surfaceId}
          emitUserAction={emitUserActionProp}
        />
      ) : (
        'Button'  // 默认文本
      )}
    </ShadcnButton>
  )
}
```

```typescript
// catalog/defaultCatalog.ts
import { Button } from '../a2ui-components/button'
import { Navbar } from '../a2ui-components/navbar'

const defaultComponents: Array<[string, React.ComponentType<A2UIComponentProps>]> = [
  ['Navbar', Navbar],
  ['Button', Button],  // 新增
]
```

就这样！Button 组件已经完成迁移。
