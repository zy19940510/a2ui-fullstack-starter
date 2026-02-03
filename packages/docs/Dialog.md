# Dialog Component

Modal dialog component based on shadcn/ui with A2UI protocol support.

## Component Type

`Dialog`

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `trigger` | string | Yes | ID of trigger component (button/link that opens dialog) |
| `content` | string | Yes | ID of content component to display in dialog |
| `title` | BoundValue<string> | No | Dialog title text |
| `description` | BoundValue<string> | No | Dialog description text |
| `className` | BoundValue<string> | No | Additional CSS classes for dialog content |

## Example Usage

### Basic Dialog

```json
[
  {"surfaceUpdate": {"surfaceId": "ui", "components": [
    {"id": "confirm-dialog", "component": {"Dialog": {
      "trigger": "delete-trigger",
      "content": "delete-content",
      "title": {"literalString": "Confirm Deletion"},
      "description": {"literalString": "Are you sure you want to delete this item?"}
    }}},
    {"id": "delete-trigger", "component": {"Button": {
      "child": "trigger-text",
      "variant": {"literalString": "destructive"},
      "action": {"name": "open-dialog"}
    }}},
    {"id": "trigger-text", "component": {"Typography": {
      "text": {"literalString": "Delete"}
    }}},
    {"id": "delete-content", "component": {"Column": {
      "children": {"explicitList": ["confirm-btn", "cancel-btn"]}
    }}},
    {"id": "confirm-btn", "component": {"Button": {
      "child": "confirm-text",
      "variant": {"literalString": "destructive"},
      "action": {"name": "confirm-delete"}
    }}},
    {"id": "confirm-text", "component": {"Typography": {
      "text": {"literalString": "Yes, delete it"}
    }}},
    {"id": "cancel-btn", "component": {"Button": {
      "child": "cancel-text",
      "variant": {"literalString": "outline"},
      "action": {"name": "cancel-delete"}
    }}},
    {"id": "cancel-text", "component": {"Typography": {
      "text": {"literalString": "Cancel"}
    }}}
  ]}},
  {"beginRendering": {"surfaceId": "ui", "root": "confirm-dialog"}}
]
```

### Form in Dialog

```json
[
  {"surfaceUpdate": {"surfaceId": "user-mgmt", "components": [
    {"id": "add-user-dialog", "component": {"Dialog": {
      "trigger": "add-user-trigger",
      "content": "user-form",
      "title": {"literalString": "Add New User"},
      "description": {"literalString": "Enter user details below"}
    }}},
    {"id": "add-user-trigger", "component": {"Button": {
      "child": "add-trigger-text",
      "variant": {"literalString": "default"},
      "action": {"name": "open-add-user"}
    }}},
    {"id": "add-trigger-text", "component": {"Typography": {
      "text": {"literalString": "Add User"}
    }}},
    {"id": "user-form", "component": {"Column": {
      "children": {"explicitList": ["name-input", "email-input", "role-select", "submit-row"]}
    }}},
    {"id": "name-input", "component": {"Input": {
      "label": {"literalString": "Name"},
      "text": {"path": "/newUser/name"},
      "placeholder": {"literalString": "John Doe"}
    }}},
    {"id": "email-input", "component": {"Input": {
      "label": {"literalString": "Email"},
      "text": {"path": "/newUser/email"},
      "type": {"literalString": "email"},
      "placeholder": {"literalString": "john@example.com"}
    }}},
    {"id": "role-select", "component": {"Select": {
      "label": {"literalString": "Role"},
      "value": {"path": "/newUser/role"},
      "options": [
        {"label": {"literalString": "Admin"}, "value": "admin"},
        {"label": {"literalString": "Editor"}, "value": "editor"},
        {"label": {"literalString": "Viewer"}, "value": "viewer"}
      ]
    }}},
    {"id": "submit-row", "component": {"Row": {
      "distribution": "end",
      "children": {"explicitList": ["cancel-btn", "save-btn"]}
    }}},
    {"id": "cancel-btn", "component": {"Button": {
      "child": "cancel-text",
      "variant": {"literalString": "outline"},
      "action": {"name": "cancel-add-user"}
    }}},
    {"id": "cancel-text", "component": {"Typography": {
      "text": {"literalString": "Cancel"}
    }}},
    {"id": "save-btn", "component": {"Button": {
      "child": "save-text",
      "variant": {"literalString": "default"},
      "action": {
        "name": "save-user",
        "context": [
          {"key": "name", "value": {"path": "/newUser/name"}},
          {"key": "email", "value": {"path": "/newUser/email"}},
          {"key": "role", "value": {"path": "/newUser/role"}}
        ]
      }
    }}},
    {"id": "save-text", "component": {"Typography": {
      "text": {"literalString": "Save User"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "user-mgmt", "contents": [
    {"key": "newUser", "valueMap": [
      {"key": "name", "valueString": ""},
      {"key": "email", "valueString": ""},
      {"key": "role", "valueString": "viewer"}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "user-mgmt", "root": "add-user-dialog"}}
]
```

