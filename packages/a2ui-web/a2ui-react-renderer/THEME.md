# A2UI React Renderer 主题配置指南

## 概述

`@a2ui-web/a2ui-react-renderer` 使用 **CSS 变量主题系统**，允许主项目完全控制组件的外观。组件库本身不提供默认颜色值，而是依赖主项目在 `:root` 中定义这些 CSS 变量。

## 设计理念

- 🎨 **主题由宿主项目控制**：组件库只定义结构和行为，样式完全由主项目决定
- 🔄 **灵活的设计系统集成**：可以与任何设计系统（Material UI、Ant Design、自定义设计）集成
- 📦 **最小化样式冲突**：使用 `auicom:` 前缀隔离 Tailwind 类名

## 必需的 CSS 变量

主项目必须在全局样式中定义以下 CSS 变量（OKLCH 格式）：

### 基础颜色

```css
:root {
  /* 背景色和前景色 */
  --background: 100% 0 0;           /* 纯白背景 */
  --foreground: 20% 0 0;            /* 深色文字 */

  /* 卡片 */
  --card: 100% 0 0;                 /* 卡片背景 */
  --card-foreground: 20% 0 0;       /* 卡片文字 */

  /* 弹出层 */
  --popover: 100% 0 0;              /* 弹出层背景 */
  --popover-foreground: 20% 0 0;    /* 弹出层文字 */

  /* 主色调（品牌色） */
  --primary: 55% 0.25 262;          /* 蓝色 */
  --primary-foreground: 100% 0 0;   /* 白色文字 */

  /* 次要色调 */
  --secondary: 97% 0 0;             /* 浅灰背景 */
  --secondary-foreground: 20% 0 0;  /* 深色文字 */

  /* 柔和色调 */
  --muted: 97% 0 0;                 /* 柔和背景 */
  --muted-foreground: 45% 0 0;      /* 柔和文字 */

  /* 强调色 */
  --accent: 97% 0 0;                /* 强调背景 */
  --accent-foreground: 20% 0 0;     /* 强调文字 */

  /* 危险/错误色 */
  --destructive: 58% 0.24 29;       /* 红色 */
  --destructive-foreground: 100% 0 0; /* 白色文字 */

  /* 边框和输入框 */
  --border: 93% 0 0;                /* 边框颜色 */
  --input: 93% 0 0;                 /* 输入框边框 */
  --ring: 55% 0.25 262;             /* 焦点环颜色（通常与 primary 相同） */
}
```

### 暗黑模式

```css
.dark {
  --background: 20% 0 0;            /* 深色背景 */
  --foreground: 95% 0 0;            /* 浅色文字 */

  --card: 20% 0 0;
  --card-foreground: 95% 0 0;

  --popover: 20% 0 0;
  --popover-foreground: 95% 0 0;

  --primary: 55% 0.25 262;
  --primary-foreground: 100% 0 0;

  --secondary: 27% 0 0;
  --secondary-foreground: 95% 0 0;

  --muted: 27% 0 0;
  --muted-foreground: 65% 0 0;

  --accent: 27% 0 0;
  --accent-foreground: 95% 0 0;

  --destructive: 58% 0.24 29;
  --destructive-foreground: 100% 0 0;

  --border: 27% 0 0;
  --input: 27% 0 0;
  --ring: 55% 0.25 262;
}
```

## OKLCH 颜色格式说明

OKLCH 是现代 CSS 颜色格式，格式为 `L% C H`：

- **L (Lightness)**：亮度，0-100%
- **C (Chroma)**：色度，0-0.4（0 为灰色，值越大颜色越鲜艳）
- **H (Hue)**：色相，0-360 度（0/360=红，120=绿，240=蓝）

**示例**：
- `100% 0 0` = 纯白（亮度 100%，无色度）
- `0% 0 0` = 纯黑（亮度 0%）
- `55% 0.25 262` = 蓝色（亮度 55%，色度 0.25，色相 262°）

## 与 shadcn/ui 兼容

如果你的项目已经使用了 shadcn/ui，这些 CSS 变量定义完全兼容！shadcn/ui 使用相同的主题变量系统。

## 集成步骤

### 1. 在全局 CSS 中定义变量

```css
/* globals.css 或 app.css */
@import "@a2ui-web/a2ui-react-renderer/styles.css";

:root {
  /* 定义你的主题变量 */
  --background: 100% 0 0;
  --foreground: 20% 0 0;
  --primary: 55% 0.25 262;
  /* ... 其他变量 */
}

.dark {
  /* 暗黑模式覆盖 */
  --background: 20% 0 0;
  --foreground: 95% 0 0;
  /* ... */
}
```

### 2. （可选）使用主题生成器

你可以使用 shadcn/ui 的主题编辑器生成颜色：

👉 https://ui.shadcn.com/themes

复制生成的 CSS 变量到你的项目中。

### 3. TypeScript 类型支持（可选）

创建类型定义文件以获得 IntelliSense 支持：

```typescript
// theme.d.ts
declare module 'csstype' {
  interface Properties {
    '--background'?: string
    '--foreground'?: string
    '--primary'?: string
    '--primary-foreground'?: string
    // ... 其他变量
  }
}
```

