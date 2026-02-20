# Tabs Component

Tab navigation component based on shadcn/ui with A2UI protocol support.

## Component Type

`Tabs`

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `items` | Array<{title: BoundValue<string>, content: string}> | Yes | Array of tab items with titles and content component IDs |
| `defaultValue` | BoundValue<string> | No | ID of initially selected tab (defaults to first tab) |
| `className` | BoundValue<string> | No | Additional CSS classes |

## Example Usage

### Basic Tabs

```json
[
  {"surfaceUpdate": {"surfaceId": "profile", "components": [
    {"id": "user-tabs", "component": {"Tabs": {
      "items": [
        {"title": {"literalString": "Profile"}, "content": "profile-panel"},
        {"title": {"literalString": "Settings"}, "content": "settings-panel"},
        {"title": {"literalString": "Security"}, "content": "security-panel"}
      ]
    }}},
    {"id": "profile-panel", "component": {"Column": {
      "children": {"explicitList": ["name-field", "bio-field"]}
    }}},
    {"id": "name-field", "component": {"Input": {
      "label": {"literalString": "Name"},
      "text": {"path": "/user/name"}
    }}},
    {"id": "bio-field", "component": {"Input": {
      "label": {"literalString": "Bio"},
      "text": {"path": "/user/bio"}
    }}},
    {"id": "settings-panel", "component": {"Column": {
      "children": {"explicitList": ["theme-select", "language-select"]}
    }}},
    {"id": "theme-select", "component": {"Select": {
      "label": {"literalString": "Theme"},
      "value": {"path": "/settings/theme"},
      "options": [
        {"label": {"literalString": "Light"}, "value": "light"},
        {"label": {"literalString": "Dark"}, "value": "dark"}
      ]
    }}},
    {"id": "language-select", "component": {"Select": {
      "label": {"literalString": "Language"},
      "value": {"path": "/settings/language"},
      "options": [
        {"label": {"literalString": "English"}, "value": "en"},
        {"label": {"literalString": "Spanish"}, "value": "es"}
      ]
    }}},
    {"id": "security-panel", "component": {"Column": {
      "children": {"explicitList": ["password-field", "2fa-checkbox"]}
    }}},
    {"id": "password-field", "component": {"Input": {
      "label": {"literalString": "New Password"},
      "text": {"path": "/security/newPassword"},
      "type": {"literalString": "password"}
    }}},
    {"id": "2fa-checkbox", "component": {"Checkbox": {
      "label": {"literalString": "Enable two-factor authentication"},
      "checked": {"path": "/security/twoFactorEnabled"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "profile", "contents": [
    {"key": "user", "valueMap": [
      {"key": "name", "valueString": "John Doe"},
      {"key": "bio", "valueString": "Software developer"}
    ]},
    {"key": "settings", "valueMap": [
      {"key": "theme", "valueString": "light"},
      {"key": "language", "valueString": "en"}
    ]},
    {"key": "security", "valueMap": [
      {"key": "newPassword", "valueString": ""},
      {"key": "twoFactorEnabled", "valueBoolean": false}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "profile", "root": "user-tabs"}}
]
```

### Tabs with Default Selection

```json
{"id": "settings-tabs", "component": {"Tabs": {
  "defaultValue": {"literalString": "notifications-panel"},
  "items": [
    {"title": {"literalString": "General"}, "content": "general-panel"},
    {"title": {"literalString": "Notifications"}, "content": "notifications-panel"},
    {"title": {"literalString": "Privacy"}, "content": "privacy-panel"}
  ]
}}}
```

### Product Details Tabs

