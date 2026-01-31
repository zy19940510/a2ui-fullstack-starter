---
name: a2ui-react-migration
description: Migrate shadcn/ui components to a2ui-react-renderer step-by-step. Use when implementing A2UI components in the @a2ui-web/a2ui-react-renderer package, converting shadcn/ui components to A2UI protocol, or adding new components to the component catalog. Covers component structure, data binding, event handling, catalog registration, and SSR patterns based on actual renderer implementation.
---

# A2UI React Component Migration Guide

Migrate shadcn/ui components to `a2ui-react-renderer` following the established architecture patterns. This skill is specifically designed for the a2ui-component monorepo project.

## When to Use This Skill

Use this skill when:
- **Migrating shadcn/ui components** to a2ui-react-renderer
- **Implementing new A2UI component types** (Button, Text, Card, Modal, etc.)
- **Understanding the renderer architecture** (event-driven, catalog system, hooks)
- **Debugging component implementations** in a2ui-react-renderer
- **Setting up component registration** in the catalog system

Do NOT use for:
- Creating standalone React components (this is A2UI-specific)
- Styling components (focus on structure and data binding)
- Lit Web Component development (this is for React renderer only)

## Quick Migration Workflow

### Step 1: Choose Component to Migrate

Select from the priority list:

**High Priority (Start Here)**:
- Button - Simple interaction pattern
- Text - Simplest component, good for testing
- Row/Column - Basic layout containers
- Card - Simple wrapper component

**Medium Priority**:
- TextField - Form input with data binding
- Checkbox - Boolean state management
- Modal - State + multiple slots
- Tabs - State + dynamic rendering

**Low Priority**:
- Image/Icon - Media components
- MultipleChoice - Complex form control
- DateTimeInput - Date picker integration

### Step 2: Create Component Directory

```bash
# Location
cd a2ui-react-renderer/src/a2ui-components/

# Simple component (single file)
mkdir button && touch button/index.tsx

# Complex component (multiple files)
mkdir tabs
touch tabs/index.tsx          # Server component
touch tabs/tabs.client.tsx    # Client component
touch tabs/tabs-types.ts      # Types (if needed)
```

**Naming Convention**:
- Directory: lowercase + hyphens (`text-field`, `date-time-input`)
- Files: lowercase + hyphens
- Components: PascalCase (`TextField`, `DateTimeInput`)

### Step 3: Implement Component

Choose pattern based on complexity:

#### Pattern A: Simple Leaf Component (No Children)

**Example**: Text, Icon, Image

```typescript
// a2ui-components/text/index.tsx
import { useA2UIValue } from '../../hooks/useA2UIValue'
import { cn } from '@a2ui-web/shadcn-ui/lib/utils'
import type { A2UIComponentProps } from '../../types'

export function Text(props: A2UIComponentProps) {
  const { component, processor, surfaceId } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // 1. Resolve text value
  const textValue = useA2UIValue(
    componentProps.text,
    '(empty)',
    processor,
    component,
    surfaceId
  )

  // 2. Get usage hint
  const usageHint = (componentProps.usageHint as string) ?? 'body'

  // 3. Map to HTML element
  const Component = usageHint === 'h1' ? 'h1' :
                    usageHint === 'h2' ? 'h2' :
                    usageHint === 'h3' ? 'h3' :
                    usageHint === 'h4' ? 'h4' :
                    usageHint === 'h5' ? 'h5' :
                    usageHint === 'caption' ? 'p' : 'p'

  // 4. Render
  return (
    <Component
      className={cn(/* Tailwind classes based on usageHint */)}
      data-component-id={component.id}
    >
      {textValue}
    </Component>
  )
}
```

#### Pattern B: Single Child Component (Button, Card)

**Example**: Button

```typescript
// a2ui-components/button/index.tsx
import { Button as ShadcnButton } from '@a2ui-web/shadcn-ui/components/button'
import { ComponentRenderer } from '../../components/ComponentRenderer'
import { emitUserAction } from '../../utils/userAction'
import type { A2UIComponentProps } from '../../types'
import type * as v0_8 from '@a2ui-web/lit-core'

export function Button(props: A2UIComponentProps) {
  const { component, processor, surfaceId, emitUserAction: emit } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // 1. Get action
  const action = componentProps.action as { name?: string } | undefined

  // 2. Get child
  const child = componentProps.child as v0_8.Types.AnyComponentNode | undefined

  // 3. Handle click
  const handleClick = () => {
    if (!action?.name) return
    emitUserAction(emit, {
      name: action.name,
      surfaceId,
      componentId: component.id,
    })
  }

  // 4. Render
  return (
    <ShadcnButton
      onClick={handleClick}
      data-component-id={component.id}
    >
      {child && (
        <ComponentRenderer
          node={child}
          processor={processor}
          surfaceId={surfaceId}
          emitUserAction={emit}
        />
      )}
    </ShadcnButton>
  )
}
```

#### Pattern C: Multiple Children Container (Row, Column, List)

**Example**: Row