### Info Dialog

```json
[
  {"surfaceUpdate": {"surfaceId": "help", "components": [
    {"id": "help-dialog", "component": {"Dialog": {
      "trigger": "help-trigger",
      "content": "help-content",
      "title": {"literalString": "Need Help?"},
      "description": {"literalString": "Here's how to get started"}
    }}},
    {"id": "help-trigger", "component": {"Button": {
      "child": "help-icon",
      "variant": {"literalString": "ghost"},
      "size": {"literalString": "icon"},
      "action": {"name": "open-help"}
    }}},
    {"id": "help-icon", "component": {"Icon": {
      "name": {"literalString": "help"},
      "size": {"literalNumber": 20}
    }}},
    {"id": "help-content", "component": {"Column": {
      "children": {"explicitList": ["help-text", "close-btn"]}
    }}},
    {"id": "help-text", "component": {"Typography": {
      "text": {"literalString": "1. Click the **Add** button\\n2. Fill in the form\\n3. Click **Save** to confirm"}
    }}},
    {"id": "close-btn", "component": {"Button": {
      "child": "close-text",
      "variant": {"literalString": "default"},
      "action": {"name": "close-help"}
    }}},
    {"id": "close-text", "component": {"Typography": {
      "text": {"literalString": "Got it!"}
    }}}
  ]}},
  {"beginRendering": {"surfaceId": "help", "root": "help-dialog"}}
]
```

### Image Preview Dialog

```json
[
  {"surfaceUpdate": {"surfaceId": "gallery", "components": [
    {"id": "image-dialog", "component": {"Dialog": {
      "trigger": "thumbnail",
      "content": "full-image",
      "title": {"path": "/selectedImage/title"}
    }}},
    {"id": "thumbnail", "component": {"Image": {
      "url": {"path": "/selectedImage/thumbnailUrl"},
      "fit": "cover"
    }}},
    {"id": "full-image", "component": {"Image": {
      "url": {"path": "/selectedImage/fullUrl"},
      "fit": "contain"
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "gallery", "contents": [
    {"key": "selectedImage", "valueMap": [
      {"key": "title", "valueString": "Beautiful Landscape"},
      {"key": "thumbnailUrl", "valueString": "https://example.com/thumb.jpg"},
      {"key": "fullUrl", "valueString": "https://example.com/full.jpg"}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "gallery", "root": "image-dialog"}}
]
```

### Settings Dialog

