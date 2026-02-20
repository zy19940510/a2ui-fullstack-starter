# @a2ui-web/config-postcss

Shared PostCSS configuration for a2ui-web projects.

## Usage

### Option 1: Direct import (recommended)

```js
// postcss.config.mjs
export { default } from '@a2ui-web/config-postcss'
```

### Option 2: Extend and customize

```js
// postcss.config.mjs
import baseConfig from '@a2ui-web/config-postcss'

/** @type {import('postcss-load-config').Config} */
const config = {
  ...baseConfig,
  plugins: {
    ...baseConfig.plugins,
    'autoprefixer': {},  // Add custom plugins
  },
}

export default config
```

## Included Plugins

- `@tailwindcss/postcss` - Tailwind CSS 4.x PostCSS plugin

## Requirements

Make sure you have these peer dependencies installed:

```json
{
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.0.0"
  }
}
```
