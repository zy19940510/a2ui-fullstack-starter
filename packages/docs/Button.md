# Button Component

Button component based on shadcn/ui with A2UI protocol support.

## Component Type

`Button`

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `child` | string | Yes | ID of child component (typically Typography) |
| `action` | Action | Yes | Action triggered on click |
| `variant` | BoundValue<string> | No | Button style variant (default: 'default') |
| `size` | BoundValue<string> | No | Button size (default: 'default') |
| `disabled` | BoundValue<boolean> | No | Disabled state (default: false) |
| `className` | BoundValue<string> | No | Additional CSS classes |

## Variants

### Standard Variants (shadcn/ui)
- `default` - Primary button (blue background)
- `destructive` - Danger button (red background)
- `outline` - Outlined button (transparent with border)
- `secondary` - Secondary button (gray background)
- `ghost` - Ghost button (transparent, hover effect)
- `link` - Link-style button (text only, no background)

## Sizes

- `default` - Default size (h-9, px-4 py-2)
- `sm` - Small size (h-8, px-3)
- `lg` - Large size (h-10, px-8)
- `icon` - Icon button (size-9, square)
- `icon-sm` - Small icon button (size-8)
- `icon-lg` - Large icon button (size-10)

## Action Object

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `name` | string | Yes | Action identifier |
| `context` | Array<{key: string, value: BoundValue}> | No | Data to include in action |

## Example Usage

### Basic Button

```json
[
  {"surfaceUpdate": {"surfaceId": "ui", "components": [
    {"id": "submit-btn", "component": {"Button": {
      "child": "submit-text",
      "action": {"name": "submit-form"},
      "variant": {"literalString": "default"},
      "size": {"literalString": "lg"}
    }}},
    {"id": "submit-text", "component": {"Typography": {
      "text": {"literalString": "Submit"},
      "variant": {"literalString": "inherit"}
    }}}
  ]}},
  {"beginRendering": {"surfaceId": "ui", "root": "submit-btn"}}
]
```

### Button with Action Context

```json
{"id": "delete-btn", "component": {"Button": {
  "child": "delete-text",
  "variant": {"literalString": "destructive"},
  "action": {
    "name": "delete-item",
    "context": [
      {"key": "itemId", "value": {"path": "/item/id"}},
      {"key": "itemName", "value": {"path": "/item/name"}}
    ]
  }
}}}
```

### Icon Button

```json
[
  {"surfaceUpdate": {"surfaceId": "ui", "components": [
    {"id": "close-btn", "component": {"Button": {
      "child": "close-icon",
      "variant": {"literalString": "ghost"},
      "size": {"literalString": "icon"},
      "action": {"name": "close-dialog"}
    }}},
    {"id": "close-icon", "component": {"Icon": {
      "name": {"literalString": "x"},
      "size": {"literalNumber": 18}
    }}}
  ]}},
  {"beginRendering": {"surfaceId": "ui", "root": "close-btn"}}
]
```

### Disabled Button

```json
{"id": "disabled-btn", "component": {"Button": {
  "child": "btn-text",
  "action": {"name": "submit"},
  "disabled": {"literalBoolean": true}
}}}
```

### Dynamic Disabled State

```json
[
  {"surfaceUpdate": {"surfaceId": "form", "components": [
    {"id": "submit-btn", "component": {"Button": {
      "child": "submit-text",
      "action": {"name": "submit-form"},
      "disabled": {"path": "/form/isSubmitting"}
    }}},
    {"id": "submit-text", "component": {"Typography": {
      "text": {"literalString": "Submit"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "form", "contents": [
    {"key": "form", "valueMap": [
      {"key": "isSubmitting", "valueBoolean": false}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "form", "root": "submit-btn"}}
]
```

## User Action Event

When clicked, the button emits a user action:

```json
{
  "userAction": {
    "name": "submit-form",
    "surfaceId": "ui",
    "sourceComponentId": "submit-btn",
    "timestamp": "2026-01-31T10:00:00Z",
    "context": {
      "itemId": "123",
      "itemName": "Example Item"
    }
  }
}
```

## Notes

- Based on shadcn/ui Button component
- Supports multi-device interaction (mouse, touch, keyboard)
- Auto prevents default behavior for button clicks
- Disabled buttons don't emit actions
- Supports `weight` property for flex layouts
- Child component typically uses `variant: "inherit"` to inherit button text styles
- Context values are resolved from data model paths before emission
- Event type (`click`, `touch`, `keyboard`) included in DOM attributes
