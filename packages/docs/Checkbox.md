# Checkbox Component

Checkbox input component based on shadcn/ui with A2UI protocol support.

## Component Type

`Checkbox`

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | BoundValue<string> | Yes | Checkbox label text |
| `checked` | BoundValue<boolean> | Yes | Checked state (two-way binding) |
| `disabled` | BoundValue<boolean> | No | Disabled state (default: false) |
| `action` | Action | No | Action triggered when checkbox state changes |
| `className` | BoundValue<string> | No | Additional CSS classes |

## Example Usage

### Basic Checkbox

```json
[
  {"surfaceUpdate": {"surfaceId": "form", "components": [
    {"id": "terms-checkbox", "component": {"Checkbox": {
      "label": {"literalString": "I agree to the terms and conditions"},
      "checked": {"path": "/form/agreedToTerms"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "form", "contents": [
    {"key": "form", "valueMap": [
      {"key": "agreedToTerms", "valueBoolean": false}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "form", "root": "terms-checkbox"}}
]
```

### Checkbox with Initial Value

```json
{"id": "subscribe-checkbox", "component": {"Checkbox": {
  "label": {"literalString": "Subscribe to newsletter"},
  "checked": {"path": "/preferences/subscribe", "literalBoolean": true}
}}}
```

### Disabled Checkbox

```json
{"id": "readonly-checkbox", "component": {"Checkbox": {
  "label": {"literalString": "Email verified"},
  "checked": {"literalBoolean": true},
  "disabled": {"literalBoolean": true}
}}}
```

### Checkbox with Action

```json
[
  {"surfaceUpdate": {"surfaceId": "settings", "components": [
    {"id": "notifications-checkbox", "component": {"Checkbox": {
      "label": {"literalString": "Enable notifications"},
      "checked": {"path": "/settings/notifications"},
      "action": {
        "name": "toggle-notifications",
        "context": [
          {"key": "enabled", "value": {"path": "/settings/notifications"}}
        ]
      }
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "settings", "contents": [
    {"key": "settings", "valueMap": [
      {"key": "notifications", "valueBoolean": true}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "settings", "root": "notifications-checkbox"}}
]
```

### Multiple Checkboxes (Settings Form)

```json
[
  {"surfaceUpdate": {"surfaceId": "preferences", "components": [
    {"id": "root", "component": {"Column": {
      "children": {"explicitList": ["header", "checkbox-list"]}
    }}},
    {"id": "header", "component": {"Typography": {
      "text": {"literalString": "Notification Preferences"},
      "variant": {"literalString": "h3"}
    }}},
    {"id": "checkbox-list", "component": {"Column": {
      "children": {"explicitList": ["email-check", "sms-check", "push-check"]}
    }}},
    {"id": "email-check", "component": {"Checkbox": {
      "label": {"literalString": "Email notifications"},
      "checked": {"path": "/preferences/email"}
    }}},
    {"id": "sms-check", "component": {"Checkbox": {
      "label": {"literalString": "SMS notifications"},
      "checked": {"path": "/preferences/sms"}
    }}},
    {"id": "push-check", "component": {"Checkbox": {
      "label": {"literalString": "Push notifications"},
      "checked": {"path": "/preferences/push"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "preferences", "contents": [
    {"key": "preferences", "valueMap": [
      {"key": "email", "valueBoolean": true},
      {"key": "sms", "valueBoolean": false},
      {"key": "push", "valueBoolean": true}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "preferences", "root": "root"}}
]
```

### Dynamic Checkbox List

```json
[
  {"surfaceUpdate": {"surfaceId": "features", "components": [
    {"id": "root", "component": {"Column": {
      "children": {"explicitList": ["title", "feature-list"]}
    }}},
    {"id": "title", "component": {"Typography": {
      "text": {"literalString": "Select Features"},
      "variant": {"literalString": "h3"}
    }}},
    {"id": "feature-list", "component": {"Column": {
      "children": {"template": {
        "dataBinding": "/features",
        "componentId": "feature-checkbox"
      }}
    }}},
    {"id": "feature-checkbox", "component": {"Checkbox": {
      "label": {"path": "/name"},
      "checked": {"path": "/enabled"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "features", "contents": [
    {"key": "features", "valueArray": [
      {"valueMap": [
        {"key": "name", "valueString": "Dark Mode"},
        {"key": "enabled", "valueBoolean": false}
      ]},
      {"valueMap": [
        {"key": "name", "valueString": "Auto-save"},
        {"key": "enabled", "valueBoolean": true}
      ]},
      {"valueMap": [
        {"key": "name", "valueString": "Analytics"},
        {"key": "enabled", "valueBoolean": false}
      ]}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "features", "root": "root"}}
]
```

### Checkbox in Card

```json
[
  {"surfaceUpdate": {"surfaceId": "consent", "components": [
    {"id": "consent-card", "component": {"Card": {
      "child": "consent-content"
    }}},
    {"id": "consent-content", "component": {"Column": {
      "children": {"explicitList": ["consent-title", "consent-desc", "consent-checkbox"]}
    }}},
    {"id": "consent-title", "component": {"Typography": {
      "text": {"literalString": "Privacy Notice"},
      "variant": {"literalString": "h4"}
    }}},
    {"id": "consent-desc", "component": {"Typography": {
      "text": {"literalString": "We use cookies to improve your experience. By checking this box, you agree to our privacy policy."}
    }}},
    {"id": "consent-checkbox", "component": {"Checkbox": {
      "label": {"literalString": "I accept the privacy policy"},
      "checked": {"path": "/consent/privacy"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "consent", "contents": [
    {"key": "consent", "valueMap": [
      {"key": "privacy", "valueBoolean": false}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "consent", "root": "consent-card"}}
]
```

## Data Binding

The Checkbox component supports two-way data binding:

1. **Reading**: The `checked` property with `path` binding reads from the data model
2. **Writing**: When user clicks the checkbox, the component automatically updates the data model at the specified path

```json
// Initial state
{"dataModelUpdate": {"surfaceId": "form", "contents": [
  {"key": "settings", "valueMap": [
    {"key": "darkMode", "valueBoolean": false}
  ]}
]}}

// Checkbox component
{"id": "dark-mode", "component": {"Checkbox": {
  "label": {"literalString": "Dark Mode"},
  "checked": {"path": "/settings/darkMode"}  // Reads false, writes updates back
}}}

// After user clicks, data model is automatically updated to true
```

## User Action Event

When clicked (and action is defined), the checkbox emits a user action:

```json
{
  "userAction": {
    "name": "toggle-notifications",
    "surfaceId": "settings",
    "sourceComponentId": "notifications-checkbox",
    "timestamp": "2026-01-31T10:00:00Z",
    "context": {
      "enabled": true
    }
  }
}
```

## Notes

- Based on shadcn/ui Checkbox component
- Supports two-way data binding via `checked` property with `path`
- Label is clickable and toggles checkbox
- Checked state shows a checkmark icon
- Disabled checkboxes appear grayed out and don't respond to clicks
- Supports `weight` property for flex layouts
- Keyboard accessible (Space to toggle)
- Action is triggered after state change (with updated value in context)

## Common Use Cases

- Terms and conditions acceptance
- Settings toggles
- Multi-select options
- Feature flags
- Consent forms
- Filter selections
- Task completion markers

## Styling

The component uses:
- shadcn/ui default Checkbox styling
- Checkmark icon when checked
- Hover and focus states
- Theme colors for checked state
- Disabled state styling
- Custom labels via Typography component
