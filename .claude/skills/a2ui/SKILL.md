---
name: a2ui
description: Generate A2UI 0.8 protocol compliant UI code. Use when building agent-driven interfaces, generating JSONL messages for surfaceUpdate/dataModelUpdate/beginRendering, creating forms, lists, cards, or any UI components that render across web/mobile/desktop platforms.
---

# A2UI Development Skill

This skill helps you generate A2UI (Agent to UI) protocol compliant code for building rich, interactive user interfaces that AI agents can stream to clients.

## Protocol Version

This skill targets **A2UI Protocol v0.8** (Stable Release).

Standard Catalog ID: `https://github.com/google/A2UI/blob/main/specification/0.8/json/standard_catalog_definition.json`

## Core Concepts

### 1. Message Types

A2UI uses four message types in a JSONL stream:

| Message | Purpose |
|---------|---------|
| `surfaceUpdate` | Define or update UI components |
| `dataModelUpdate` | Populate or update application state |
| `beginRendering` | Signal client to start rendering |
| `deleteSurface` | Remove a UI surface |

### 2. Adjacency List Model

Components are defined as a **flat list** with ID references, not nested trees:

```json
{"surfaceUpdate": {"surfaceId": "main", "components": [
  {"id": "root", "component": {"Column": {"children": {"explicitList": ["header", "content"]}}}},
  {"id": "header", "component": {"Text": {"text": {"literalString": "Welcome"}, "usageHint": "h1"}}},
  {"id": "content", "component": {"Text": {"text": {"path": "/user/name"}}}}
]}}
```

### 3. Data Binding (BoundValue)

Three patterns for binding values:

```json
// Literal only - static value
{"literalString": "Hello"}

// Path only - dynamic from data model
{"path": "/user/name"}

// Both - initialization shorthand (sets default AND binds)
{"path": "/form/email", "literalString": "user@example.com"}
```

### 4. Styles Configuration

Customize appearance in `beginRendering`:

```json
{"beginRendering": {
  "surfaceId": "main",
  "root": "root",
  "styles": {
    "font": "Roboto",
    "primaryColor": "#1976D2"
  }
}}
```

| Property | Description |
|----------|-------------|
| `font` | Primary font family |
| `primaryColor` | Theme color (hex format `#RRGGBB`) |

## Standard Catalog Components

The A2UI 0.8 Standard Catalog includes 16 components across three categories:

**Layout Components:** Row, Column, List, Card, Tabs, Modal, Divider
**Display Components:** Text, Image, Icon, Video, AudioPlayer
**Input Components:** Button, TextField, CheckBox, DateTimeInput, MultipleChoice, Slider

**IMPORTANT:** For detailed component documentation (properties, types, examples), use the MCP tools:
- **list_components()** - List all available components
- **get_component(name)** - Get detailed documentation for a specific component (e.g., `get_component("Button")`)
- **search_components(keyword)** - Search for components by keyword

The component reference file at `reference/components.md` now redirects to MCP.

### Component Weight

Use `weight` on components inside Row/Column for flex layout:

```json
{"id": "sidebar", "weight": 1, "component": {"Column": {...}}},
{"id": "main", "weight": 3, "component": {"Column": {...}}}
```

## Generating A2UI Messages

### Basic Flow

1. **Define components** via `surfaceUpdate`
2. **Populate data** via `dataModelUpdate`
3. **Trigger render** via `beginRendering`

### Complete Example: Simple Form

```jsonl
{"surfaceUpdate": {"surfaceId": "booking", "components": [
  {"id": "root", "component": {"Column": {"children": {"explicitList": ["title", "name_field", "date_field", "submit_btn"]}}}},
  {"id": "title", "component": {"Text": {"text": {"literalString": "Book a Table"}, "usageHint": "h2"}}},
  {"id": "name_field", "component": {"TextField": {"label": {"literalString": "Your Name"}, "text": {"path": "/form/name"}}}},
  {"id": "date_field", "component": {"DateTimeInput": {"value": {"path": "/form/date"}, "enableDate": true}}},
  {"id": "submit_btn", "component": {"Button": {"child": "submit_text", "action": {"name": "submit_booking", "context": [{"key": "name", "value": {"path": "/form/name"}}, {"key": "date", "value": {"path": "/form/date"}}]}}}},
  {"id": "submit_text", "component": {"Text": {"text": {"literalString": "Confirm Booking"}}}}
]}}
{"dataModelUpdate": {"surfaceId": "booking", "contents": [{"key": "form", "valueMap": [{"key": "name", "valueString": ""}, {"key": "date", "valueString": ""}]}]}}
{"beginRendering": {"surfaceId": "booking", "root": "root"}}
```

## Event Handling

### User Actions

When a user interacts (e.g., clicks a button), the client sends `userAction`:

```json
{
  "userAction": {
    "name": "submit_booking",
    "surfaceId": "booking",
    "sourceComponentId": "submit_btn",
    "timestamp": "2025-01-01T10:00:00Z",
    "context": {"name": "John Doe", "date": "2025-01-15"}
  }
}
```

### Error Reporting

Clients report errors via `error` message:

```json
{
  "error": {
    "type": "RENDER_ERROR",
    "message": "Component 'user_card' references missing child",
    "surfaceId": "main",
    "componentId": "user_card",
    "timestamp": "2025-01-01T10:30:05Z"
  }
}
```

## Best Practices

1. **Unique IDs**: Every component needs a unique `id` within its surface
2. **Flat Structure**: Use ID references for parent-child relationships
3. **Data Separation**: Keep UI structure in `surfaceUpdate`, dynamic values in `dataModelUpdate`
4. **Path Convention**: Use JSON Pointer format for paths (e.g., `/user/profile/name`)
5. **Progressive Rendering**: Send `beginRendering` after essential components are defined
6. **Clean up surfaces**: Use `deleteSurface` when flows complete

## Reference Documentation

### Core References
- [Component Reference](reference/components.md) - All 16 components with properties
- [Data Binding Guide](reference/data-binding.md) - BoundValue patterns and templates
- [API Integration](reference/api-integration.md) - Event handling and backend connection
- [Schema Reference](reference/schema.md) - JSON Schema for validation

### Advanced Topics
- [Catalog Negotiation](reference/catalog-negotiation.md) - Multi-catalog support
- [Surface Management](reference/surfaces.md) - Multiple UI regions
- [Streaming & Performance](reference/streaming.md) - Progressive rendering
- [Agent Prompting](reference/agent-prompting.md) - LLM integration

## Examples

### Basic Patterns
- [Form Example](examples/form.md) - Registration and booking forms
- [List Example](examples/list.md) - Dynamic lists with templates
- [Modal Example](examples/modal.md) - Dialog and popup patterns

### Advanced Patterns
- [Booking Flow](examples/booking-flow.md) - End-to-end business flow
- [Multi-Surface](examples/multi-surface.md) - Multiple UI regions
- [Streaming](examples/streaming.md) - Progressive rendering