```typescript
// a2ui-components/row/index.tsx
import { ComponentRenderer } from '../../components/ComponentRenderer'
import { cn } from '@a2ui-web/shadcn-ui/lib/utils'
import type { A2UIComponentProps } from '../../types'
import type * as v0_8 from '@a2ui-web/lit-core'

export function Row(props: A2UIComponentProps) {
  const { component, processor, surfaceId, emitUserAction } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  const children = (componentProps.children as v0_8.Types.AnyComponentNode[]) ?? []
  const distribution = (componentProps.distribution as string) ?? 'start'
  const alignment = (componentProps.alignment as string) ?? 'stretch'

  return (
    <div
      className={cn(
        'flex flex-row gap-2',
        distribution === 'center' && 'justify-center',
        distribution === 'end' && 'justify-end',
        distribution === 'spaceBetween' && 'justify-between',
        alignment === 'center' && 'items-center',
        alignment === 'end' && 'items-end'
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

#### Pattern D: Client-Side State (Modal, Tabs, Drawer)

**Server Component** (index.tsx):
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

**Client Component** (modal.client.tsx):
```typescript
// a2ui-components/modal/modal.client.tsx
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@a2ui-web/shadcn-ui/components/dialog'
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

export function ModalClient(props: ModalClientProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <ComponentRenderer node={props.entryPointChild} {...props} />
        </div>
      </DialogTrigger>
      <DialogContent data-component-id={props.component.id}>
        <ComponentRenderer node={props.contentChild} {...props} />
      </DialogContent>
    </Dialog>
  )
}
```

### Step 4: Register Component

Edit `catalog/defaultCatalog.ts`:

```typescript
import { Button } from '../a2ui-components/button'
import { Text } from '../a2ui-components/text'
import { Row } from '../a2ui-components/row'
import { Modal } from '../a2ui-components/modal'
import { Navbar } from '../a2ui-components/navbar'

const defaultComponents: Array<[string, React.ComponentType<A2UIComponentProps>]> = [
  ['Navbar', Navbar],
  ['Button', Button],   // Add here
  ['Text', Text],       // Add here
  ['Row', Row],         // Add here
  ['Modal', Modal],     // Add here
  // ... other components
]
```

**IMPORTANT**: Component name MUST match the A2UI protocol `type` field exactly.

### Step 5: Test Component

Restart dev server and test the component.

## Core Utilities

### 1. useA2UIValue Hook

Resolve A2UI BoundValue to actual value with reactivity:

```typescript
import { useA2UIValue } from '../../hooks/useA2UIValue'

// Usage
const label = useA2UIValue(
  componentProps.label,  // BoundValue | unknown
  'Default',             // Default value
  processor,
  component,
  surfaceId
)

// Supports:
// - { literalString: 'hello' }
// - { literalNumber: 42 }
// - { literalBoolean: true }
// - { path: '/user/name' }
// - { valueString: 'hello' }
// - 'hello' (primitive)
```

**When to use**: ANY property that might be data-bound.

### 2. ComponentRenderer

Recursively render child components:

```typescript
import { ComponentRenderer } from '../../components/ComponentRenderer'

<ComponentRenderer
  node={childNode}
  processor={processor}
  surfaceId={surfaceId}
  emitUserAction={emitUserAction}
/>
```

**When to use**: Rendering `child` or `children` from component properties.

### 3. emitUserAction

Emit user action messages:

```typescript
import { emitUserAction } from '../../utils/userAction'

const handleClick = () => {
  emitUserAction(emitUserActionProp, {
    name: 'button.click',
    surfaceId,
    componentId: component.id,
    context: { value: 'some-data' },  // Optional
  })
}
```

**When to use**: Components with user interactions (Button, Checkbox, TextField, etc.).

### 4. valueMapToObject

Parse A2UI ValueMap to plain object:

```typescript
import { valueMapToObject } from '../../utils/valueMap'

const parsed = valueMapToObject(raw) as MyType
```

**When to use**: Complex nested data structures (e.g., navItems in Navbar).

## Common Patterns

### Pattern: Server/Client Separation

**When**: Component needs client-side state or browser APIs.

**Structure**:
```
component/
├── index.tsx          # Server component (data parsing)
└── component.client.tsx  # Client component (state + interactions)
```

**Server** (index.tsx):
```typescript
export function MyComponent(props: A2UIComponentProps) {
  const data = useA2UIValue(...)  // Resolve data
  return <MyComponentClient data={data} {...props} />
}
```

**Client** (my-component.client.tsx):
```typescript
'use client'

export function MyComponentClient({ data, ...props }) {
  const [state, setState] = useState()
  useEffect(() => { /* browser APIs */ }, [])
  return <div>{data}</div>
}
```

### Pattern: Data Binding with Two-Way Sync

**For form inputs** (TextField, Checkbox, Slider):

```typescript
'use client'

