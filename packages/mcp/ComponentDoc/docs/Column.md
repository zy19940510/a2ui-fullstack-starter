# Column Component

Vertical layout component for organizing child components in a column.

## Component Type

`Column`

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | Children | Yes | Child components (explicitList or template) |
| `distribution` | BoundValue<string> | No | Main axis arrangement (default: 'start') |
| `alignment` | BoundValue<string> | No | Cross axis alignment (default: 'stretch') |
| `gap` | BoundValue<number> | No | Gap between items in pixels (default: 0) |
| `wrap` | BoundValue<boolean> | No | Enable flex-wrap for multi-line layouts (default: false) |
| `padding` | BoundValue<number> | No | Container padding in pixels (default: 0) |
| `width` | BoundValue<string> | No | Container width (CSS value, e.g., '100%', '300px') |
| `height` | BoundValue<string> | No | Container height (CSS value) |
| `maxWidth` | BoundValue<string> | No | Maximum width (CSS value) |
| `maxHeight` | BoundValue<string> | No | Maximum height (CSS value) |

## Distribution Values

Controls how items are distributed along the main axis (vertical):

- `start` - Items at the top (default)
- `end` - Items at the bottom
- `center` - Items centered vertically
- `space-between` / `spaceBetween` - Even spacing with no space at edges
- `space-around` / `spaceAround` - Even spacing with half space at edges
- `space-evenly` / `spaceEvenly` - Even spacing including edges

## Alignment Values

Controls how items align on the cross axis (horizontal):

- `start` - Items align to the left
- `end` - Items align to the right
- `center` - Items centered horizontally
- `stretch` - Items stretch to fill width (default)

## Gap Values

Common gap values (in pixels):
- `0` - No gap
- `4` - Minimal spacing
- `8` - Small spacing
- `12` - Medium-small spacing
- `16` - Medium spacing
- `20` - Medium-large spacing
- `24` - Large spacing
- `32` - Extra large spacing

## Example Usage

### Basic Column

```json
{"id": "main-column", "component": {"Column": {
  "children": {"explicitList": ["header", "content", "footer"]},
  "gap": {"literalNumber": 16},
  "padding": {"literalNumber": 20}
}}}
```

### Centered Column with Max Width

```json
{"id": "centered-column", "component": {"Column": {
  "children": {"explicitList": ["title", "body"]},
  "distribution": {"literalString": "center"},
  "alignment": {"literalString": "center"},
  "gap": {"literalNumber": 12},
  "maxWidth": {"literalString": "600px"}
}}}
```

### Dynamic Children from Data

```json
[
  {"surfaceUpdate": {"surfaceId": "list", "components": [
    {"id": "item-list", "component": {"Column": {
      "children": {"template": {
        "dataBinding": "/items",
        "componentId": "item-template"
      }},
      "gap": {"literalNumber": 8}
    }}},
    {"id": "item-template", "component": {"Typography": {
      "text": {"path": "/name"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "list", "contents": [
    {"key": "items", "valueArray": [
      {"valueMap": [{"key": "name", "valueString": "Item 1"}]},
      {"valueMap": [{"key": "name", "valueString": "Item 2"}]},
      {"valueMap": [{"key": "name", "valueString": "Item 3"}]}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "list", "root": "item-list"}}
]
```

### Responsive Column with Wrap

```json
{"id": "responsive-col", "component": {"Column": {
  "children": {"explicitList": ["card1", "card2", "card3"]},
  "wrap": {"literalBoolean": true},
  "gap": {"literalNumber": 16},
  "padding": {"literalNumber": 24},
  "width": {"literalString": "100%"}
}}}
```

## Notes

- Uses flexbox (flex-direction: column)
- All styles use `auicom:` prefix for isolation
- Gap values are mapped to Tailwind spacing scale (1 unit = 4px)
- Custom gap values (non-standard) use arbitrary values: `gap-[Npx]`
- Width/height/maxWidth/maxHeight support any CSS value
- Children are automatically rendered by ComponentRenderer
- Supports `weight` property for nested flex layouts
