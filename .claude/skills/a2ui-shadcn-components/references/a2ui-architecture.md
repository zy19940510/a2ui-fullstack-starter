# A2UI 0.8 Architecture Reference

This reference document details the A2UI 0.8 component architecture for creating shadcn/ui-based React components that conform to the A2UI protocol.

## Core Type System

### Component Node Structure

Every A2UI component follows the discriminated union pattern with a standardized structure:

```typescript
interface BaseComponentNode {
  id: string;              // Unique component identifier
  weight?: number;         // Flex weight for layout (maps to CSS flex property)
  dataContextPath?: string; // Path in data model for data binding
  slotName?: string;       // Named slot for component placement
}

// Discriminated union pattern
type AnyComponentNode =
  | TextNode
  | ButtonNode
  | ImageNode
  | IconNode
  | CheckboxNode
  | TextFieldNode
  | ... more component types

// Each specific component type
interface ButtonNode extends BaseComponentNode {
  type: "Button";
  properties: ResolvedButton;
}
```

### Properties Pattern

Component properties follow a resolved structure where child references are component nodes:

```typescript
// Primitive property pattern
export interface ResolvedButton {
  child: AnyComponentNode;  // Single child component
  action: Action;           // User interaction definition
}

// Container property pattern
export interface ResolvedRow {
  children: AnyComponentNode[];  // Multiple children
  distribution?: "start" | "center" | "end" | "spaceBetween" | "spaceAround" | "spaceEvenly";
  alignment?: "start" | "center" | "end" | "stretch";
}
```

## Data Binding System

### Primitive Value Types

All data-bindable values use a union pattern supporting both static literals and dynamic data paths:

```typescript
// String values can be literal or data-bound
export interface StringValue {
  path?: string;           // Data binding: '/user/name'
  literalString?: string;  // Static: 'Submit'
  literal?: string;        // Alternative static syntax
}

// Number values
export interface NumberValue {
  path?: string;
  literalNumber?: number;
  literal?: number;
}

// Boolean values
export interface BooleanValue {
  path?: string;
  literalBoolean?: boolean;
  literal?: boolean;
}
```

### Data Resolution

Components resolve data through the MessageProcessor:

```typescript
// Get data from a path
processor.getData(
  componentNode,      // Current component context
  relativePath,       // Path to data (e.g., '/user/name' or '.')
  surfaceId          // Surface identifier
): DataValue | null

// Special paths:
// '.' or '' - Returns the component's own dataContextPath
// Relative paths - Resolved against component's dataContextPath
```

### Action System

User interactions are defined via the Action interface:

```typescript
export interface Action {
  name: string;  // Action identifier (e.g., 'submitForm', 'onClick')

  // Optional context with data bindings
  context?: {
    key: string;
    value: {
      path?: string;           // Data binding
      literalString?: string;  // Static string
      literalNumber?: number;  // Static number
      literalBoolean?: boolean; // Static boolean
    };
  }[];
}

// When triggered, creates UserAction event:
interface UserAction {
  actionName: string;
  sourceComponentId: string;
  timestamp: string;  // ISO 8601
  context?: { [k: string]: unknown };  // Resolved values
}
```

## Component Implementation Patterns

### Pattern 1: Simple Leaf Component (Text, Icon, Image)

Components with no children, only properties:

```typescript
// Type definition
interface TextNode extends BaseComponentNode {
  type: "Text";
  properties: ResolvedText;
}

export interface ResolvedText {
  text: StringValue;
  usageHint: "h1" | "h2" | "h3" | "h4" | "h5" | "caption" | "body";
}

// React component structure
export function A2UIText({
  node,
  processor,
  surfaceId,
  onUserAction
}: A2UIComponentProps<TextNode>) {
  // Resolve StringValue to actual string
  const textValue = useA2UIValue(
    node.properties.text,
    processor,
    node,
    surfaceId
  );

  // Render based on usageHint
  const Component = usageHintToComponent[node.properties.usageHint || 'body'];

  return (
    <Component className={cn(/* classes */)}>
      {textValue || '(empty)'}
    </Component>
  );
}
```

### Pattern 2: Interactive Component (Button, Checkbox)

Components with action handling:

```typescript
// Type definition
interface ButtonNode extends BaseComponentNode {
  type: "Button";
  properties: ResolvedButton;
}

export interface ResolvedButton {
  child: AnyComponentNode;
  action: Action;
}

// React component with action
export function A2UIButton({
  node,
  processor,
  surfaceId,
  onUserAction
}: A2UIComponentProps<ButtonNode>) {
  const handleClick = () => {
    // Emit user action
    emitUserAction({
      actionName: node.properties.action.name,
      sourceComponentId: node.id,
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
    <button onClick={handleClick}>
      <A2UIRenderer
        node={node.properties.child}
        {...props}
      />
    </button>
  );
}
```

### Pattern 3: Container Component (Row, Column, List)

Components with multiple children:

