---
name: a2ui-shadcn-components
description: Build A2UI 0.8 React components using shadcn/ui for the @a2ui-web/a2ui-react-renderer package. Use when implementing new component types, converting Lit Web Components to React, or creating shadcn/ui-based A2UI components. Handles type definitions, data binding, action handling, and theme integration following A2UI protocol patterns.
---

# A2UI shadcn/ui Component Builder

Build React components that conform to the A2UI 0.8 protocol specification using shadcn/ui as the underlying UI library. This skill provides comprehensive guidance for creating type-safe, data-bound components for the `@a2ui-web/a2ui-react-renderer` package.

## Critical Design Principles

### Separation of Core vs Custom Components

**IMPORTANT**: A2UI 0.8 core components have strict JSON schemas with `"additionalProperties": false`. You **CANNOT** extend core components with custom properties.

**Two Approaches:**

1. **Core Component Implementation** (strict compliance)
   - Implement exactly according to A2UI 0.8 spec (https://a2ui.org/specification/v0.8-a2ui/)
   - Check JSON schema in `@a2ui-web/lit-core/src/schemas/standard_catalog_definition.json`
   - Only use properties defined in the schema
   - Example: Core Button only has `child`, `primary`, and `action` properties

2. **Custom Component** (shadcn/ui-based extensions)
   - Create a **separate component** with a descriptive name (e.g., `ShadcnButton`, not `Button`)
   - Add custom properties (variant, size, disabled, etc.) from shadcn/ui
   - Register in application-level custom catalog, NOT in default catalog
   - Example: `A2UIShadcnButton` with variant, size, disabled properties

**Naming Convention:**
- Core implementations: `A2UI{ComponentName}` (matches A2UI spec exactly)
- Custom implementations: `A2UIShadcn{ComponentName}` or `A2UICustom{ComponentName}`

### Component Registration Architecture

**Three-layer architecture:**

1. **Core Layer** (`@a2ui-web/lit-core`)
   - A2UI 0.8 protocol definition
   - JSON schemas with strict validation
   - Type definitions

2. **Renderer Layer** (`@a2ui-web/a2ui-react-renderer`)
   - Default catalog: Only basic components (Typography, Column, Row)
   - Custom components (like `A2UIShadcnButton`): exported but NOT in default catalog
   - Exported via `a2ui-components/shadcnui` for application use

3. **Application Layer** (e.g., `example/next12-react17`)
   - Custom catalog: Registers custom components using plugin system
   - Extends default catalog as fallback
   - Example: Register `ShadcnButton` component

**Code Example:**
```typescript
// ❌ WRONG: Adding custom component to default catalog
// a2ui-react-renderer/src/catalog/defaultCatalog.ts
const defaultComponents = [
  ["Button", A2UIShadcnButton],  // DON'T DO THIS
];

// ✅ CORRECT: Custom component in application catalog
// example/next12-react17/src/lib/customCatalog.ts
import { A2UIShadcnButton } from '@a2ui-web/a2ui-react-renderer/a2ui-components/shadcnui'
import { defineComponentPlugin } from '@a2ui-web/a2ui-react-renderer/catalog/plugins'

const shadcnButtonPlugin = defineComponentPlugin('ShadcnButton', A2UIShadcnButton)

export function getCustomCatalog(): ComponentCatalog {
  const catalog = new ComponentCatalog(getDefaultCatalog())
  catalog.use(shadcnButtonPlugin)
  return catalog
}
```

### OKLCH Color Format Requirement

**IMPORTANT**: The project uses **OKLCH color space**, not HSL or RGB.

Tailwind CSS v4 `@theme` definitions must use `oklch()` format:

```css
/* ❌ WRONG: Using hsl() */
@theme {
  --color-primary: hsl(var(--primary));
  --color-destructive: hsl(var(--destructive));
}

/* ✅ CORRECT: Using oklch() */
@theme {
  --color-primary: oklch(var(--primary));
  --color-destructive: oklch(var(--destructive));
  --color-foreground: oklch(var(--foreground));
}
```

**Why this matters:**
- CSS variables contain OKLCH format values (e.g., `0.6426 0.24434 29.234`)
- Using `hsl()` wrapper causes incorrect color rendering (e.g., destructive button appears black)
- OKLCH provides better perceptual uniformity and wider color gamut

**File location:** `a2ui-react-renderer/src/styles.css`

## When to Use This Skill

Use this skill when:
- **Implementing new A2UI component types** (check if core or custom first)
- **Converting Lit Web Components to React** from `@a2ui-web/lit-core/src/ui`
- **Building custom components** that extend the A2UI protocol with shadcn/ui features
- **Debugging component implementations** for type safety, data binding, or action handling
- **Understanding A2UI architecture** for component development
- **Verifying A2UI 0.8 specification compliance**

Do NOT use for:
- Styling existing components (this is for structural implementation)
- General React component development (this is A2UI-specific)
- Lit Web Component development (use for React only)

## Quick Start Workflow

### Step 0: Core vs Custom Decision (NEW - CRITICAL)

**Before implementing ANY component, determine:**

1. **Is this a core A2UI 0.8 component?**
   - Check https://a2ui.org/specification/v0.8-a2ui/
   - Check `@a2ui-web/lit-core/src/schemas/standard_catalog_definition.json`
   - If YES → Implement exactly as specified (no custom properties)

2. **Do you need shadcn/ui features not in the spec?**
   - Examples: variant, size, disabled, className, custom styling
   - If YES → Create a **custom component** with a descriptive name
   - Register in **application catalog**, NOT default catalog

**Decision Tree:**

```
Need Button component?
├─ Want only child + action? (core spec)
│  └─ Implement A2UIButton (not currently in package)
│
└─ Want variant/size/disabled? (shadcn/ui features)
   └─ Implement A2UIShadcnButton (custom component)
      ├─ Export from a2ui-components/shadcnui
      └─ Register as "ShadcnButton" in app's customCatalog
```

### Step 1: Identify Component Pattern

Determine which A2UI component pattern applies:

1. **Leaf Component** (Text, Icon, Image) - No children, only properties
2. **Interactive Component** (Button, Checkbox) - User actions via `action` prop
3. **Container Component** (Row, Column, List) - Multiple children
4. **Complex Component** (Modal, Tabs) - Multiple named slots or special behavior

Refer to `references/a2ui-architecture.md` for detailed component catalog.

### Step 2: Define TypeScript Types

Every component needs corresponding type definitions. Create or update types in `a2ui-react-renderer/src/types/`.

**Pattern:**
```typescript
// In a2ui-react-renderer/src/types/component-types.ts
import { BaseComponentNode, AnyComponentNode } from '@a2ui-web/lit-core/Types';

// Define the specific node type
export interface ButtonNode extends BaseComponentNode {
  type: "Button";
  properties: ResolvedButton;
}

// Define resolved properties (children are AnyComponentNode)
export interface ResolvedButton {
  child: AnyComponentNode;
  action: Action;
}

// Add to discriminated union
export type AnyComponentNode =
  | ButtonNode
  | TextNode
  // ... other types
```

**Key Rules:**
- Extend `BaseComponentNode` for all component types
- Use `AnyComponentNode` for child references
- Properties interface name: `Resolved{ComponentName}`
- Type field must exactly match component name

### Step 3: Create Component File

Create component in appropriate location:

**For Core Components:**
- Location: `a2ui-react-renderer/src/a2ui-components/{component-name}.tsx`
- Example: `a2ui-components/button.tsx` for core Button

**For Custom shadcn/ui Components:**
- Location: `a2ui-react-renderer/src/a2ui-components/shadcnui/{component-name}/index.tsx`
- Example: `a2ui-components/shadcnui/button/index.tsx` for ShadcnButton

**Custom Component File Structure:**
```typescript
// a2ui-react-renderer/src/a2ui-components/shadcnui/button/index.tsx
'use client';

import React from 'react';
import { Button } from '@a2ui-web/shadcn-ui/components/button';
import { cn } from '@a2ui-web/shadcn-ui/lib/utils';
import type { A2UIComponentProps } from '../../../types';
import { A2UIRenderer } from '../../../A2UIRenderer';
import { emitUserAction, resolveActionContext } from '../../../utils/userAction';
import { useA2UIValue } from '../../../hooks/useA2UIValue';

/**
 * ShadcnButton - 自定义按钮组件
 *
 * 这是一个基于 shadcn/ui Button 的自定义 A2UI 组件，不是 A2UI 0.8 核心规范的 Button。
 * 扩展了核心 Button 的功能，添加了 variant、size、disabled 等 shadcn/ui 特性。
 *
 * 核心属性（继承自 A2UI Button）：
 * - child: 子组件 ID
 * - action: 用户操作定义
 *
 * 扩展属性（来自 shadcn/ui）：
 * - variant: 按钮变体 (default | destructive | outline | secondary | ghost | link)
 * - size: 按钮尺寸 (default | sm | lg | icon | icon-sm | icon-lg)
 * - disabled: 禁用状态
 * - className: 自定义样式类
 */
export function A2UIShadcnButton(props: A2UIComponentProps) {
  const { node, processor, surfaceId, onUserAction, theme } = props;

  // 1. 从 node.properties 中提取 shadcn/ui 扩展属性
  const variant = useA2UIValue(node.properties?.variant, processor, node, surfaceId) as any;
  const size = useA2UIValue(node.properties?.size, processor, node, surfaceId) as any;
  const disabled = useA2UIValue(node.properties?.disabled, processor, node, surfaceId) as boolean;
  const className = useA2UIValue(node.properties?.className, processor, node, surfaceId) as string;

  // 2. 提取核心属性
  const child = node.properties?.child;
  const action = node.properties?.action;

  // 3. 创建 action handler
  const handleClick = () => {
    if (!action) return;
    emitUserAction({
      actionName: action.name,
      sourceComponentId: node.id,
      timestamp: new Date().toISOString(),
      context: resolveActionContext(action.context, processor, node, surfaceId),
      onUserAction,
    });
  };

  // 4. 渲染 shadcn/ui Button
  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={handleClick}
      className={cn(theme?.components?.ShadcnButton, className)}
      style={{ flex: node.weight }}
      data-component-id={node.id}
    >
      {child && (
        <A2UIRenderer
          node={child}
          processor={processor}
          surfaceId={surfaceId}
          onUserAction={onUserAction}
          theme={theme}
        />
      )}
    </Button>
  );
}
```

**Core Component File Structure:**
```typescript
// a2ui-react-renderer/src/a2ui-components/button.tsx
'use client';

import React from 'react';
import { Button } from '@a2ui-web/shadcn-ui/components/button';
import { cn } from '@a2ui-web/shadcn-ui/lib/utils';
import type { ButtonNode } from '../types/component-types';
import type { A2UIComponentProps } from '../types';
import { A2UIRenderer } from '../A2UIRenderer';
import { emitUserAction, resolveActionContext } from '../utils/actions';

export function A2UIButton({
  node,
  processor,
  surfaceId,
  onUserAction,
  theme
}: A2UIComponentProps<ButtonNode>) {
  // Implementation here - ONLY use properties from A2UI spec
}
```

**Required Imports:**
- shadcn/ui component: `@a2ui-web/shadcn-ui/components/{component}`
- Utils: `@a2ui-web/shadcn-ui/lib/utils`
- Type definitions from `../types`
- `A2UIRenderer` for rendering children
- Action utilities (if interactive)
- `useA2UIValue` for data binding

### Step 4: Implement Component Logic

Follow the pattern for your component type:

#### For Leaf Components (no children):

```typescript
export function A2UIText({
  node,
  processor,
  surfaceId,
  theme
}: A2UIComponentProps<TextNode>) {
  // 1. Resolve data-bound values
  const textValue = useA2UIValue(
    node.properties.text,
    processor,
    node,
    surfaceId
  );

  // 2. Apply theme classes and styles
  const classes = cn(
    baseClasses,
    theme?.components.Text.all,
    theme?.components.Text[node.properties.usageHint || 'body']
  );

  const styles = {
    flex: node.weight,
    ...theme?.additionalStyles?.Text?.[node.properties.usageHint || 'body']
  };

  // 3. Render with proper attributes
  return (
    <Component
      className={classes}
      style={styles}
      data-component-id={node.id}
    >
      {textValue || '(empty)'}
    </Component>
  );
}
```

#### For Interactive Components (with actions):

```typescript
export function A2UIButton({
  node,
  processor,
  surfaceId,
  onUserAction,
  theme
}: A2UIComponentProps<ButtonNode>) {
  // 1. Create action handler
  const handleClick = () => {
    if (!node.properties.action) return;

    emitUserAction({
      actionName: node.properties.action.name,
      sourceComponentId: node.id,
      timestamp: new Date().toISOString(),
      context: resolveActionContext(
        node.properties.action.context,
        processor,
        node,
        surfaceId
      ),
      onUserAction
    });
  };

  // 2. Render with child components
  return (
    <Button
      onClick={handleClick}
      className={cn(theme?.components.Button)}
      style={{ flex: node.weight }}
      data-component-id={node.id}
    >
      <A2UIRenderer
        node={node.properties.child}
        processor={processor}
        surfaceId={surfaceId}
        onUserAction={onUserAction}
        theme={theme}
      />
    </Button>
  );
}
```

#### For Container Components (multiple children):

```typescript
export function A2UIRow({
  node,
  processor,
  surfaceId,
  onUserAction,
  theme
}: A2UIComponentProps<RowNode>) {
  // 1. Extract layout properties
  const { distribution = 'start', alignment = 'stretch' } = node.properties;

  // 2. Map to CSS classes
  const classes = cn(
    'flex flex-row gap-2',
    distributionClasses[distribution],
    alignmentClasses[alignment],
    theme?.components.Row
  );

  // 3. Render children
  return (
    <div
      className={classes}
      style={{ flex: node.weight }}
      data-component-id={node.id}
    >
      {node.properties.children.map((child) => (
        <A2UIRenderer
          key={child.id}
          node={child}
          processor={processor}
          surfaceId={surfaceId}
          onUserAction={onUserAction}
          theme={theme}
        />
      ))}
    </div>
  );
}
```

#### For Complex Components (special behavior):

```typescript
export function A2UIModal({
  node,
  processor,
  surfaceId,
  onUserAction,
  theme
}: A2UIComponentProps<ModalNode>) {
  // 1. Manage component state
  const [open, setOpen] = useState(false);

  // 2. Render with multiple slots
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div>
          <A2UIRenderer
            node={node.properties.entryPointChild}
            {...props}
          />
        </div>
      </DialogTrigger>

      <DialogContent data-component-id={node.id}>
        <A2UIRenderer
          node={node.properties.contentChild}
          {...props}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### Step 5: Register Component

Registration depends on component type:

#### For Core Components (Not Recommended)

Add to default catalog in `a2ui-react-renderer/src/catalog/defaultCatalog.ts`:

```typescript
import { A2UIButton } from '../a2ui-components/button';

const defaultComponents: Array<
  [string, React.ComponentType<A2UIComponentProps>]
> = [
  ["Typography", A2UITypography],
  ["Column", Column],
  ["Row", Row],
  ["Button", A2UIButton],  // Only if implementing strict A2UI spec
];
```

#### For Custom Components (Recommended Pattern)

**Step 5a: Export from shadcnui index**

Update `a2ui-react-renderer/src/a2ui-components/shadcnui/index.ts`:

```typescript
export { A2UITypography } from './typography'
export { A2UIShadcnButton } from './button'
// ... other custom components
```

**Step 5b: Add package.json export (if not exists)**

Update `a2ui-react-renderer/package.json`:

```json
{
  "exports": {
    "./a2ui-components/shadcnui": {
      "types": "./dist/a2ui-components/shadcnui/index.d.ts",
      "import": "./dist/a2ui-components/shadcnui/index.js"
    }
  }
}
```

**Step 5c: Register in application's custom catalog**

In your application (e.g., `example/next12-react17/src/lib/customCatalog.ts`):

```typescript
import { ComponentCatalog } from '@a2ui-web/a2ui-react-renderer/catalog/ComponentCatalog'
import { defineComponentPlugin } from '@a2ui-web/a2ui-react-renderer/catalog/plugins'
import { getDefaultCatalog } from '@a2ui-web/a2ui-react-renderer'
import { A2UIShadcnButton } from '@a2ui-web/a2ui-react-renderer/a2ui-components/shadcnui'

export const CUSTOM_CATALOG_ID = 'example.next12:custom_catalog_0_1_0'

let cachedCatalog: ComponentCatalog | null = null

// Define custom component plugin
const shadcnButtonPlugin = defineComponentPlugin('ShadcnButton', A2UIShadcnButton)

export function getCustomCatalog(): ComponentCatalog {
  if (cachedCatalog) return cachedCatalog

  // Create custom catalog with default catalog as fallback
  const defaultCatalog = getDefaultCatalog()
  const catalog = new ComponentCatalog(defaultCatalog)

  // Register custom components
  catalog.use(shadcnButtonPlugin)

  cachedCatalog = catalog
  return catalog
}
```

**Step 5d: Use in A2UI messages**

In your application data (e.g., `buttonData.ts`):

```typescript
// Use "ShadcnButton" to match the catalog registration name
{
  id: 'btn-default',
  component: {
    ShadcnButton: {  // NOT "Button"
      child: 'btn-default-text',
      variant: { literalString: 'default' },
      action: {
        name: 'button-clicked',
      },
    },
  },
}
```

#### Default Catalog Keep Minimal

The default catalog in `a2ui-react-renderer` should only contain:
- Basic layout components: `Typography`, `Column`, `Row`
- NO custom shadcn/ui components
- Components that work without any configuration

This ensures clean separation between core renderer and application-specific components.

### Step 6: Test Component

Create test file in `a2ui-react-renderer/src/a2ui-components/__tests__/`:

```typescript
// button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { A2UIButton } from '../button';
import type { ButtonNode } from '../../types/component-types';

describe('A2UIButton', () => {
  it('renders child component', () => {
    const node: ButtonNode = {
      id: 'btn-1',
      type: 'Button',
      properties: {
        child: {
          id: 'text-1',
          type: 'Text',
          properties: {
            text: { literalString: 'Click me' },
            usageHint: 'body'
          }
        },
        action: {
          name: 'onClick'
        }
      }
    };

    render(<A2UIButton node={node} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('emits user action on click', () => {
    const onUserAction = jest.fn();
    // ... test implementation
  });
});
```

## Core Utilities

### useA2UIValue Hook

Resolve StringValue/NumberValue/BooleanValue to actual values:

```typescript
import { useA2UIValue } from '../hooks/useA2UIValue';

const textValue = useA2UIValue(
  node.properties.text,  // StringValue | null | undefined
  processor,
  node,
  surfaceId
);
// Returns: string | number | boolean | null
```

**When to use:**
- Any property typed as `StringValue`, `NumberValue`, or `BooleanValue`
- Properties that can be either literal or data-bound

### emitUserAction Utility

Emit user actions from interactive components:

```typescript
import { emitUserAction, resolveActionContext } from '../utils/actions';

const handleClick = () => {
  emitUserAction({
    actionName: node.properties.action.name,
    sourceComponentId: node.id,
    timestamp: new Date().toISOString(),
    context: resolveActionContext(
      node.properties.action.context,
      processor,
      node,
      surfaceId
    ),
    onUserAction
  });
};
```

**When to use:**
- Components with `action` property (Button, Checkbox, etc.)
- Any user interaction that should trigger server communication

### A2UIRenderer Component

Recursively render child components:

```typescript
import { A2UIRenderer } from '../A2UIRenderer';

<A2UIRenderer
  node={childNode}
  processor={processor}
  surfaceId={surfaceId}
  onUserAction={onUserAction}
  theme={theme}
/>
```

**When to use:**
- Rendering `child` property (single child)
- Rendering `children` array (multiple children)
- Any nested component structure

## Common Patterns

### Pattern: Handling Optional Children

```typescript
// Component can have either child or children
const allChildren = [
  ...(node.properties.child ? [node.properties.child] : []),
  ...(node.properties.children || [])
];

return (
  <div>
    {allChildren.map(child => (
      <A2UIRenderer key={child.id} node={child} {...props} />
    ))}
  </div>
);
```

### Pattern: Theme Integration

```typescript
// 1. Base classes from shadcn/ui
const baseClasses = 'text-lg font-medium';

// 2. Theme classes from A2UI theme
const themeClasses = theme?.components.ComponentName;

// 3. Variant-specific classes
const variantClasses = theme?.components.ComponentName[variant];

// 4. Merge all classes
const classes = cn(baseClasses, themeClasses, variantClasses);

// 5. Additional inline styles
const styles = {
  flex: node.weight,
  ...theme?.additionalStyles?.ComponentName
};

<Component className={classes} style={styles} />
```

### Pattern: Data Model Updates

```typescript
// For form inputs that update the data model
const handleChange = (newValue: string) => {
  setValue(newValue);

  // If the property has a path binding, update the data model
  if (node.properties.text && 'path' in node.properties.text && node.properties.text.path) {
    processor?.setData(
      node,
      node.properties.text.path,
      newValue,
      surfaceId || '@default'
    );
  }
};
```

### Pattern: Slot-Based Components

```typescript
// Component with named slots (e.g., Modal, Tabs)
// Set slotName on child nodes
node.properties.entryPointChild.slotName = 'entry';
node.properties.contentChild.slotName = 'content';

// Render in appropriate locations
<EntrySlot>
  <A2UIRenderer node={node.properties.entryPointChild} {...props} />
</EntrySlot>

<ContentSlot>
  <A2UIRenderer node={node.properties.contentChild} {...props} />
</ContentSlot>
```

## Best Practices

### Type Safety

1. **Always use discriminated unions** for component node types
2. **Type guard functions** for runtime type checking
3. **Generic props interface** `A2UIComponentProps<T extends AnyComponentNode>`
4. **Explicit return types** for clarity

### Data Binding

1. **Use useA2UIValue** for all StringValue/NumberValue/BooleanValue resolution
2. **Respect dataContextPath** when resolving data
3. **Handle null/undefined values** gracefully with fallbacks
4. **Update data model** for two-way binding in form components

### Component Structure

1. **Follow "use client" directive** for all components (Next.js 12+ compatibility)
2. **Consistent prop destructuring** from `A2UIComponentProps`
3. **Data attributes** for debugging: `data-component-id`, `data-weight`
4. **Proper key props** when mapping children

### Theme Integration

1. **Always apply theme classes** via `cn()` utility
2. **Support variant-specific theming** (e.g., Text h1/h2/h3)
3. **Apply weight via flex** property for layout
4. **Inline styles for additionalStyles** from theme

### Performance

1. **Memoize heavy computations** with `useMemo`
2. **Avoid unnecessary re-renders** with `React.memo` for leaf components
3. **Lazy load complex components** if needed
4. **Efficient child rendering** with proper keys

## Troubleshooting

### A2UI 0.8 Specification Compliance Issues

**Problem:** Component with custom properties fails validation or behaves unexpectedly
**Root Cause:** A2UI 0.8 schemas have `"additionalProperties": false`
**Solution:**
1. Check the JSON schema in `@a2ui-web/lit-core/src/schemas/standard_catalog_definition.json`
2. If adding custom properties, create a **separate custom component**
3. Name it descriptively (e.g., `ShadcnButton` not `Button`)
4. Register in application catalog, not default catalog

**Problem:** Trying to extend core Button with variant/size/disabled
**Solution:** This violates the spec. Create `A2UIShadcnButton` as a custom component instead.

### Color Rendering Issues (OKLCH)

**Problem:** Colors render incorrectly (e.g., destructive button appears black, primary appears gray)
**Symptoms:**
- Expected red/teal colors appear as black/gray
- Browser DevTools shows `rgb(70, 70, 70)` instead of expected colors
- Styles work in isolation but fail when using CSS variables

**Root Cause:** Using wrong color format in Tailwind v4 `@theme` definitions
**Solution:**

1. **Check CSS variable format:**
   ```css
   /* In your app's global CSS */
   :root {
     --primary: 0.6426 0.24434 29.234;  /* OKLCH format (no function wrapper) */
     --destructive: 0.7176 0.22110 25.725;
   }
   ```

2. **Check @theme definition in a2ui-react-renderer/src/styles.css:**
   ```css
   /* ❌ WRONG */
   @theme {
     --color-primary: hsl(var(--primary));
     --color-destructive: hsl(var(--destructive));
   }

   /* ✅ CORRECT */
   @theme {
     --color-primary: oklch(var(--primary));
     --color-destructive: oklch(var(--destructive));
   }
   ```

3. **Verify all color definitions use oklch():**
   - `--color-background: oklch(var(--background))`
   - `--color-foreground: oklch(var(--foreground))`
   - `--color-card: oklch(var(--card))`
   - `--color-primary: oklch(var(--primary))`
   - `--color-destructive: oklch(var(--destructive))`
   - etc.

4. **Rebuild the package:**
   ```bash
   cd a2ui-react-renderer
   bun run build
   ```

5. **Clear Next.js cache in example app:**
   ```bash
   cd example/next12-react17
   rm -rf .next node_modules/.cache
   bun run dev
   ```

**Why OKLCH?**
- CSS variables store raw OKLCH values (3 numbers: lightness, chroma, hue)
- OKLCH provides perceptual uniformity and wider color gamut than HSL
- Tailwind v4 requires exact format matching for CSS variable substitution

### Component Registration Issues

**Problem:** Custom component not found when rendering
**Symptoms:**
- "Unknown component type: ShadcnButton" error
- Component renders as empty or fallback

**Solution:**
1. Verify component is exported from `a2ui-components/shadcnui/index.ts`
2. Check package.json has export path for `./a2ui-components/shadcnui`
3. Verify application's customCatalog registers the component with correct name
4. Ensure A2UI message uses the **catalog name** (e.g., `ShadcnButton:`), not the original spec name (e.g., `Button:`)

**Problem:** Component works in one app but not another
**Root Cause:** Custom catalog is application-specific
**Solution:**
- Each application must register custom components in its own customCatalog
- Cannot rely on default catalog for custom components
- Share customCatalog pattern across applications if needed

### TypeScript Errors

**Problem:** "Type X is not assignable to type AnyComponentNode"
**Solution:** Add new component type to the discriminated union in `types/component-types.ts`

**Problem:** "Property 'properties' does not exist on type 'BaseComponentNode'"
**Solution:** Use type casting: `node as ButtonNode` or create type guard

### Data Binding Issues

**Problem:** Data-bound values not updating
**Solution:**
1. Check processor is passed correctly
2. Verify dataContextPath is set on node
3. Ensure path is correct relative to dataContextPath
4. Use React DevTools to inspect processor state

**Problem:** "Cannot read property 'getData' of null"
**Solution:** Add null checks: `processor?.getData(...)`

### Rendering Issues

**Problem:** Children not rendering
**Solution:**
1. Verify `enableCustomElements` flag if using custom components
2. Check A2UIRenderer is imported correctly
3. Ensure child nodes have unique `id` properties
4. Add console.log to debug node structure

**Problem:** Styles not applying
**Solution:**
1. Import CSS: `import '@a2ui-web/a2ui-react-renderer/styles.css'`
2. Check theme prop is passed down
3. Verify `cn()` utility is used for class merging
4. Inspect with browser DevTools

## Reference Documentation

This skill includes detailed reference documentation:

### references/a2ui-architecture.md

Comprehensive A2UI 0.8 architecture reference covering:
- Core type system and component node structure
- Data binding system with primitives (StringValue, NumberValue, BooleanValue)
- Action system for user interactions
- Component implementation patterns (leaf, interactive, container, complex)
- Theme system integration
- Lit Web Components reference (original implementation)
- Complete component catalog with 18+ standard components

**When to read:** Understanding A2UI protocol, type definitions, data binding mechanisms, or comparing with Lit implementation.

### references/shadcn-mapping.md

shadcn/ui component mapping guide with:
- Component mapping matrix (A2UI → shadcn/ui)
- Complete implementation templates for all component types
- Code examples for Button, Text, TextField, Card, Modal, Tabs, Row, Column
- Common patterns: useA2UIValue, emitUserAction, data model updates
- Utility implementations with full source code

**When to read:** Implementing specific components, understanding shadcn/ui integration, or looking for code examples.

## Real-World Example: ShadcnButton Implementation

This section documents the complete implementation of `A2UIShadcnButton`, a custom component that extends the core Button concept with shadcn/ui features.

### Context

**Goal:** Create a button component with shadcn/ui variants (default, destructive, outline, secondary, ghost, link) and sizes (sm, default, lg, icon, icon-sm, icon-lg).

**Challenge:** Core A2UI 0.8 Button only supports `child`, `primary`, and `action` properties. Adding `variant`, `size`, `disabled` would violate `"additionalProperties": false` in the JSON schema.

**Solution:** Create a separate custom component called `ShadcnButton`.

### Implementation Steps

#### 1. Component File

Created `a2ui-react-renderer/src/a2ui-components/shadcnui/button/index.tsx`:

```typescript
'use client'

import React from 'react'
import { Button } from '@a2ui-web/shadcn-ui/components/button'
import { cn } from '@a2ui-web/shadcn-ui/lib/utils'
import type { A2UIComponentProps } from '../../../types'
import { A2UIRenderer } from '../../../A2UIRenderer'
import { emitUserAction, resolveActionContext } from '../../../utils/userAction'
import { useA2UIValue } from '../../../hooks/useA2UIValue'

/**
 * ShadcnButton - 自定义按钮组件
 *
 * 这是一个基于 shadcn/ui Button 的自定义 A2UI 组件，不是 A2UI 0.8 核心规范的 Button。
 * 扩展了核心 Button 的功能，添加了 variant、size、disabled 等 shadcn/ui 特性。
 *
 * 核心属性（继承自 A2UI Button）：
 * - child: 子组件 ID
 * - action: 用户操作定义
 *
 * 扩展属性（来自 shadcn/ui）：
 * - variant: 按钮变体 (default | destructive | outline | secondary | ghost | link)
 * - size: 按钮尺寸 (default | sm | lg | icon | icon-sm | icon-lg)
 * - disabled: 禁用状态
 * - className: 自定义样式类
 */
export function A2UIShadcnButton(props: A2UIComponentProps) {
  const { node, processor, surfaceId, onUserAction, theme } = props

  // Extract shadcn/ui extension properties
  const variant = useA2UIValue(node.properties?.variant, processor, node, surfaceId) as any
  const size = useA2UIValue(node.properties?.size, processor, node, surfaceId) as any
  const disabled = useA2UIValue(node.properties?.disabled, processor, node, surfaceId) as boolean
  const className = useA2UIValue(node.properties?.className, processor, node, surfaceId) as string

  // Extract core properties
  const child = node.properties?.child
  const action = node.properties?.action

  // Create action handler
  const handleClick = () => {
    if (!action) return
    emitUserAction({
      actionName: action.name,
      sourceComponentId: node.id,
      timestamp: new Date().toISOString(),
      context: resolveActionContext(action.context, processor, node, surfaceId),
      onUserAction,
    })
  }

  return (
    <Button
      variant={variant}
      size={size}
      disabled={disabled}
      onClick={handleClick}
      className={cn(theme?.components?.ShadcnButton, className)}
      style={{ flex: node.weight }}
      data-component-id={node.id}
    >
      {child && (
        <A2UIRenderer
          node={child}
          processor={processor}
          surfaceId={surfaceId}
          onUserAction={onUserAction}
          theme={theme}
        />
      )}
    </Button>
  )
}
```

#### 2. Export from shadcnui Index

Updated `a2ui-react-renderer/src/a2ui-components/shadcnui/index.ts`:

```typescript
export { A2UITypography } from './typography'
export { A2UIShadcnButton } from './button'
```

#### 3. Package Export

`a2ui-react-renderer/package.json` already had the export:

```json
{
  "exports": {
    "./a2ui-components/shadcnui": {
      "types": "./dist/a2ui-components/shadcnui/index.d.ts",
      "import": "./dist/a2ui-components/shadcnui/index.js"
    }
  }
}
```

#### 4. Application Catalog Registration

Updated `example/next12-react17/src/lib/customCatalog.ts`:

```typescript
import { ComponentCatalog } from '@a2ui-web/a2ui-react-renderer/catalog/ComponentCatalog'
import { defineComponentPlugin } from '@a2ui-web/a2ui-react-renderer/catalog/plugins'
import { getDefaultCatalog } from '@a2ui-web/a2ui-react-renderer'
import { Navbar } from '../components/custom-ui/navbar'
import { A2UIShadcnButton } from '@a2ui-web/a2ui-react-renderer/a2ui-components/shadcnui'

export const CUSTOM_CATALOG_ID = 'example.next12:custom_catalog_0_1_0'

let cachedCatalog: ComponentCatalog | null = null

// Define custom component plugins
const navbarPlugin = defineComponentPlugin('Navbar', Navbar)
const shadcnButtonPlugin = defineComponentPlugin('ShadcnButton', A2UIShadcnButton)

export function getCustomCatalog(): ComponentCatalog {
  if (cachedCatalog) return cachedCatalog

  // Create custom catalog with default catalog as fallback
  const defaultCatalog = getDefaultCatalog()
  const catalog = new ComponentCatalog(defaultCatalog)

  // Register custom components
  catalog.use(navbarPlugin)
  catalog.use(shadcnButtonPlugin)

  cachedCatalog = catalog
  return catalog
}
```

#### 5. A2UI Message Data

Updated `example/next12-react17/components/button/buttonData.ts`:

```typescript
export const buttonVariantsMessage = [
  {
    id: 'btn-default',
    component: {
      ShadcnButton: {  // Use catalog name, not "Button"
        child: 'btn-default-text',
        variant: { literalString: 'default' },
        action: {
          name: 'button-clicked',
          context: [{ key: 'variant', value: { literalString: 'default' } }],
        },
      },
    },
  },
  {
    id: 'btn-default-text',
    component: {
      Typography: {
        text: { literalString: 'Default' },
      },
    },
  },
  {
    id: 'btn-destructive',
    component: {
      ShadcnButton: {
        child: 'btn-destructive-text',
        variant: { literalString: 'destructive' },
        action: {
          name: 'delete-clicked',
        },
      },
    },
  },
  // ... more variants
]
```

#### 6. Color Fix (OKLCH)

Fixed `a2ui-react-renderer/src/styles.css` to use OKLCH:

```css
@theme {
  /* ❌ Before (incorrect HSL) */
  /* --color-primary: hsl(var(--primary)); */

  /* ✅ After (correct OKLCH) */
  --color-background: oklch(var(--background));
  --color-foreground: oklch(var(--foreground));
  --color-card: oklch(var(--card));
  --color-card-foreground: oklch(var(--card-foreground));
  --color-popover: oklch(var(--popover));
  --color-popover-foreground: oklch(var(--popover-foreground));
  --color-primary: oklch(var(--primary));
  --color-primary-foreground: oklch(var(--primary-foreground));
  --color-secondary: oklch(var(--secondary));
  --color-secondary-foreground: oklch(var(--secondary-foreground));
  --color-muted: oklch(var(--muted));
  --color-muted-foreground: oklch(var(--muted-foreground));
  --color-accent: oklch(var(--accent));
  --color-accent-foreground: oklch(var(--accent-foreground));
  --color-destructive: oklch(var(--destructive));
  --color-destructive-foreground: oklch(var(--destructive-foreground));
  --color-border: oklch(var(--border));
  --color-input: oklch(var(--input));
  --color-ring: oklch(var(--ring));
  --color-chart-1: oklch(var(--chart-1));
  --color-chart-2: oklch(var(--chart-2));
  --color-chart-3: oklch(var(--chart-3));
  --color-chart-4: oklch(var(--chart-4));
  --color-chart-5: oklch(var(--chart-5));
}
```

#### 7. Default Catalog Cleanup

Updated `a2ui-react-renderer/src/catalog/defaultCatalog.ts` to keep it minimal:

```typescript
import type React from "react";
import { A2UITypography } from "../a2ui-components/shadcnui";
import { Column, Row } from "../a2ui-components/layout";
import type { A2UIComponentProps } from "../types";

/**
 * 内置默认组件目录
 * 只包含基础组件（Typography、Column、Row）
 * ShadcnButton 等自定义组件需要在应用层通过 ComponentCatalog 注册
 */
import { ComponentCatalog } from "./ComponentCatalog";

export const DEFAULT_CATALOG_ID = "a2ui.org:default_react_catalog_0_1_0";

let cached: ComponentCatalog | null = null;

const defaultComponents: Array<
  [string, React.ComponentType<A2UIComponentProps>]
> = [
  // 注意: 不包含 Button，因为核心的 A2UI Button 需要由应用层实现
  // ShadcnButton 等自定义实现应该在应用层的 customCatalog 中注册
  ["Typography", A2UITypography],
  ["Column", Column],
  ["Row", Row],
];

export function getDefaultCatalog(): ComponentCatalog {
  if (cached) return cached;
  const catalog = new ComponentCatalog();
  for (const [name, component] of defaultComponents) {
    catalog.register(name, component);
  }
  cached = catalog;
  return catalog;
}
```

### Results

**Before:**
- Buttons rendered but colors were wrong (destructive appeared black)
- Component was in default catalog (incorrect architecture)
- Named `A2UIButton` (confusing with core spec)

**After:**
- All 6 variants render with correct colors:
  - default: teal background
  - destructive: red background
  - outline: white background with border
  - secondary: white/gray background
  - ghost: transparent with hover
  - link: transparent with underline
- Component in application catalog (correct separation)
- Named `A2UIShadcnButton` (clear it's a custom implementation)
- Uses catalog name `ShadcnButton` in messages

### Key Learnings

1. **OKLCH is mandatory** - Using `hsl()` when CSS variables contain OKLCH values causes color corruption
2. **Spec compliance is strict** - Cannot extend core components, must create separate custom components
3. **Catalog architecture matters** - Default catalog stays minimal, applications register custom components
4. **Naming is important** - Custom components need descriptive names to avoid confusion with core spec
5. **Plugin system is elegant** - `defineComponentPlugin` + `catalog.use()` provides clean registration

## Component Development Checklist

When implementing a new component, verify:

**Planning Phase:**
- [ ] Checked A2UI 0.8 specification (https://a2ui.org/specification/v0.8-a2ui/)
- [ ] Checked JSON schema in `lit-core/src/schemas/standard_catalog_definition.json`
- [ ] Decided: Core component (strict spec) vs Custom component (shadcn/ui features)
- [ ] Chosen appropriate name (A2UI{Name} for core, A2UIShadcn{Name} for custom)

**Implementation Phase:**
- [ ] Type definition created in `types/component-types.ts` (if core)
- [ ] Type added to `AnyComponentNode` discriminated union (if core)
- [ ] Component file created in appropriate location:
  - [ ] `a2ui-components/{name}.tsx` (core)
  - [ ] `a2ui-components/shadcnui/{name}/index.tsx` (custom)
- [ ] Proper TypeScript types used (`A2UIComponentProps<T>` or `A2UIComponentProps`)
- [ ] `'use client'` directive at top of file
- [ ] Data binding handled with `useA2UIValue`
- [ ] Actions handled with `emitUserAction` (if interactive)
- [ ] Children rendered with `A2UIRenderer`
- [ ] Theme classes applied with `cn()`
- [ ] Weight property mapped to flex style
- [ ] OKLCH color format used in styles (if applicable)

**Registration Phase:**
- [ ] Component exported from `a2ui-components/shadcnui/index.ts` (custom)
- [ ] Package.json export path added (if new directory)
- [ ] Component registered in application's customCatalog (custom)
- [ ] OR Component added to defaultCatalog (core, rare)
- [ ] A2UI message data uses correct catalog name

**Testing Phase:**
- [ ] Tests created in `__tests__/` (if applicable)
- [ ] Component tested in example app
- [ ] All variants/sizes tested (if applicable)
- [ ] Colors render correctly with OKLCH
- [ ] Actions emit correctly
- [ ] Data binding works

**Documentation Phase:**
- [ ] JSDoc comments added explaining core vs custom properties
- [ ] README or skill updated with new component
- [ ] Example data created showing usage

## Examples from Existing Implementation

### Example 1: Simple Button

```typescript
// Type definition
interface ButtonNode extends BaseComponentNode {
  type: "Button";
  properties: {
    child: AnyComponentNode;
    action: Action;
  };
}

// Component implementation
export function A2UIButton({ node, processor, surfaceId, onUserAction, theme }: A2UIComponentProps<ButtonNode>) {
  const handleClick = () => {
    if (!node.properties.action) return;
    emitUserAction({
      actionName: node.properties.action.name,
      sourceComponentId: node.id,
      timestamp: new Date().toISOString(),
      context: resolveActionContext(node.properties.action.context, processor, node, surfaceId),
      onUserAction
    });
  };

  return (
    <Button onClick={handleClick} className={cn(theme?.components.Button)} style={{ flex: node.weight }}>
      <A2UIRenderer node={node.properties.child} processor={processor} surfaceId={surfaceId} onUserAction={onUserAction} theme={theme} />
    </Button>
  );
}
```

### Example 2: Data-Bound TextField

```typescript
export function A2UITextField({ node, processor, surfaceId, theme }: A2UIComponentProps<TextFieldNode>) {
  const labelValue = useA2UIValue(node.properties.label, processor, node, surfaceId);
  const initialValue = useA2UIValue(node.properties.text, processor, node, surfaceId);
  const [value, setValue] = useState(initialValue || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);

    if (node.properties.text && 'path' in node.properties.text && node.properties.text.path) {
      processor?.setData(node, node.properties.text.path, newValue, surfaceId || '@default');
    }
  };

  return (
    <div className="flex flex-col gap-2" style={{ flex: node.weight }}>
      {labelValue && <Label htmlFor={node.id}>{labelValue}</Label>}
      <Input id={node.id} value={value} onChange={handleChange} />
    </div>
  );
}
```

### Example 3: Container Row

```typescript
const distributionClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  spaceBetween: 'justify-between',
  spaceAround: 'justify-around',
  spaceEvenly: 'justify-evenly',
};

export function A2UIRow({ node, processor, surfaceId, onUserAction, theme }: A2UIComponentProps<RowNode>) {
  const { distribution = 'start', alignment = 'stretch' } = node.properties;

  return (
    <div className={cn('flex flex-row gap-2', distributionClasses[distribution], theme?.components.Row)} style={{ flex: node.weight }}>
      {node.properties.children.map((child) => (
        <A2UIRenderer key={child.id} node={child} processor={processor} surfaceId={surfaceId} onUserAction={onUserAction} theme={theme} />
      ))}
    </div>
  );
}
```

## Integration with Project

This skill is designed for the `a2ui-component` monorepo structure:

**Target Package:** `a2ui-react-renderer/`
- Main renderer: `src/A2UIRenderer.tsx`
- Component directory: `src/a2ui-components/`
- Type definitions: `src/types/`
- Utilities: `src/utils/` and `src/hooks/`

**Dependencies:**
- `@a2ui-web/lit-core` - Type definitions and core protocol
- `@a2ui-web/shadcn-ui` - UI component library
- `@a2ui-web/animations` - Framer Motion and icons
- `react` - React 17+ compatible

**Build System:**
- Uses tsup with `bundle: false` to preserve module structure
- TypeScript with strict mode
- ESM output format only