```json
[
  {"surfaceUpdate": {"surfaceId": "product", "components": [
    {"id": "product-tabs", "component": {"Tabs": {
      "items": [
        {"title": {"literalString": "Description"}, "content": "description-panel"},
        {"title": {"literalString": "Specifications"}, "content": "specs-panel"},
        {"title": {"literalString": "Reviews"}, "content": "reviews-panel"}
      ]
    }}},
    {"id": "description-panel", "component": {"Column": {
      "children": {"explicitList": ["desc-text"]}
    }}},
    {"id": "desc-text", "component": {"Typography": {
      "text": {"path": "/product/description"}
    }}},
    {"id": "specs-panel", "component": {"Column": {
      "children": {"template": {
        "dataBinding": "/product/specifications",
        "componentId": "spec-row"
      }}
    }}},
    {"id": "spec-row", "component": {"Row": {
      "distribution": "spaceBetween",
      "children": {"explicitList": ["spec-name", "spec-value"]}
    }}},
    {"id": "spec-name", "component": {"Typography": {
      "text": {"path": "/name"},
      "variant": {"literalString": "caption"}
    }}},
    {"id": "spec-value", "component": {"Typography": {
      "text": {"path": "/value"}
    }}},
    {"id": "reviews-panel", "component": {"Column": {
      "children": {"template": {
        "dataBinding": "/product/reviews",
        "componentId": "review-card"
      }}
    }}},
    {"id": "review-card", "component": {"Card": {
      "child": "review-content"
    }}},
    {"id": "review-content", "component": {"Column": {
      "children": {"explicitList": ["review-author", "review-rating", "review-text"]}
    }}},
    {"id": "review-author", "component": {"Typography": {
      "text": {"path": "/author"},
      "variant": {"literalString": "h5"}
    }}},
    {"id": "review-rating", "component": {"Typography": {
      "text": {"path": "/rating"},
      "variant": {"literalString": "caption"}
    }}},
    {"id": "review-text", "component": {"Typography": {
      "text": {"path": "/text"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "product", "contents": [
    {"key": "product", "valueMap": [
      {"key": "description", "valueString": "High-quality wireless headphones with active noise cancellation."},
      {"key": "specifications", "valueArray": [
        {"valueMap": [
          {"key": "name", "valueString": "Battery Life"},
          {"key": "value", "valueString": "30 hours"}
        ]},
        {"valueMap": [
          {"key": "name", "valueString": "Weight"},
          {"key": "value", "valueString": "250g"}
        ]},
        {"valueMap": [
          {"key": "name", "valueString": "Connectivity"},
          {"key": "value", "valueString": "Bluetooth 5.0"}
        ]}
      ]},
      {"key": "reviews", "valueArray": [
        {"valueMap": [
          {"key": "author", "valueString": "Alice Johnson"},
          {"key": "rating", "valueString": "⭐⭐⭐⭐⭐"},
          {"key": "text", "valueString": "Amazing sound quality!"}
        ]},
        {"valueMap": [
          {"key": "author", "valueString": "Bob Smith"},
          {"key": "rating", "valueString": "⭐⭐⭐⭐"},
          {"key": "text", "valueString": "Great, but a bit pricey."}
        ]}
      ]}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "product", "root": "product-tabs"}}
]
```

### Dashboard Tabs