export function TextField(props: A2UIComponentProps) {
  const { component, processor, surfaceId } = props
  const componentProps = component.properties as Record<string, unknown>

  // 1. Get initial value
  const initialValue = useA2UIValue(componentProps.text, '', processor, component, surfaceId)

  // 2. Local state
  const [value, setValue] = useState(initialValue || '')

  // 3. Sync external changes
  useEffect(() => {
    if (initialValue !== undefined) {
      setValue(initialValue)
    }
  }, [initialValue])

  // 4. Handle input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setValue(newValue)

    // 5. Update processor if path binding exists
    const textProp = componentProps.text as { path?: string } | undefined
    if (textProp?.path) {
      processor.setData(component, textProp.path, newValue, surfaceId)
    }
  }

  return <input value={value} onChange={handleChange} />
}
```

## Troubleshooting

### Issue: "useA2UIValue must be used in a client component"

**Cause**: Using hooks in server component.

**Solution**: Mark component with `'use client'` or split into server/client.

### Issue: "Component not found in catalog"

**Cause**: Component not registered or name mismatch.

**Solution**:
1. Check component is added to `defaultCatalog.ts`
2. Verify name matches A2UI protocol exactly
3. Restart dev server

### Issue: Children not rendering

**Cause**: Forgot to use `ComponentRenderer`.

**Solution**: Always use ComponentRenderer for child nodes.

## Best Practices

1. **Always Provide Defaults**
2. **Add data-component-id**
3. **Handle Null/Undefined Gracefully**
4. **Use cn() for Class Merging**
5. **Prefer Server Components**

## Component Migration Checklist

- [ ] Directory created in `a2ui-components/`
- [ ] `index.tsx` created
- [ ] Client component created (if needed)
- [ ] Imported correct shadcn/ui components
- [ ] Used `useA2UIValue` for all properties
- [ ] Used `ComponentRenderer` for children
- [ ] Used `emitUserAction` for interactions
- [ ] Added `data-component-id` attribute
- [ ] Provided default values
- [ ] Handled null/undefined cases
- [ ] Registered in `defaultCatalog.ts`
- [ ] Tested in example app
- [ ] Name matches A2UI protocol exactly

## Reference Documentation

### references/renderer-architecture.md

Complete architectural reference covering:
- A2UIRenderer implementation (event-driven, SSR support)
- Event system (processorEvents.ts) - wrapping processor methods
- Component catalog system - dynamic registration
- ComponentRenderer - dynamic component loading
- useA2UIValue - data binding hook with reactivity
- User action system - standardized message building
- ValueMap utilities - data structure helpers
- Navbar example - complete component breakdown
- Server/client separation pattern
- Type definitions and interfaces

**When to read**: Understanding the renderer's internal architecture, event system, or catalog pattern.

### references/migration-guide.md

Step-by-step migration guide covering:
- Complete migration workflow (7 steps)
- 5 implementation patterns with full code examples
- Common problems and solutions (6 issues)
- Best practices (7 guidelines)
- Migration checklist
- Component priority list
- Example: Complete Button implementation

**When to read**: Implementing a specific component, solving migration problems, or learning migration patterns.

## Recommended Migration Order

### Phase 1: Foundation
1. Text - Simplest
2. Icon - Asset integration

### Phase 2: Core
3. Button - User actions
4. Row / Column - Containers
5. Card - Wrapper

### Phase 3: Forms
6. TextField - Data binding
7. Checkbox - Boolean state
8. Slider - Range input

### Phase 4: Advanced
9. Modal - State + slots
10. Tabs - Dynamic rendering
11. List - Array iteration

### Phase 5: Media & Extras
12. Image / Video / AudioPlayer
13. Divider / Separator
14. MultipleChoice / DateTimeInput

## Integration with Project

**Target Package**: `a2ui-react-renderer/`

**File Locations**:
- Components: `src/a2ui-components/`
- Catalog: `src/catalog/defaultCatalog.ts`
- Hooks: `src/hooks/useA2UIValue.ts`
- Utils: `src/utils/`
- Types: `src/types.ts`

**Dependencies**:
- `@a2ui-web/lit-core` - A2UI 0.8 types
- `@a2ui-web/shadcn-ui` - UI components
- `@a2ui-web/animations` - Framer Motion and icons
- `use-sync-external-store` - React 17+ compatibility

## Quick Reference

### Common Imports

```typescript
// A2UI types
import type * as v0_8 from '@a2ui-web/lit-core'
import type { A2UIComponentProps } from '../../types'

// Hooks and utils
import { useA2UIValue } from '../../hooks/useA2UIValue'
import { ComponentRenderer } from '../../components/ComponentRenderer'
import { emitUserAction } from '../../utils/userAction'
import { valueMapToObject } from '../../utils/valueMap'

// shadcn/ui
import { Button } from '@a2ui-web/shadcn-ui/components/button'
import { cn } from '@a2ui-web/shadcn-ui/lib/utils'
```

### Component Template

```typescript
// a2ui-components/my-component/index.tsx
import type { A2UIComponentProps } from '../../types'

export function MyComponent(props: A2UIComponentProps) {
  const { component, processor, surfaceId, emitUserAction } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // Implementation

  return (
    <div data-component-id={component.id}>
      {/* Content */}
    </div>
  )
}
```
