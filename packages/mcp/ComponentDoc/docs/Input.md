# Input Component

Text input field component based on shadcn/ui with A2UI protocol support.

## Component Type

`Input`

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | BoundValue<string> | Yes | Input field label |
| `text` | BoundValue<string> | No | Current input value (two-way binding) |
| `type` | BoundValue<string> | No | Input type (default: 'text') |
| `placeholder` | BoundValue<string> | No | Placeholder text |
| `disabled` | BoundValue<boolean> | No | Disabled state (default: false) |
| `required` | BoundValue<boolean> | No | Required field (default: false) |
| `className` | BoundValue<string> | No | Additional CSS classes |

## Input Types

- `text` - Standard text input (default)
- `email` - Email input with validation
- `password` - Password input (obscured)
- `number` - Numeric input
- `tel` - Telephone number input
- `url` - URL input with validation
- `search` - Search input with clear button

## Example Usage

### Basic Text Input

```json
[
  {"surfaceUpdate": {"surfaceId": "form", "components": [
    {"id": "name-input", "component": {"Input": {
      "label": {"literalString": "Full Name"},
      "text": {"path": "/form/name"},
      "placeholder": {"literalString": "Enter your name"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "form", "contents": [
    {"key": "form", "valueMap": [
      {"key": "name", "valueString": ""}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "form", "root": "name-input"}}
]
```

### Email Input with Validation

```json
{"id": "email-input", "component": {"Input": {
  "label": {"literalString": "Email Address"},
  "text": {"path": "/form/email"},
  "type": {"literalString": "email"},
  "placeholder": {"literalString": "you@example.com"},
  "required": {"literalBoolean": true}
}}}
```

### Password Input

```json
{"id": "password-input", "component": {"Input": {
  "label": {"literalString": "Password"},
  "text": {"path": "/form/password"},
  "type": {"literalString": "password"},
  "placeholder": {"literalString": "Enter password"},
  "required": {"literalBoolean": true}
}}}
```

### Number Input

```json
{"id": "age-input", "component": {"Input": {
  "label": {"literalString": "Age"},
  "text": {"path": "/form/age"},
  "type": {"literalString": "number"},
  "placeholder": {"literalString": "18"}
}}}
```

### Disabled Input

```json
{"id": "readonly-input", "component": {"Input": {
  "label": {"literalString": "User ID"},
  "text": {"literalString": "user-12345"},
  "disabled": {"literalBoolean": true}
}}}
```

### Dynamic Disabled State

```json
[
  {"surfaceUpdate": {"surfaceId": "form", "components": [
    {"id": "email-input", "component": {"Input": {
      "label": {"literalString": "Email"},
      "text": {"path": "/form/email"},
      "disabled": {"path": "/ui/isSubmitting"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "form", "contents": [
    {"key": "form", "valueMap": [{"key": "email", "valueString": ""}]},
    {"key": "ui", "valueMap": [{"key": "isSubmitting", "valueBoolean": false}]}
  ]}},
  {"beginRendering": {"surfaceId": "form", "root": "email-input"}}
]
```

### Complete Form with Multiple Inputs

```json
[
  {"surfaceUpdate": {"surfaceId": "registration", "components": [
    {"id": "root", "component": {"Column": {
      "children": {"explicitList": ["username-input", "email-input", "password-input"]}
    }}},
    {"id": "username-input", "component": {"Input": {
      "label": {"literalString": "Username"},
      "text": {"path": "/form/username"},
      "placeholder": {"literalString": "Choose a username"},
      "required": {"literalBoolean": true}
    }}},
    {"id": "email-input", "component": {"Input": {
      "label": {"literalString": "Email"},
      "text": {"path": "/form/email"},
      "type": {"literalString": "email"},
      "placeholder": {"literalString": "you@example.com"},
      "required": {"literalBoolean": true}
    }}},
    {"id": "password-input", "component": {"Input": {
      "label": {"literalString": "Password"},
      "text": {"path": "/form/password"},
      "type": {"literalString": "password"},
      "placeholder": {"literalString": "Min. 8 characters"},
      "required": {"literalBoolean": true}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "registration", "contents": [
    {"key": "form", "valueMap": [
      {"key": "username", "valueString": ""},
      {"key": "email", "valueString": ""},
      {"key": "password", "valueString": ""}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "registration", "root": "root"}}
]
```

## Data Binding

The Input component supports two-way data binding:

1. **Reading**: The `text` property with `path` binding reads from the data model
2. **Writing**: When user types, the component automatically updates the data model at the specified path

```json
// Initial state
{"dataModelUpdate": {"surfaceId": "form", "contents": [
  {"key": "user", "valueMap": [
    {"key": "email", "valueString": "initial@example.com"}
  ]}
]}}

// Input component
{"id": "email", "component": {"Input": {
  "text": {"path": "/user/email"}  // Reads "initial@example.com", writes updates back
}}}

// After user types "new@example.com", data model is automatically updated
```

## Notes

- Based on shadcn/ui Input component
- Supports two-way data binding via `text` property with `path`
- Native HTML5 validation for email, URL, and other types
- Required fields show browser validation on form submit
- Disabled inputs don't allow user input and appear grayed out
- Supports `weight` property for flex layouts
- Label is rendered above the input field
- Placeholder text appears when input is empty

## Styling

The component inherits styles from:
- shadcn/ui default Input styling
- Tailwind CSS utility classes
- Theme customization via `className` prop
- Focus ring follows theme colors