## 组件如何使用这些变量

在 `@a2ui-web/a2ui-react-renderer` 内部，这些变量通过 Tailwind CSS v4 的 `@theme` 映射到工具类：

```css
/* a2ui-react-renderer/src/styles.css */
@theme {
  --color-primary: oklch(var(--primary));
  --color-primary-foreground: oklch(var(--primary-foreground));
}
```

然后在组件中使用：

```tsx
// Button 组件使用
<Button className="auicom:bg-primary auicom:text-primary-foreground">
  Click me
</Button>
```

最终渲染为：

```css
.auicom\:bg-primary {
  background-color: var(--auicom-color-primary); /* = oklch(var(--primary)) */
}
```

## 自定义扩展

### 添加自定义颜色

如果你需要额外的颜色（如 `--brand-color`），有两种方式：

#### 方式 1：直接使用内联样式

```tsx
<Button style={{ backgroundColor: 'var(--brand-color)' }}>
  Brand Button
</Button>
```

#### 方式 2：Fork 并扩展主题（不推荐）

修改 `a2ui-react-renderer/src/styles.css`：

```css
@theme {
  /* 添加自定义颜色 */
  --color-brand: oklch(var(--brand-color));
}
```

然后重新构建包。

**注意**：这会破坏包的通用性，建议优先使用方式 1。

## 完整示例

### Next.js 12 + Tailwind v3 项目

```css
/* styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 导入 A2UI React Renderer 样式 */
@import "@a2ui-web/a2ui-react-renderer/styles.css";

/* 定义主题变量 */
:root {
  --background: 100% 0 0;
  --foreground: 20.36% 0.01 286.75;
  --card: 100% 0 0;
  --card-foreground: 20.36% 0.01 286.75;
  --popover: 100% 0 0;
  --popover-foreground: 20.36% 0.01 286.75;
  --primary: 54.74% 0.25 262.88;
  --primary-foreground: 98.04% 0 0;
  --secondary: 96.93% 0 0;
  --secondary-foreground: 15.89% 0 0;
  --muted: 96.93% 0 0;
  --muted-foreground: 45.45% 0.01 286.38;
  --accent: 96.93% 0 0;
  --accent-foreground: 15.89% 0 0;
  --destructive: 57.65% 0.24 29.23;
  --destructive-foreground: 98.04% 0 0;
  --border: 92.86% 0 0;
  --input: 92.86% 0 0;
  --ring: 54.74% 0.25 262.88;
}

.dark {
  --background: 20% 0.01 286.38;
  --foreground: 95.24% 0 0;
  --card: 20% 0.01 286.38;
  --card-foreground: 95.24% 0 0;
  --popover: 20% 0.01 286.38;
  --popover-foreground: 95.24% 0 0;
  --primary: 54.74% 0.25 262.88;
  --primary-foreground: 98.04% 0 0;
  --secondary: 26.79% 0.01 286.38;
  --secondary-foreground: 95.24% 0 0;
  --muted: 26.79% 0.01 286.38;
  --muted-foreground: 64.76% 0.01 286.38;
  --accent: 26.79% 0.01 286.38;
  --accent-foreground: 95.24% 0 0;
  --destructive: 57.65% 0.24 29.23;
  --destructive-foreground: 98.04% 0 0;
  --border: 26.79% 0.01 286.38;
  --input: 26.79% 0.01 286.38;
  --ring: 54.74% 0.25 262.88;
}
```

### Next.js 14 + Tailwind v4 项目

```css
/* app/globals.css */
@import "tailwindcss";
@import "@a2ui-web/a2ui-react-renderer/styles.css";

@theme {
  /* 使用 Tailwind v4 的 @theme 语法 */
  --color-*: initial;

  /* 定义主题变量 */
  --background: 100% 0 0;
  --foreground: 20% 0 0;
  --primary: 55% 0.25 262;
  /* ... */
}
```

## 常见问题

### Q: 为什么不提供默认颜色？

**A**: A2UI 的设计理念是"组件库只提供结构，样式由宿主项目决定"。这样做的好处：
- 完全符合你的品牌设计
- 避免与现有设计系统冲突
- 更小的包体积（不包含默认主题样式）

### Q: 如何快速开始？

**A**: 复制 shadcn/ui 的默认主题变量到你的项目中：
https://ui.shadcn.com/themes

### Q: 可以混用多个主题吗？

**A**: 可以！使用 CSS 作用域：

```html
<div class="theme-light">
  <!-- 使用浅色主题的组件 -->
</div>

<div class="theme-dark">
  <!-- 使用深色主题的组件 -->
</div>
```

```css
.theme-light {
  --primary: 55% 0.25 262;
  /* ... */
}

.theme-dark {
  --primary: 60% 0.3 270;
  /* ... */
}
```

## 相关资源

- [shadcn/ui 主题编辑器](https://ui.shadcn.com/themes)
- [OKLCH 颜色选择器](https://oklch.com/)
- [CSS 自定义属性 (MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Tailwind CSS v4 主题系统](https://tailwindcss.com/docs/theme)

---

**最后更新**: 2026-01-14
**维护者**: A2UI Team