```json
[
  {"surfaceUpdate": {"surfaceId": "dashboard", "components": [
    {"id": "dashboard-tabs", "component": {"Tabs": {
      "items": [
        {"title": {"literalString": "Overview"}, "content": "overview-panel"},
        {"title": {"literalString": "Analytics"}, "content": "analytics-panel"},
        {"title": {"literalString": "Reports"}, "content": "reports-panel"}
      ]
    }}},
    {"id": "overview-panel", "component": {"Row": {
      "children": {"explicitList": ["stat1", "stat2", "stat3"]}
    }}},
    {"id": "stat1", "weight": 1, "component": {"Card": {
      "child": "stat1-content"
    }}},
    {"id": "stat1-content", "component": {"Column": {
      "children": {"explicitList": ["stat1-label", "stat1-value"]}
    }}},
    {"id": "stat1-label", "component": {"Typography": {
      "text": {"literalString": "Total Sales"},
      "variant": {"literalString": "caption"}
    }}},
    {"id": "stat1-value", "component": {"Typography": {
      "text": {"literalString": "$45,231"},
      "variant": {"literalString": "h2"}
    }}},
    {"id": "stat2", "weight": 1, "component": {"Card": {
      "child": "stat2-content"
    }}},
    {"id": "stat2-content", "component": {"Column": {
      "children": {"explicitList": ["stat2-label", "stat2-value"]}
    }}},
    {"id": "stat2-label", "component": {"Typography": {
      "text": {"literalString": "New Users"},
      "variant": {"literalString": "caption"}
    }}},
    {"id": "stat2-value", "component": {"Typography": {
      "text": {"literalString": "1,234"},
      "variant": {"literalString": "h2"}
    }}},
    {"id": "stat3", "weight": 1, "component": {"Card": {
      "child": "stat3-content"
    }}},
    {"id": "stat3-content", "component": {"Column": {
      "children": {"explicitList": ["stat3-label", "stat3-value"]}
    }}},
    {"id": "stat3-label", "component": {"Typography": {
      "text": {"literalString": "Growth"},
      "variant": {"literalString": "caption"}
    }}},
    {"id": "stat3-value", "component": {"Typography": {
      "text": {"literalString": "+12.5%"},
      "variant": {"literalString": "h2"}
    }}},
    {"id": "analytics-panel", "component": {"Typography": {
      "text": {"literalString": "Analytics data coming soon..."}
    }}},
    {"id": "reports-panel", "component": {"Typography": {
      "text": {"literalString": "Reports will be displayed here..."}
    }}}
  ]}},
  {"beginRendering": {"surfaceId": "dashboard", "root": "dashboard-tabs"}}
]
```

### Dynamic Tab Titles

```json
[
  {"surfaceUpdate": {"surfaceId": "docs", "components": [
    {"id": "doc-tabs", "component": {"Tabs": {
      "items": [
        {"title": {"path": "/tab1/title"}, "content": "tab1-content"},
        {"title": {"path": "/tab2/title"}, "content": "tab2-content"},
        {"title": {"path": "/tab3/title"}, "content": "tab3-content"}
      ]
    }}},
    {"id": "tab1-content", "component": {"Typography": {
      "text": {"path": "/tab1/content"}
    }}},
    {"id": "tab2-content", "component": {"Typography": {
      "text": {"path": "/tab2/content"}
    }}},
    {"id": "tab3-content", "component": {"Typography": {
      "text": {"path": "/tab3/content"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "docs", "contents": [
    {"key": "tab1", "valueMap": [
      {"key": "title", "valueString": "Introduction"},
      {"key": "content", "valueString": "Welcome to our documentation..."}
    ]},
    {"key": "tab2", "valueMap": [
      {"key": "title", "valueString": "Getting Started"},
      {"key": "content", "valueString": "Follow these steps to begin..."}
    ]},
    {"key": "tab3", "valueMap": [
      {"key": "title", "valueString": "Advanced"},
      {"key": "content", "valueString": "Advanced features include..."}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "docs", "root": "doc-tabs"}}
]
```

## Notes

- Based on shadcn/ui Tabs component
- Manages active tab state internally
- Only one tab panel is visible at a time
- Tab list displays all tab titles horizontally
- Active tab is highlighted with underline and theme color
- Keyboard accessible (Arrow keys to navigate tabs, Tab to move to content)
- Content panels can be any complex component structure
- Supports data-bound tab titles for dynamic content
- Automatically switches content when tab is clicked
- Supports `weight` property for flex layouts

## Common Use Cases

- User profile sections (Profile, Settings, Security)
- Product details (Description, Specs, Reviews)
- Dashboard views (Overview, Analytics, Reports)
- Documentation pages (Getting Started, API, Examples)
- Multi-section forms
- Content organization
- Feature categorization
- Settings panels

## Styling

The component uses:
- shadcn/ui default Tabs styling
- Horizontal tab list with borders
- Active tab indicator (underline)
- Hover states for inactive tabs
- Smooth content transitions
- Theme colors for active state
- Responsive sizing based on content
- Custom styling via `className` prop

## Best Practices

- Use 3-7 tabs (more than 7 may be hard to navigate)
- Keep tab titles concise (1-2 words)
- Ensure content panels have consistent structure
- Pre-load all tab content for instant switching
- Use meaningful default tab selection
- Consider mobile layout for many tabs
- Group related content logically
