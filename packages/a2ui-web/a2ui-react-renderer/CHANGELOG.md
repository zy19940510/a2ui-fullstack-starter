# Changelog

## [0.8.3] - 2026-01-14

### Fixed
- 修复 Layout 组件的 `gap` 和 `padding` 属性不生效的问题
  - 将动态生成的任意值类名（`gap-[12px]`）改为预定义的 Tailwind 类名
  - 新增 `getGapClass()` 和 `getPaddingClass()` 映射函数
  - 支持常用间距值：4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px
  - 未匹配的值会降级到任意值语法（作为 fallback）
  - 更新 CSS 文件大小：16KB → 16.8KB，包含完整的 gap 和 padding 样式类

## [0.8.2] - 2026-01-14

### Fixed
- 修复 shadcn-ui 组件样式未被打包的问题，更正 `src/styles.css` 中的 `@source` 路径
  - 将 `@source "../shadcn-ui/src/**/*.{ts,tsx}"` 改为 `@source "../../shadcn-ui/src/**/*.{ts,tsx}"`
  - 现在 CSS 构建正确扫描并打包所有 shadcn-ui 组件样式（如 button、card、input 等）
  - CSS 文件大小从 ~9.5KB 增加到 ~16KB，包含完整的组件样式类

## [0.8.1] - 2026-01-14

### Added
- 初始发布，包含 A2UI 0.8 React 渲染器核心功能
- 集成 shadcn-ui 组件库
- 支持事件驱动的 UI 更新
- SSR 支持
