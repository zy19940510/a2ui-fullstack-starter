# shadcn/ui Component Mapping Guide

This document maps shadcn/ui components to A2UI component types, providing implementation guidelines for each.

## Component Mapping Matrix

| A2UI Component | shadcn/ui Component(s) | Complexity | Priority |
|----------------|------------------------|------------|----------|
| Button | Button | Low | High |
| Text | Typography (h1-h5, p) | Low | High |
| TextField | Input + Label | Medium | High |
| Checkbox | Checkbox + Label | Low | High |
| Card | Card | Low | High |
| Modal | Dialog | Medium | High |
| Tabs | Tabs | Medium | High |
| Row | div (flex-row) | Low | High |
| Column | div (flex-col) | Low | High |
| List | div (flex-col/row) | Low | Medium |
| Image | img | Low | Medium |
| Icon | Lucide icons | Low | Medium |
| Divider | Separator | Low | Medium |
| Slider | Slider | Low | Medium |
| MultipleChoice | Checkbox Group / Radio Group | Medium | Medium |
| DateTimeInput | Calendar + Input | High | Low |
| Video | video element | Low | Low |
| AudioPlayer | audio element | Low | Low |

## Implementation Templates

### Button Component

**A2UI Definition:**
```typescript
interface ButtonNode {
  type: "Button";
  properties: {
    child: AnyComponentNode;
    action: Action;
  };
}
```

**shadcn/ui Implementation:**
```tsx
import { Button } from '@a2ui-web/shadcn-ui/components/button';
import { A2UIRenderer } from '../A2UIRenderer';
import { emitUserAction } from '../utils/actions';

export function A2UIButton({
  node,
  processor,
  surfaceId,
  onUserAction,
  theme
}: A2UIComponentProps<ButtonNode>) {
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

  return (
    <Button
      onClick={handleClick}
      className={cn(theme?.components.Button)}
      style={theme?.additionalStyles?.Button}
      data-component-id={node.id}
      data-weight={node.weight}
      style={{ flex: node.weight }}
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

### Text Component

**A2UI Definition:**
```typescript
interface TextNode {
  type: "Text";
  properties: {
    text: StringValue;
    usageHint: "h1" | "h2" | "h3" | "h4" | "h5" | "caption" | "body";
  };
}
```

**shadcn/ui Implementation:**
```tsx
import { useA2UIValue } from '../hooks/useA2UIValue';
import { cn } from '@a2ui-web/shadcn-ui/lib/utils';

const usageHintComponents = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  caption: 'p',
  body: 'p',
} as const;

const usageHintClasses = {
  h1: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl',
  h2: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0',
  h3: 'scroll-m-20 text-2xl font-semibold tracking-tight',
  h4: 'scroll-m-20 text-xl font-semibold tracking-tight',
  h5: 'scroll-m-20 text-lg font-semibold tracking-tight',
  caption: 'text-sm text-muted-foreground',
  body: 'leading-7 [&:not(:first-child)]:mt-6',
};

