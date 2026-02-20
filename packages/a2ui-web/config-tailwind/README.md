# @a2ui-web/config-tailwind

Tailwind CSS configuration for **legacy projects** using the **云溪专用** Figma design system.

**📚 [Complete Design Token Documentation](./DESIGN_TOKENS.md)**

**🎨 Figma Source**: [云溪专用 Design System - Node 23:18636](https://www.figma.com/design/NnrCx3x3PVukxpFxxObdXg/%E4%BA%91%E6%BA%AA%E4%B8%93%E7%94%A8?node-id=23-18636)

## Purpose

This package contains the Figma design system tokens from the legacy "云溪专用" project. It's intended for:

- Legacy projects that use the old Figma design system
- Projects that need to maintain visual consistency with the old product line
- Migration scenarios where you need both old and new design systems

**For new projects**, use `@a2ui-web/config-tailwind` instead, which contains the modern design system.

## Installation

```bash
npm install @a2ui-web/config-tailwind
# or
bun install @a2ui-web/config-tailwind
```

## Usage

### Tailwind Config

```javascript
// tailwind.config.js
import tailwindConfig from '@a2ui-web/config-tailwind'

export default {
  ...tailwindConfig,
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
}
```

### Import CSS

```css
/* globals.css */
@import '@a2ui-web/config-tailwind';
```

## Design Tokens

### Brand Colors

```tsx
<button className="bg-brand-1 text-white">Primary</button>  // #37A0FF
<button className="bg-brand-2 text-white">Secondary</button> // #FF4040
<button className="bg-brand-3 text-white">Tertiary</button>  // #FFC700
```

### Text Hierarchy

```tsx
<h1 className="text-text-primary text-base">Heading</h1>     // #000000
<p className="text-text-secondary text-sm">Body</p>          // #82888D
<span className="text-text-tertiary text-xs">Caption</span>  // #AFB3B6
```

### Backgrounds

```tsx
<div className="bg-page">Page</div>   // #F5F5F6
<div className="bg-card">Card</div>   // #FFFFFF
<div className="bg-tag">Tag</div>     // #F5F6F6
```

### Market Colors (Financial Data)

```tsx
<span className="text-market-up">+5.23%</span>    // #FF5000 (涨)
<span className="text-market-down">-3.18%</span>  // #00B99A (跌)
<span className="text-market-hk">HK</span>        // #FC6EBC (港股)
```

### Typography Scale

- `text-xs` - 12px / 18px / Regular (400)
- `text-xs-medium` - 12px / 18px / Medium (500)
- `text-sm` - 14px / 20px / Regular (400)
- `text-sm-medium` - 14px / 20px / Medium (500)
- `text-base` - 16px / 24px / Medium (500)

**Font Families**:
- `font-sans` - PingFang SC (primary for Chinese)
- `font-display` - SF Pro Display (primary for English)

## Complete Token Reference

See **[DESIGN_TOKENS.md](./DESIGN_TOKENS.md)** for:
- All color tokens with Figma mapping
- Typography specifications
- Shadow and border radius values
- CSS variable reference
- Usage examples

## Comparison with New Design System

| Aspect | config-tailwind (Legacy) | config-tailwind (New) |
|--------|------------------------------|------------------------|
| **Purpose** | Legacy 云溪专用 projects | Modern projects |
| **Colors** | Figma tokens (brand-1/2/3, market-up/down) | Generic tokens (canvas, ink, panel) |
| **Fonts** | PingFang SC + SF Pro Display | Space Grotesk + Fraunces |
| **Use Case** | Old product line | New product line |

## Migration to New Design System

If you want to migrate from this legacy design system to the new one:

1. Install the new package:
   ```bash
   npm install @a2ui-web/config-tailwind
   npm uninstall @a2ui-web/config-tailwind
   ```

2. Update imports:
   ```diff
   - import tailwindConfig from '@a2ui-web/config-tailwind'
   + import tailwindConfig from '@a2ui-web/config-tailwind'
   ```

3. Update class names:
   - `text-text-primary` → `text-ink`
   - `bg-page` → `bg-canvas`
   - `bg-card` → `bg-panel`
   - Review the new design system documentation for complete mapping

## Version

**Current**: v0.8.0