```typescript
// Type definition
interface RowNode extends BaseComponentNode {
  type: "Row";
  properties: ResolvedRow;
}

export interface ResolvedRow {
  children: AnyComponentNode[];
  distribution?: "start" | "center" | "end" | "spaceBetween" | "spaceAround" | "spaceEvenly";
  alignment?: "start" | "center" | "end" | "stretch";
}

// React component
export function A2UIRow({
  node,
  processor,
  surfaceId,
  onUserAction
}: A2UIComponentProps<RowNode>) {
  const { distribution = 'start', alignment = 'stretch' } = node.properties;

  return (
    <div className={cn(
      'flex flex-row gap-2',
      distributionClasses[distribution],
      alignmentClasses[alignment]
    )}>
      {node.properties.children.map((child) => (
        <A2UIRenderer
          key={child.id}
          node={child}
          processor={processor}
          surfaceId={surfaceId}
          onUserAction={onUserAction}
        />
      ))}
    </div>
  );
}
```

### Pattern 4: Complex Component with Slots (Modal, Tabs)

Components with named child slots:

```typescript
// Type definition
interface ModalNode extends BaseComponentNode {
  type: "Modal";
  properties: ResolvedModal;
}

export interface ResolvedModal {
  entryPointChild: AnyComponentNode;  // Trigger (e.g., button)
  contentChild: AnyComponentNode;     // Modal content
}

// React component
export function A2UIModal({
  node,
  ...props
}: A2UIComponentProps<ModalNode>) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Entry point */}
      <div onClick={() => setOpen(true)}>
        <A2UIRenderer
          node={node.properties.entryPointChild}
          {...props}
        />
      </div>

      {/* Modal content */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <A2UIRenderer
            node={node.properties.contentChild}
            {...props}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

## Theme System

Components receive theme configuration for styling:

```typescript
export type Theme = {
  components: {
    Button: Record<string, boolean>;  // CSS classes
    Text: {
      all: Record<string, boolean>;
      h1: Record<string, boolean>;
      h2: Record<string, boolean>;
      // ... variant-specific classes
    };
    // ... other components
  };

  additionalStyles?: {
    Button?: Record<string, string>;  // CSS properties
    Text?: {
      h1: Record<string, string>;
      // ... variant-specific styles
    };
  };
};

// Usage in components
const classes = theme.components.Button;
const styles = theme.additionalStyles?.Button;

<button
  className={classNames(classes)}
  style={styles}
/>
```

## Lit Web Components Reference

The original Lit implementation provides key patterns:

### Base Root Class

```typescript
// All Lit components extend Root
export class Root extends SignalWatcher(LitElement) {
  @property() accessor surfaceId: SurfaceID | null = null;
  @property() accessor component: AnyComponentNode | null = null;
  @property({ attribute: false }) accessor childComponents: AnyComponentNode[] | null = null;
  @property({ attribute: false }) accessor processor: A2uiMessageProcessor | null = null;
  @property() accessor dataContextPath: string = "";
  @property() set weight(weight: string | number) {
    this.style.setProperty("--weight", `${weight}`);
  }

  // Reactive rendering with signals
  protected willUpdate(changedProperties: PropertyValues<this>): void {
    if (changedProperties.has("childComponents")) {
      this.#lightDomEffectDisposer = effect(() => {
        const allChildren = this.childComponents ?? null;
        const lightDomTemplate = this.renderComponentTree(allChildren);
        render(lightDomTemplate, this, { host: this });
      });
    }
  }
}
```

### Component Registration

```typescript
// Custom components can be registered
export class ComponentRegistry {
  register(
    typeName: string,
    constructor: CustomElementConstructorOf<HTMLElement>,
    tagName?: string
  ) {
    this.registry.set(typeName, constructor);
    const actualTagName = tagName || `a2ui-custom-${typeName.toLowerCase()}`;
    customElements.define(actualTagName, constructor);
  }
}

// Usage
componentRegistry.register('MyComponent', MyComponentClass);
```

## Key Principles for shadcn/ui Adaptation

1. **Type Safety**: Every component must have a corresponding TypeScript type definition
2. **Data Binding**: Use `useA2UIValue` hook to resolve StringValue/NumberValue/BooleanValue
3. **Action Handling**: All interactive components emit UserAction via `emitUserAction`
4. **Recursive Rendering**: Use `A2UIRenderer` to render child components
5. **Weight System**: Map `node.weight` to CSS flex property
6. **Data Context**: Respect `node.dataContextPath` for data resolution
7. **Slot System**: Handle `node.slotName` for component placement
8. **Theme Integration**: Apply theme classes and styles from theme configuration

## Component Catalog

Standard A2UI components that need shadcn/ui implementations:

| Component | Type | Children | Key Properties |
|-----------|------|----------|----------------|
| Text | Leaf | None | text, usageHint |
| Icon | Leaf | None | name |
| Image | Leaf | None | url, usageHint, fit |
| Video | Leaf | None | url |
| AudioPlayer | Leaf | None | url, description |
| Divider | Leaf | None | axis, color, thickness |
| Button | Interactive | Single child | action |
| Checkbox | Interactive | None | label, value |
| TextField | Interactive | None | label, text, type, validationRegexp |
| DateTimeInput | Interactive | None | value, enableDate, enableTime |
| MultipleChoice | Interactive | None | options, selections, maxAllowedSelections |
| Slider | Interactive | None | value, minValue, maxValue |
| Row | Container | Multiple | distribution, alignment |
| Column | Container | Multiple | distribution, alignment |
| List | Container | Multiple | direction, alignment |
| Card | Container | Multiple | (wraps children in card) |
| Tabs | Complex | Multiple | tabItems (title + child) |
| Modal | Complex | Two slots | entryPointChild, contentChild |
