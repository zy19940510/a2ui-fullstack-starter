# Select Component

Dropdown selection component based on shadcn/ui with A2UI protocol support.

## Component Type

`Select`

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | BoundValue<string> | No | Select field label |
| `value` | BoundValue<string> | Yes | Currently selected value (two-way binding) |
| `options` | Array<{label: BoundValue<string>, value: string}> | Yes | Available options |
| `placeholder` | BoundValue<string> | No | Placeholder text when no selection |
| `disabled` | BoundValue<boolean> | No | Disabled state (default: false) |
| `action` | Action | No | Action triggered when selection changes |
| `className` | BoundValue<string> | No | Additional CSS classes |

## Example Usage

### Basic Select

```json
[
  {"surfaceUpdate": {"surfaceId": "form", "components": [
    {"id": "country-select", "component": {"Select": {
      "label": {"literalString": "Country"},
      "value": {"path": "/form/country"},
      "placeholder": {"literalString": "Select a country"},
      "options": [
        {"label": {"literalString": "United States"}, "value": "us"},
        {"label": {"literalString": "United Kingdom"}, "value": "uk"},
        {"label": {"literalString": "Canada"}, "value": "ca"},
        {"label": {"literalString": "Australia"}, "value": "au"}
      ]
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "form", "contents": [
    {"key": "form", "valueMap": [
      {"key": "country", "valueString": ""}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "form", "root": "country-select"}}
]
```

### Select with Initial Value

```json
{"id": "language-select", "component": {"Select": {
  "label": {"literalString": "Language"},
  "value": {"path": "/settings/language", "literalString": "en"},
  "options": [
    {"label": {"literalString": "English"}, "value": "en"},
    {"label": {"literalString": "Spanish"}, "value": "es"},
    {"label": {"literalString": "French"}, "value": "fr"},
    {"label": {"literalString": "German"}, "value": "de"}
  ]
}}}
```

### Select with Action

```json
[
  {"surfaceUpdate": {"surfaceId": "settings", "components": [
    {"id": "theme-select", "component": {"Select": {
      "label": {"literalString": "Theme"},
      "value": {"path": "/settings/theme"},
      "options": [
        {"label": {"literalString": "Light"}, "value": "light"},
        {"label": {"literalString": "Dark"}, "value": "dark"},
        {"label": {"literalString": "Auto"}, "value": "auto"}
      ],
      "action": {
        "name": "change-theme",
        "context": [
          {"key": "theme", "value": {"path": "/settings/theme"}}
        ]
      }
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "settings", "contents": [
    {"key": "settings", "valueMap": [
      {"key": "theme", "valueString": "light"}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "settings", "root": "theme-select"}}
]
```

### Disabled Select

```json
{"id": "role-select", "component": {"Select": {
  "label": {"literalString": "User Role"},
  "value": {"literalString": "viewer"},
  "options": [
    {"label": {"literalString": "Admin"}, "value": "admin"},
    {"label": {"literalString": "Editor"}, "value": "editor"},
    {"label": {"literalString": "Viewer"}, "value": "viewer"}
  ],
  "disabled": {"literalBoolean": true}
}}}
```

### Form with Multiple Selects

```json
[
  {"surfaceUpdate": {"surfaceId": "booking", "components": [
    {"id": "root", "component": {"Column": {
      "children": {"explicitList": ["title", "date-select", "time-select", "guests-select", "submit-btn"]}
    }}},
    {"id": "title", "component": {"Typography": {
      "text": {"literalString": "Book a Table"},
      "variant": {"literalString": "h3"}
    }}},
    {"id": "date-select", "component": {"Select": {
      "label": {"literalString": "Date"},
      "value": {"path": "/booking/date"},
      "placeholder": {"literalString": "Select date"},
      "options": [
        {"label": {"literalString": "Today"}, "value": "2026-01-31"},
        {"label": {"literalString": "Tomorrow"}, "value": "2026-02-01"},
        {"label": {"literalString": "Feb 2"}, "value": "2026-02-02"}
      ]
    }}},
    {"id": "time-select", "component": {"Select": {
      "label": {"literalString": "Time"},
      "value": {"path": "/booking/time"},
      "placeholder": {"literalString": "Select time"},
      "options": [
        {"label": {"literalString": "6:00 PM"}, "value": "18:00"},
        {"label": {"literalString": "7:00 PM"}, "value": "19:00"},
        {"label": {"literalString": "8:00 PM"}, "value": "20:00"},
        {"label": {"literalString": "9:00 PM"}, "value": "21:00"}
      ]
    }}},
    {"id": "guests-select", "component": {"Select": {
      "label": {"literalString": "Number of Guests"},
      "value": {"path": "/booking/guests"},
      "options": [
        {"label": {"literalString": "1 person"}, "value": "1"},
        {"label": {"literalString": "2 people"}, "value": "2"},
        {"label": {"literalString": "3 people"}, "value": "3"},
        {"label": {"literalString": "4 people"}, "value": "4"},
        {"label": {"literalString": "5+ people"}, "value": "5+"}
      ]
    }}},
    {"id": "submit-btn", "component": {"Button": {
      "child": "submit-text",
      "action": {
        "name": "book-table",
        "context": [
          {"key": "date", "value": {"path": "/booking/date"}},
          {"key": "time", "value": {"path": "/booking/time"}},
          {"key": "guests", "value": {"path": "/booking/guests"}}
        ]
      }
    }}},
    {"id": "submit-text", "component": {"Typography": {
      "text": {"literalString": "Confirm Booking"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "booking", "contents": [
    {"key": "booking", "valueMap": [
      {"key": "date", "valueString": ""},
      {"key": "time", "valueString": ""},
      {"key": "guests", "valueString": "2"}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "booking", "root": "root"}}
]
```

