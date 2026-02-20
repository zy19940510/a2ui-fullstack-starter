# Typography Component

Displays text content with various typography styles and semantic variants.

## Component Type

`Typography`

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `text` | BoundValue<string> | Yes | Text content to display |
| `variant` | BoundValue<string> | No | Typography variant (default: 'body-m') |
| `color` | BoundValue<string> | No | Text color variant (default: 'default') |
| `as` | BoundValue<string> | No | HTML element tag (default: 'p') |
| `className` | BoundValue<string> | No | Additional CSS classes |
| `align` | BoundValue<'left' \| 'center' \| 'right' \| 'justify'> | No | Text alignment (default: 'left') |

## Typography Variants

### Display Variants
- `display-xl` - Extra large display text (72px, bold)
- `display-l` - Large display text (60px, bold)
- `display-m` - Medium display text (48px, bold)
- `display-s` - Small display text (40px, bold)

### Heading Variants
- `heading-xl` - Extra large heading (48px, bold)
- `heading-l` - Large heading (40px, bold)
- `heading-m` - Medium heading (32px, bold)
- `heading-s` - Small heading (28px, bold)
- `heading-xs` - Extra small heading (24px, bold)

### Body Variants
- `body-l` - Large body text (18px, light)
- `body-m` - Medium body text (16px, normal) - **Default**
- `body-s` - Small body text (14px, normal)

### Other Variants
- `caption` - Caption text (12px, normal)
- `overline` - Overline text (12px, medium, uppercase)
- `inherit` - Inherit parent styles (for Button内嵌文字)

### Web-Old Theme Variants
- `web-old-hero` - Hero title (24px, semibold)
- `web-old-h1` - Primary heading (18px, semibold)
- `web-old-h2` - Secondary heading (16px, semibold)
- `web-old-title` - Content title (14px, medium)
- `web-old-body` - Body text (14px, normal)
- `web-old-subtitle` - Subtitle (12px, medium)
- `web-old-caption` - Caption (12px, normal)

## Color Variants

### Standard Colors
- `inherit` - Inherit parent color
- `default` - Default text color
- `primary` - Primary color
- `secondary` - Secondary color
- `muted` - Muted foreground
- `mutedForeground` - Muted foreground (alias)
- `accent` - Accent foreground
- `destructive` - Destructive/error color
- `success` - Success color (green)
- `warning` - Warning color (yellow)
- `info` - Info color (blue)
- `inverse` - Inverse color (for dark backgrounds)

### Web-Old Theme Colors
- `web-old-primary` - Primary text (#1c1c28)
- `web-old-secondary` - Secondary text (#5d6267)
- `web-old-tertiary` - Tertiary text (#82888d)

## Example Usage

### Basic Text

```json
{"id": "title", "component": {"Typography": {
  "text": {"literalString": "Hello World"},
  "variant": {"literalString": "heading-l"},
  "color": {"literalString": "primary"}
}}}
```

### Data Binding

```json
[
  {"surfaceUpdate": {"surfaceId": "main", "components": [
    {"id": "dynamic-text", "component": {"Typography": {
      "text": {"path": "/user/name"},
      "variant": {"literalString": "body-l"}
    }}}
  ]}},
  {"dataModelUpdate": {"surfaceId": "main", "contents": [
    {"key": "user", "valueMap": [
      {"key": "name", "valueString": "张三"}
    ]}
  ]}},
  {"beginRendering": {"surfaceId": "main", "root": "dynamic-text"}}
]
```

### Custom Alignment

```json
{"id": "centered", "component": {"Typography": {
  "text": {"literalString": "Centered Text"},
  "variant": {"literalString": "heading-m"},
  "align": {"literalString": "center"}
}}}
```

### Custom HTML Tag

```json
{"id": "heading", "component": {"Typography": {
  "text": {"literalString": "Main Title"},
  "variant": {"literalString": "heading-xl"},
  "as": {"literalString": "h1"}
}}}
```

## Notes

- Font stack: PingFang SC → PingFang TC → SF Pro Display → system-ui
- All variants use `auicom:` prefix for style isolation
- Supports responsive design with Tailwind classes
- Empty text displays as "(empty)"
- Supports `weight` property for flex layouts