export function A2UIText({
  node,
  processor,
  surfaceId,
  theme
}: A2UIComponentProps<TextNode>) {
  const textValue = useA2UIValue(
    node.properties.text,
    processor,
    node,
    surfaceId
  );

  const hint = node.properties.usageHint || 'body';
  const Component = usageHintComponents[hint];

  const classes = cn(
    usageHintClasses[hint],
    theme?.components.Text.all,
    theme?.components.Text[hint]
  );

  const styles = {
    flex: node.weight,
    ...(theme?.additionalStyles?.Text?.[hint] || {})
  };

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

### TextField Component

**A2UI Definition:**
```typescript
interface TextFieldNode {
  type: "TextField";
  properties: {
    text?: StringValue;
    label: StringValue;
    type?: "shortText" | "number" | "date" | "longText";
    validationRegexp?: string;
  };
}
```

**shadcn/ui Implementation:**
```tsx
import { Input } from '@a2ui-web/shadcn-ui/components/input';
import { Label } from '@a2ui-web/shadcn-ui/components/label';
import { Textarea } from '@a2ui-web/shadcn-ui/components/textarea';
import { useA2UIValue } from '../hooks/useA2UIValue';
import { useState, useEffect } from 'react';

export function A2UITextField({
  node,
  processor,
  surfaceId,
  theme
}: A2UIComponentProps<TextFieldNode>) {
  const labelValue = useA2UIValue(
    node.properties.label,
    processor,
    node,
    surfaceId
  );

  const initialValue = useA2UIValue(
    node.properties.text,
    processor,
    node,
    surfaceId
  );

  const [value, setValue] = useState(initialValue || '');

  useEffect(() => {
    if (initialValue !== undefined) {
      setValue(initialValue);
    }
  }, [initialValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;

    // Validate if regex provided
    if (node.properties.validationRegexp) {
      const regex = new RegExp(node.properties.validationRegexp);
      if (!regex.test(newValue)) {
        return; // Don't update if invalid
      }
    }

    setValue(newValue);

    // Update data model if text has a path binding
    if (node.properties.text && 'path' in node.properties.text && node.properties.text.path) {
      processor?.setData(
        node,
        node.properties.text.path,
        newValue,
        surfaceId || '@default'
      );
    }
  };

  const inputType = node.properties.type === 'number' ? 'number' :
                    node.properties.type === 'date' ? 'date' : 'text';

  const isLongText = node.properties.type === 'longText';

  return (
    <div
      className={cn('flex flex-col gap-2', theme?.components.TextField.container)}
      style={{ flex: node.weight }}
      data-component-id={node.id}
    >
      {labelValue && (
        <Label
          htmlFor={node.id}
          className={cn(theme?.components.TextField.label)}
        >
          {labelValue}
        </Label>
      )}

      {isLongText ? (
        <Textarea
          id={node.id}
          value={value}
          onChange={handleChange}
          className={cn(theme?.components.TextField.element)}
        />
      ) : (
        <Input
          id={node.id}
          type={inputType}
          value={value}
          onChange={handleChange}
          className={cn(theme?.components.TextField.element)}
        />
      )}
    </div>
  );
}
```

### Card Component

**A2UI Definition:**
```typescript
interface CardNode {
  type: "Card";
  properties: {
    child?: AnyComponentNode;
    children: AnyComponentNode[];
  };
}
```

**shadcn/ui Implementation:**
```tsx
import { Card } from '@a2ui-web/shadcn-ui/components/card';
import { A2UIRenderer } from '../A2UIRenderer';

export function A2UICard({
  node,
  processor,
  surfaceId,
  onUserAction,
  theme
}: A2UIComponentProps<CardNode>) {
  // Merge child and children
  const allChildren = [
    ...(node.properties.child ? [node.properties.child] : []),
    ...(node.properties.children || [])
  ];

  return (
    <Card
      className={cn('p-6', theme?.components.Card)}
      style={{ flex: node.weight }}
      data-component-id={node.id}
    >
      <div className="flex flex-col gap-4">
        {allChildren.map((child) => (
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
    </Card>
  );
}
```

### Modal Component

**A2UI Definition:**
```typescript
interface ModalNode {
  type: "Modal";
  properties: {
    entryPointChild: AnyComponentNode;  // Trigger button
    contentChild: AnyComponentNode;     // Modal content
  };
}
```

**shadcn/ui Implementation:**
```tsx
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@a2ui-web/shadcn-ui/components/dialog';
import { A2UIRenderer } from '../A2UIRenderer';
import { useState } from 'react';

export function A2UIModal({
  node,
  processor,
  surfaceId,
  onUserAction,
  theme
}: A2UIComponentProps<ModalNode>) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div data-component-id={`${node.id}-trigger`}>
          <A2UIRenderer
            node={node.properties.entryPointChild}
            processor={processor}
            surfaceId={surfaceId}
            onUserAction={onUserAction}
            theme={theme}
          />
        </div>
      </DialogTrigger>

      <DialogContent
        className={cn(theme?.components.Modal.element)}
        data-component-id={node.id}
      >
        <A2UIRenderer
          node={node.properties.contentChild}
          processor={processor}
          surfaceId={surfaceId}
          onUserAction={onUserAction}
          theme={theme}
        />
      </DialogContent>
    </Dialog>
  );
}
```

### Tabs Component

**A2UI Definition:**
```typescript
interface TabsNode {
  type: "Tabs";
  properties: {
    tabItems: Array<{
      title: StringValue;
      child: AnyComponentNode;
    }>;
  };
}
```

**shadcn/ui Implementation:**
```tsx
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@a2ui-web/shadcn-ui/components/tabs';
import { A2UIRenderer } from '../A2UIRenderer';
import { useA2UIValue } from '../hooks/useA2UIValue';

export function A2UITabs({
  node,
  processor,
  surfaceId,
  onUserAction,
  theme
}: A2UIComponentProps<TabsNode>) {
  const tabItems = node.properties.tabItems || [];
  const defaultValue = tabItems[0]?.child.id;

  return (
    <Tabs
      defaultValue={defaultValue}
      className={cn(theme?.components.Tabs.container)}
      style={{ flex: node.weight }}
      data-component-id={node.id}
    >
      <TabsList className={cn(theme?.components.Tabs.controls.all)}>
        {tabItems.map((item, index) => {
          const titleValue = useA2UIValue(
            item.title,
            processor,
            node,
            surfaceId
          );

          return (
            <TabsTrigger
              key={item.child.id}
              value={item.child.id}
              className={cn(theme?.components.Tabs.element)}
            >
              {titleValue || `Tab ${index + 1}`}
            </TabsTrigger>
          );
        })}
      </TabsList>

      {tabItems.map((item) => (
        <TabsContent
          key={item.child.id}
          value={item.child.id}
        >
          <A2UIRenderer
            node={item.child}
            processor={processor}
            surfaceId={surfaceId}
            onUserAction={onUserAction}
            theme={theme}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
```

### Row Component

**A2UI Definition:**
```typescript
interface RowNode {
  type: "Row";
  properties: {
    children: AnyComponentNode[];
    distribution?: "start" | "center" | "end" | "spaceBetween" | "spaceAround" | "spaceEvenly";
    alignment?: "start" | "center" | "end" | "stretch";
  };
}
```

**shadcn/ui Implementation:**
```tsx
import { A2UIRenderer } from '../A2UIRenderer';
import { cn } from '@a2ui-web/shadcn-ui/lib/utils';

const distributionClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  spaceBetween: 'justify-between',
  spaceAround: 'justify-around',
  spaceEvenly: 'justify-evenly',
};

const alignmentClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

export function A2UIRow({
  node,
  processor,
  surfaceId,
  onUserAction,
  theme
}: A2UIComponentProps<RowNode>) {
  const { distribution = 'start', alignment = 'stretch' } = node.properties;

  return (
    <div
      className={cn(
        'flex flex-row gap-2',
        distributionClasses[distribution],
        alignmentClasses[alignment],
        theme?.components.Row
      )}
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

### Column Component

**A2UI Definition:**
```typescript
interface ColumnNode {
  type: "Column";
  properties: {
    children: AnyComponentNode[];
    distribution?: "start" | "center" | "end" | "spaceBetween" | "spaceAround" | "spaceEvenly";
    alignment?: "start" | "center" | "end" | "stretch";
  };
}
```

**shadcn/ui Implementation:**
```tsx
import { A2UIRenderer } from '../A2UIRenderer';
import { cn } from '@a2ui-web/shadcn-ui/lib/utils';

const distributionClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  spaceBetween: 'justify-between',
  spaceAround: 'justify-around',
  spaceEvenly: 'justify-evenly',
};

const alignmentClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

export function A2UIColumn({
  node,
  processor,
  surfaceId,
  onUserAction,
  theme
}: A2UIComponentProps<ColumnNode>) {
  const { distribution = 'start', alignment = 'stretch' } = node.properties;

  return (
    <div
      className={cn(
        'flex flex-col gap-2',
        distributionClasses[distribution],
        alignmentClasses[alignment],
        theme?.components.Column
      )}
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

## Common Patterns

### Using useA2UIValue Hook

All StringValue/NumberValue/BooleanValue types should be resolved using the `useA2UIValue` hook:

```tsx
import { useA2UIValue } from '../hooks/useA2UIValue';

// In component
const textValue = useA2UIValue(
  node.properties.text,  // StringValue
  processor,
  node,
  surfaceId
);

// Hook implementation
export function useA2UIValue<T extends StringValue | NumberValue | BooleanValue>(
  value: T | null | undefined,
  processor: MessageProcessor | null,
  node: AnyComponentNode,
  surfaceId: string | null
): string | number | boolean | null {
  if (!value) return null;

  // Literal value
  if ('literalString' in value && value.literalString !== undefined) {
    return value.literalString;
  }
  if ('literalNumber' in value && value.literalNumber !== undefined) {
    return value.literalNumber;
  }
  if ('literalBoolean' in value && value.literalBoolean !== undefined) {
    return value.literalBoolean;
  }
  if ('literal' in value && value.literal !== undefined) {
    return value.literal;
  }

  // Data-bound value
  if ('path' in value && value.path && processor) {
    const data = processor.getData(
      node,
      value.path,
      surfaceId || '@default'
    );
    return data as string | number | boolean | null;
  }

  return null;
}
```

### Emitting User Actions

All interactive components use the `emitUserAction` utility:

```tsx
import { emitUserAction, resolveActionContext } from '../utils/actions';

// In event handler
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

// Utility implementation
export function emitUserAction({
  actionName,
  sourceComponentId,
  timestamp,
  context,
  onUserAction
}: {
  actionName: string;
  sourceComponentId: string;
  timestamp: string;
  context?: Record<string, unknown>;
  onUserAction?: (action: UserAction) => void;
}) {
  if (!onUserAction) return;

  const userAction: UserAction = {
    actionName,
    sourceComponentId,
    timestamp,
    ...(context && { context })
  };

  onUserAction(userAction);
}

export function resolveActionContext(
  actionContext: Action['context'],
  processor: MessageProcessor | null,
  node: AnyComponentNode,
  surfaceId: string | null
): Record<string, unknown> | undefined {
  if (!actionContext || !processor) return undefined;

  const resolved: Record<string, unknown> = {};

  for (const { key, value } of actionContext) {
    if (value.path) {
      resolved[key] = processor.getData(node, value.path, surfaceId || '@default');
    } else if (value.literalString !== undefined) {
      resolved[key] = value.literalString;
    } else if (value.literalNumber !== undefined) {
      resolved[key] = value.literalNumber;
    } else if (value.literalBoolean !== undefined) {
      resolved[key] = value.literalBoolean;
    }
  }

  return resolved;
}
```

### Weight System

All components should respect the `weight` property for flex layout:

```tsx
<ComponentWrapper
  style={{ flex: node.weight || 1 }}
  data-weight={node.weight}
>
  {/* content */}
</ComponentWrapper>
```

### Data Context Path

Components should pass through the `dataContextPath` for proper data resolution:

```tsx
// When setting data
processor?.setData(
  node,                    // Current component node
  relativePath,            // Path relative to node's dataContextPath
  value,
  surfaceId || '@default'
);

// When getting data
const data = processor?.getData(
  node,
  relativePath,
  surfaceId || '@default'
);
```