### Dynamic Options from Data

```json
[
  {"surfaceUpdate": {"surfaceId": "products", "components": [
    {"id": "category-select", "component": {"Select": {
      "label": {"literalString": "Product Category"},
      "value": {"path": "/filters/category"},
      "placeholder": {"literalString": "All Categories"},
      "options": {"path": "/categories"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "products", "contents": [
    {"key": "filters", "valueMap": [
      {"key": "category", "valueString": ""}
    ]},
    {"key": "categories", "valueArray": [
      {"valueMap": [
        {"key": "label", "valueString": "Electronics"},
        {"key": "value", "valueString": "electronics"}
      ]},
      {"valueMap": [
        {"key": "label", "valueString": "Clothing"},
        {"key": "value", "valueString": "clothing"}
      ]},
      {"valueMap": [
        {"key": "label", "valueString": "Books"},
        {"key": "value", "valueString": "books"}
      ]}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "products", "root": "category-select"}}
]
```

### Cascading Selects

```json
[
  {"surfaceUpdate": {"surfaceId": "location", "components": [
    {"id": "root", "component": {"Column": {
      "children": {"explicitList": ["country-select", "city-select"]}
    }}},
    {"id": "country-select", "component": {"Select": {
      "label": {"literalString": "Country"},
      "value": {"path": "/location/country"},
      "options": [
        {"label": {"literalString": "United States"}, "value": "us"},
        {"label": {"literalString": "Canada"}, "value": "ca"}
      ],
      "action": {
        "name": "country-changed",
        "context": [
          {"key": "country", "value": {"path": "/location/country"}}
        ]
      }
    }}},
    {"id": "city-select", "component": {"Select": {
      "label": {"literalString": "City"},
      "value": {"path": "/location/city"},
      "placeholder": {"literalString": "Select a city"},
      "options": {"path": "/cities"},
      "disabled": {"path": "/location/countryNotSelected"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "location", "contents": [
    {"key": "location", "valueMap": [
      {"key": "country", "valueString": ""},
      {"key": "city", "valueString": ""},
      {"key": "countryNotSelected", "valueBoolean": true}
    ]},
    {"key": "cities", "valueArray": []}
  ]}},
  {"beginRendering": {"surfaceId": "location", "root": "root"}}
]
```

## Data Binding

The Select component supports two-way data binding:

1. **Reading**: The `value` property with `path` binding reads from the data model
2. **Writing**: When user selects an option, the component automatically updates the data model at the specified path

```json
// Initial state
{"dataModelUpdate": {"surfaceId": "form", "contents": [
  {"key": "preferences", "valueMap": [
    {"key": "theme", "valueString": "light"}
  ]}
]}}

// Select component
{"id": "theme-select", "component": {"Select": {
  "value": {"path": "/preferences/theme"},
  "options": [...]
}}}

// After user selects "dark", data model is automatically updated
```

## User Action Event

When selection changes (and action is defined), the select emits a user action:

```json
{
  "userAction": {
    "name": "change-theme",
    "surfaceId": "settings",
    "sourceComponentId": "theme-select",
    "timestamp": "2026-01-31T10:00:00Z",
    "context": {
      "theme": "dark"
    }
  }
}
```

## Notes

- Based on shadcn/ui Select component
- Supports two-way data binding via `value` property with `path`
- Options can be static array or dynamic from data model
- Placeholder shows when no value is selected
- Disabled selects appear grayed out and don't open
- Supports `weight` property for flex layouts
- Keyboard accessible (Arrow keys to navigate, Enter to select)
- Action is triggered after selection change (with new value in context)
- Dropdown automatically positions to avoid viewport overflow

## Common Use Cases

- Country/region selection
- Language preferences
- Category filters
- Sorting options
- Time zone selection
- Date/time pickers (as dropdowns)
- Status updates
- Priority levels
- Role assignments

## Styling

The component uses:
- shadcn/ui default Select styling
- Dropdown arrow icon
- Hover and focus states
- Theme colors for selected state
- Disabled state styling
- Scrollable dropdown for many options
- Custom trigger and content styling via `className`
