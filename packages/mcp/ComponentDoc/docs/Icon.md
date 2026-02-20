# Icon Component

Displays icons from the lucide-react icon library.

## Component Type

`Icon`

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `name` | BoundValue<string> | Yes | Icon name from available icons |
| `size` | BoundValue<number> | No | Icon size in pixels (default: 20) |
| `className` | BoundValue<string> | No | Additional CSS classes |
| `color` | BoundValue<string> | No | Icon color (default: 'currentColor') |

## Available Icons

### Navigation and Actions
`search`, `globe`, `menu`, `x`, `home`, `settings`, `moreHorizontal`, `moreVertical`

### Arrows
`arrowLeft`, `arrowRight`, `arrowUp`, `arrowDown`, `chevronLeft`, `chevronRight`, `chevronUp`, `chevronDown`

### User and Account
`user`, `users`, `userPlus`, `userMinus`, `userCheck`

### Files and Documents
`file`, `fileText`, `folder`, `folderOpen`, `download`, `upload`

### Editing and Actions
`edit`, `edit2`, `edit3`, `trash`, `trash2`, `copy`, `check`, `checkCircle`, `plus`, `minus`

### Notifications and Status
`bell`, `bellOff`, `alertCircle`, `alertTriangle`, `info`, `helpCircle`

### Social and Communication
`mail`, `messageCircle`, `messageSquare`, `phone`, `share`, `share2`

### Media
`image`, `video`, `music`, `camera`, `play`, `pause`, `skipBack`, `skipForward`

### Tools
`calendar`, `clock`, `bookmark`, `link`, `link2`, `externalLink`, `paperclip`

### Interface Elements
`heart`, `star`, `eye`, `eyeOff`, `lock`, `unlock`, `filter`, `sliders`

### Business and Shopping
`shoppingCart`, `shoppingBag`, `creditCard`, `dollarSign`

### Technical
`code`, `terminal`, `database`, `server`, `gitBranch`, `github`

### Other
`sun`, `moon`, `zap`, `wifi`, `wifiOff`, `battery`, `loader`, `loader2`

## Example Usage

### Basic Icon

```json
{"id": "search-icon", "component": {"Icon": {
  "name": {"literalString": "search"},
  "size": {"literalNumber": 24}
}}}
```

### Data Binding

```json
[
  {"surfaceUpdate": {"surfaceId": "ui", "components": [
    {"id": "status-icon", "component": {"Icon": {
      "name": {"path": "/ui/iconName"},
      "color": {"path": "/ui/iconColor"},
      "size": {"literalNumber": 20}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "ui", "contents": [
    {"key": "ui", "valueMap": [
      {"key": "iconName", "valueString": "checkCircle"},
      {"key": "iconColor", "valueString": "#22c55e"}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "ui", "root": "status-icon"}}
]
```

### Custom Styling

```json
{"id": "styled-icon", "component": {"Icon": {
  "name": {"literalString": "heart"},
  "size": {"literalNumber": 32},
  "color": {"literalString": "#ef4444"},
  "className": {"literalString": "hover:scale-110 transition-transform"}
}}}
```

## Notes

- Icons are from lucide-react library (60+ available)
- Fallback to `search` icon if requested icon not found
- Color defaults to `currentColor` (inherits from parent)
- SSR-safe implementation
- All icons include `aria-hidden="true"` for accessibility
- Warning logged to console if icon not found
