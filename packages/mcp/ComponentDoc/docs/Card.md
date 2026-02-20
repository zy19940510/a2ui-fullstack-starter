# Card Component

Material design card container component based on shadcn/ui with A2UI protocol support.

## Component Type

`Card`

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `child` | string | No | ID of single child component |
| `children` | Children | No | Multiple child components (explicitList or template) |
| `className` | BoundValue<string> | No | Additional CSS classes |

## Example Usage

### Basic Card with Single Child

```json
[
  {"surfaceUpdate": {"surfaceId": "ui", "components": [
    {"id": "user-card", "component": {"Card": {
      "child": "card-content"
    }}},
    {"id": "card-content", "component": {"Column": {
      "children": {"explicitList": ["title", "description"]}
    }}},
    {"id": "title", "component": {"Typography": {
      "text": {"literalString": "Welcome"},
      "variant": {"literalString": "h3"}
    }}},
    {"id": "description", "component": {"Typography": {
      "text": {"literalString": "This is a card component"}
    }}}
  ]}},
  {"beginRendering": {"surfaceId": "ui", "root": "user-card"}}
]
```

### Card with Multiple Children

```json
{"id": "info-card", "component": {"Card": {
  "children": {"explicitList": ["header", "body", "footer"]}
}}}
```

### Product Card Example

```json
[
  {"surfaceUpdate": {"surfaceId": "shop", "components": [
    {"id": "product-card", "component": {"Card": {
      "child": "product-content"
    }}},
    {"id": "product-content", "component": {"Column": {
      "children": {"explicitList": ["product-image", "product-info", "price-row", "buy-button"]}
    }}},
    {"id": "product-image", "component": {"Image": {
      "url": {"path": "/product/imageUrl"},
      "fit": "cover"
    }}},
    {"id": "product-info", "component": {"Column": {
      "children": {"explicitList": ["product-name", "product-desc"]}
    }}},
    {"id": "product-name", "component": {"Typography": {
      "text": {"path": "/product/name"},
      "variant": {"literalString": "h4"}
    }}},
    {"id": "product-desc", "component": {"Typography": {
      "text": {"path": "/product/description"},
      "variant": {"literalString": "body"}
    }}},
    {"id": "price-row", "component": {"Row": {
      "distribution": "spaceBetween",
      "children": {"explicitList": ["price-label", "price-value"]}
    }}},
    {"id": "price-label", "component": {"Typography": {
      "text": {"literalString": "Price:"}
    }}},
    {"id": "price-value", "component": {"Typography": {
      "text": {"path": "/product/price"},
      "variant": {"literalString": "h5"}
    }}},
    {"id": "buy-button", "component": {"Button": {
      "child": "buy-text",
      "variant": {"literalString": "default"},
      "action": {
        "name": "add-to-cart",
        "context": [{"key": "productId", "value": {"path": "/product/id"}}]
      }
    }}},
    {"id": "buy-text", "component": {"Typography": {
      "text": {"literalString": "Add to Cart"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "shop", "contents": [
    {"key": "product", "valueMap": [
      {"key": "id", "valueString": "prod-123"},
      {"key": "name", "valueString": "Wireless Headphones"},
      {"key": "description", "valueString": "Premium noise-canceling headphones"},
      {"key": "price", "valueString": "$299.99"},
      {"key": "imageUrl", "valueString": "https://example.com/headphones.jpg"}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "shop", "root": "product-card"}}
]
```

### Card Grid Layout

```json
[
  {"surfaceUpdate": {"surfaceId": "dashboard", "components": [
    {"id": "root", "component": {"Row": {
      "children": {"explicitList": ["card1", "card2", "card3"]}
    }}},
    {"id": "card1", "weight": 1, "component": {"Card": {
      "child": "card1-content"
    }}},
    {"id": "card2", "weight": 1, "component": {"Card": {
      "child": "card2-content"
    }}},
    {"id": "card3", "weight": 1, "component": {"Card": {
      "child": "card3-content"
    }}},
    {"id": "card1-content", "component": {"Column": {
      "children": {"explicitList": ["stat1-label", "stat1-value"]}
    }}},
    {"id": "stat1-label", "component": {"Typography": {
      "text": {"literalString": "Total Users"},
      "variant": {"literalString": "caption"}
    }}},
    {"id": "stat1-value", "component": {"Typography": {
      "text": {"literalString": "1,234"},
      "variant": {"literalString": "h2"}
    }}},
    {"id": "card2-content", "component": {"Column": {
      "children": {"explicitList": ["stat2-label", "stat2-value"]}
    }}},
    {"id": "stat2-label", "component": {"Typography": {
      "text": {"literalString": "Revenue"},
      "variant": {"literalString": "caption"}
    }}},
    {"id": "stat2-value", "component": {"Typography": {
      "text": {"literalString": "$45.6K"},
      "variant": {"literalString": "h2"}
    }}},
    {"id": "card3-content", "component": {"Column": {
      "children": {"explicitList": ["stat3-label", "stat3-value"]}
    }}},
    {"id": "stat3-label", "component": {"Typography": {
      "text": {"literalString": "Growth"},
      "variant": {"literalString": "caption"}
    }}},
    {"id": "stat3-value", "component": {"Typography": {
      "text": {"literalString": "+12.5%"},
      "variant": {"literalString": "h2"}
    }}}
  ]}},
  {"beginRendering": {"surfaceId": "dashboard", "root": "root"}}
]
```

### Card with Dynamic List

```json
[
  {"surfaceUpdate": {"surfaceId": "ui", "components": [
    {"id": "comments-card", "component": {"Card": {
      "child": "comments-list"
    }}},
    {"id": "comments-list", "component": {"Column": {
      "children": {"template": {
        "dataBinding": "/comments",
        "componentId": "comment-item"
      }}
    }}},
    {"id": "comment-item", "component": {"Column": {
      "children": {"explicitList": ["comment-author", "comment-text"]}
    }}},
    {"id": "comment-author", "component": {"Typography": {
      "text": {"path": "/author"},
      "variant": {"literalString": "caption"}
    }}},
    {"id": "comment-text", "component": {"Typography": {
      "text": {"path": "/text"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "ui", "contents": [
    {"key": "comments", "valueArray": [
      {"valueMap": [
        {"key": "author", "valueString": "John Doe"},
        {"key": "text", "valueString": "Great product!"}
      ]},
      {"valueMap": [
        {"key": "author", "valueString": "Jane Smith"},
        {"key": "text", "valueString": "Highly recommended"}
      ]}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "ui", "root": "comments-card"}}
]
```

## Notes

- Based on shadcn/ui Card component
- Provides elevation and visual grouping for content
- Default padding of 24px (p-6 in Tailwind)
- Rounded corners with shadow for depth
- Can contain any child components (Column, Row, Typography, etc.)
- Supports `weight` property for flex layouts
- Can be nested within other layout components
- Works well in grid or flex layouts

## Common Use Cases

- Product listings
- User profiles
- Statistics dashboards
- Content previews
- Feature highlights
- Form sections
- Comment threads
- Notification panels

## Styling

The component uses:
- shadcn/ui default Card styling (white background, border, shadow)
- Tailwind CSS utility classes
- Theme customization via `className` prop
- Responsive padding and border radius
- Hover states can be added via `className`
