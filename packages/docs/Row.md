# Row Component

Horizontal layout component for organizing child components in a row.

## Component Type

`Row`

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | Children | Yes | Child components (explicitList or template) |
| `distribution` | BoundValue<string> | No | Main axis arrangement (default: 'start') |
| `alignment` | BoundValue<string> | No | Cross axis alignment (default: 'center') |
| `gap` | BoundValue<number> | No | Gap between items in pixels (default: 0) |
| `wrap` | BoundValue<boolean> | No | Enable flex-wrap for multi-line layouts (default: false) |
| `padding` | BoundValue<number> | No | Container padding in pixels (default: 0) |
| `width` | BoundValue<string> | No | Container width (CSS value, e.g., '100%', '300px') |
| `height` | BoundValue<string> | No | Container height (CSS value) |
| `maxWidth` | BoundValue<string> | No | Maximum width (CSS value) |
| `maxHeight` | BoundValue<string> | No | Maximum height (CSS value) |

## Distribution Values

Controls how items are distributed along the main axis (horizontal):

- `start` - Items at the left (default)
- `end` - Items at the right
- `center` - Items centered horizontally
- `space-between` / `spaceBetween` - Even spacing with no space at edges
- `space-around` / `spaceAround` - Even spacing with half space at edges
- `space-evenly` / `spaceEvenly` - Even spacing including edges

## Alignment Values

Controls how items align on the cross axis (vertical):

- `start` - Items align to the top
- `end` - Items align to the bottom
- `center` - Items centered vertically (default)
- `stretch` - Items stretch to fill height

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

### Basic Row

```json
{"id": "header-row", "component": {"Row": {
  "children": {"explicitList": ["logo", "nav", "user-menu"]},
  "distribution": {"literalString": "space-between"},
  "alignment": {"literalString": "center"},
  "gap": {"literalNumber": 16},
  "padding": {"literalNumber": 20}
}}}
```

### Icon + Text Row

```json
[
  {"surfaceUpdate": {"surfaceId": "info", "components": [
    {"id": "info-row", "component": {"Row": {
      "children": {"explicitList": ["icon", "text"]},
      "gap": {"literalNumber": 8},
      "alignment": {"literalString": "center"}
    }}},
    {"id": "icon", "component": {"Icon": {
      "name": {"literalString": "info"},
      "size": {"literalNumber": 20}
    }}},
    {"id": "text", "component": {"Typography": {
      "text": {"literalString": "Information message"}
    }}}
  ]}},
  {"beginRendering": {"surfaceId": "info", "root": "info-row"}}
]
```

### Button Group

```json
{"id": "button-group", "component": {"Row": {
  "children": {"explicitList": ["cancel-btn", "confirm-btn"]},
  "distribution": {"literalString": "end"},
  "gap": {"literalNumber": 12}
}}}
```

### Responsive Row with Wrap

```json
{"id": "card-row", "component": {"Row": {
  "children": {"explicitList": ["card1", "card2", "card3", "card4"]},
  "wrap": {"literalBoolean": true},
  "gap": {"literalNumber": 16},
  "padding": {"literalNumber": 24},
  "width": {"literalString": "100%"}
}}}
```

### Fixed Width Row

```json
{"id": "toolbar", "component": {"Row": {
  "children": {"explicitList": ["tool1", "tool2", "tool3"]},
  "gap": {"literalNumber": 8},
  "width": {"literalString": "400px"},
  "height": {"literalString": "48px"},
  "alignment": {"literalString": "center"},
  "padding": {"literalNumber": 12}
}}}
```

## Notes

- Uses flexbox (flex-direction: row)
- All styles use `auicom:` prefix for isolation
- Gap values are mapped to Tailwind spacing scale (1 unit = 4px)
- Custom gap values (non-standard) use arbitrary values: `gap-[Npx]`
- Width/height/maxWidth/maxHeight support any CSS value
- Children are automatically rendered by ComponentRenderer
- Supports `weight` property for nested flex layouts
- Default alignment is `center` (different from Column which defaults to `stretch`)