```json
[
  {"surfaceUpdate": {"surfaceId": "app", "components": [
    {"id": "settings-dialog", "component": {"Dialog": {
      "trigger": "settings-trigger",
      "content": "settings-content",
      "title": {"literalString": "Settings"}
    }}},
    {"id": "settings-trigger", "component": {"Button": {
      "child": "settings-icon",
      "variant": {"literalString": "ghost"},
      "size": {"literalString": "icon"},
      "action": {"name": "open-settings"}
    }}},
    {"id": "settings-icon", "component": {"Icon": {
      "name": {"literalString": "settings"},
      "size": {"literalNumber": 20}
    }}},
    {"id": "settings-content", "component": {"Column": {
      "children": {"explicitList": ["theme-section", "notifications-section", "save-row"]}
    }}},
    {"id": "theme-section", "component": {"Column": {
      "children": {"explicitList": ["theme-label", "theme-select"]}
    }}},
    {"id": "theme-label", "component": {"Typography": {
      "text": {"literalString": "Theme"},
      "variant": {"literalString": "h5"}
    }}},
    {"id": "theme-select", "component": {"Select": {
      "value": {"path": "/settings/theme"},
      "options": [
        {"label": {"literalString": "Light"}, "value": "light"},
        {"label": {"literalString": "Dark"}, "value": "dark"},
        {"label": {"literalString": "System"}, "value": "system"}
      ]
    }}},
    {"id": "notifications-section", "component": {"Column": {
      "children": {"explicitList": ["notifications-label", "email-checkbox", "push-checkbox"]}
    }}},
    {"id": "notifications-label", "component": {"Typography": {
      "text": {"literalString": "Notifications"},
      "variant": {"literalString": "h5"}
    }}},
    {"id": "email-checkbox", "component": {"Checkbox": {
      "label": {"literalString": "Email notifications"},
      "checked": {"path": "/settings/emailNotifications"}
    }}},
    {"id": "push-checkbox", "component": {"Checkbox": {
      "label": {"literalString": "Push notifications"},
      "checked": {"path": "/settings/pushNotifications"}
    }}},
    {"id": "save-row", "component": {"Row": {
      "distribution": "end",
      "children": {"explicitList": ["save-settings-btn"]}
    }}},
    {"id": "save-settings-btn", "component": {"Button": {
      "child": "save-settings-text",
      "variant": {"literalString": "default"},
      "action": {
        "name": "save-settings",
        "context": [
          {"key": "theme", "value": {"path": "/settings/theme"}},
          {"key": "emailNotifications", "value": {"path": "/settings/emailNotifications"}},
          {"key": "pushNotifications", "value": {"path": "/settings/pushNotifications"}}
        ]
      }
    }}},
    {"id": "save-settings-text", "component": {"Typography": {
      "text": {"literalString": "Save Changes"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "app", "contents": [
    {"key": "settings", "valueMap": [
      {"key": "theme", "valueString": "light"},
      {"key": "emailNotifications", "valueBoolean": true},
      {"key": "pushNotifications", "valueBoolean": false}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "app", "root": "settings-dialog"}}
]
```

## Dialog State Management

The Dialog component manages its own open/close state internally:

- **Opening**: When the trigger component's action is invoked
- **Closing**: When user clicks outside dialog, presses Escape, or triggers a close action
- **Close Actions**: Buttons in dialog content that emit actions will typically close the dialog automatically

## Notes

- Based on shadcn/ui Dialog component
- Automatically manages open/close state
- Overlay darkens background when open
- Modal behavior - blocks interaction with page content
- Closes on Escape key or clicking outside
- Accessible with proper ARIA attributes
- Scrollable content if taller than viewport
- Title and description are optional but recommended for accessibility
- Trigger can be any component (button, icon, image, etc.)
- Content can be any complex component structure

## Common Use Cases

- Confirmation dialogs (delete, logout, etc.)
- Forms (create, edit, settings)
- Information display (help, details, previews)
- Alert messages
- Image/media viewers
- Multi-step workflows
- User onboarding
- Terms and conditions

## Styling

The component uses:
- shadcn/ui default Dialog styling
- Semi-transparent overlay background
- Centered modal with white background
- Shadow and rounded corners
- Header with title and description
- Close button (X icon) in top-right
- Responsive sizing (adapts to content and viewport)
- Theme customization via `className` prop
