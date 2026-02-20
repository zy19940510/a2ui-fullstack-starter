# 云溪专用 Design Tokens

> **Source**: [Figma - 云溪专用](https://www.figma.com/design/NnrCx3x3PVukxpFxxObdXg/云溪专用?node-id=23-18636)

本文档记录了从 Figma 设计规范提取的所有设计令牌（Design Tokens），与 `index.js` 和 `index.css` 配置文件保持同步。

---

## 品牌色系 Brand Colors

| Token | 值 | Tailwind 类名 | 用途 |
|-------|-----|---------------|------|
| 品牌主色 | `#37A0FF` | `bg-brand` / `text-brand` | 主要品牌色，用于重要按钮、链接等 |
| 品牌辅助色 | `#EBF5FF` | `bg-brand-secondary` | 浅色品牌背景 |

---

## 涨跌色系 Market Colors

| Token | 值 | Tailwind 类名 | 用途 |
|-------|-----|---------------|------|
| 涨/买入/卖出色·橙 | `#FF5000` | `text-market-up` / `bg-market-up` | 上涨、买入相关 |
| 涨/买入/卖出色·绿 | `#00B99A` | `text-market-down` / `bg-market-down` | 下跌、卖出相关 |

---

## 文本色系 Text Colors

| Token | 值 | Tailwind 类名 | 用途 |
|-------|-----|---------------|------|
| 一级字体色 | `#000000` | `text-text-1` | 最重要的文字内容 |
| 一级补充字 | `#464F56` | `text-text-1-supplement` | 较重要但需与一级色拉开差异 |
| 二级字体色 | `#82888D` | `text-text-2` | 副文本内容 |
| 三级字体色 | `#AFB3B6` | `text-text-3` | 辅助说明及弱文本信息 |

---

## 控件色系 Control Colors

| Token | 值 | Tailwind 类名 | 用途 |
|-------|-----|---------------|------|
| 卡片描边色 | `#E2E3E4` | `border-control-card-border` | 卡片边框 |
| 分割线色 | `#EAEBEC` | `border-control-divider` / `bg-control-divider` | 分割线 |
| 控件背景色 | `#F5F6F6` | `bg-control-background` | 输入框、选择器等控件背景 |

---

## 框架色系 Frame Colors

| Token | 值 | Tailwind 类名 | 用途 |
|-------|-----|---------------|------|
| 一级卡片色 | `#FFFFFF` | `bg-frame-card` | 卡片背景 |
| 背景色 | `#F8F9FA` | `bg-frame-background` / `bg-page` | 页面背景 |
| 表头背景色 | `#F1F0F2` | `bg-frame-header` | 表格表头背景 |

---

## 按钮色系 Button Colors

| Token | 值 | Tailwind 类名 | 用途 |
|-------|-----|---------------|------|
| 主按钮色 | `#37A0FF` | `bg-button-primary` | 主要按钮背景 |
| 主按钮Hover色 | `#289DFC` | `hover:bg-button-primary-hover` | 主按钮悬停状态 |
| 辅助按钮描边色 | `#C7CACC` | `border-button-border` | 次要按钮边框 |
| 不可用按钮色 | `#C7CACC` | `bg-button-disabled` | 禁用状态按钮 |
| Hover叠加色 | `rgba(234, 235, 236, 0.25)` | `bg-button-hover-overlay` | 悬停叠加效果 |

---

## 边框色系 Border Colors

| Token | 值 | Tailwind 类名 | 用途 |
|-------|-----|---------------|------|
| 默认边框 | `#EAEBEC` | `border` / `border-border` | 默认边框颜色 |
| 卡片边框 | `#E2E3E4` | `border-border-card` | 卡片边框 |
| 描边色 | `#C7C4CC` | `border-border-outline` | 强调描边 |

---

## 语义化别名 Semantic Aliases

为保持向后兼容和便于使用，提供以下语义化别名：

| Token | 值 | Tailwind 类名 | 映射到 |
|-------|-----|---------------|--------|
| page | `#F8F9FA` | `bg-page` | frame.background |
| card | `#FFFFFF` | `bg-card` | frame.card |
| surface | `#F5F6F6` | `bg-surface` | control.background |

---

## CSS 变量主题 Theme Variables

支持亮色/暗色主题切换的 CSS 变量：

| 变量 | 亮色值 | 暗色值 | 用途 |
|------|--------|--------|------|
| `--canvas` | `#F8F9FA` | `#1C1C28` | 页面背景 |
| `--ink` | `#000000` | `#FFFFFF` | 主要文字 |
| `--muted` | `#82888D` | - | 次要文字 |
| `--accent` | `#37A0FF` | - | 强调色 |
| `--accent-strong` | `#37A0FF` | - | 强强调色 |
| `--accent-soft` | `rgba(55, 160, 255, 0.1)` | - | 弱强调色 |
| `--panel` | `#FFFFFF` | `#2A2A3A` | 面板背景 |
| `--panel-border` | `#EAEBEC` | `#3A3A4A` | 面板边框 |
| `--shadow` | `0 -2px 8px rgba(0, 0, 0, 0.08)` | - | 阴影 |

**使用方式**：
```css
/* 自动响应主题切换 */
.my-element {
  background-color: var(--canvas);
  color: var(--ink);
}
```

---

## 字体 Typography

### 字体家族

| Token | 值 | Tailwind 类名 |
|-------|-----|---------------|
| 中文字体 | `PingFang SC` + fallbacks | `font-sans` |
| 英文字体 | `SF Pro Display` + fallbacks | `font-display` |

### 字号规范

| Token | 字号 | 行高 | 字重 | Tailwind 类名 |
|-------|------|------|------|---------------|
| 12/R | 12px | 18px | 400 | `text-xs` |
| 12/M | 12px | 18px | 500 | `text-xs-medium` |
| 14/R | 14px | 20px | 400 | `text-sm` |
| 14/M | 14px | 20px | 500 | `text-sm-medium` |
| 16/M | 16px | 24px | 500 | `text-base` |
| 16/R | 16px | 24px | 400 | `text-base-regular` |

---

## 圆角 Border Radius

| Token | 值 | Tailwind 类名 | 用途 |
|-------|-----|---------------|------|
| sm | 4px | `rounded-sm` | 小型元素（小按钮、标签） |
| md | 8px | `rounded-md` | 中型元素（按钮、输入框） |
| lg | 12px | `rounded-lg` | 大型元素（卡片、弹窗） |

---

## 阴影 Shadows

| Token | 值 | Tailwind 类名 | 用途 |
|-------|-----|---------------|------|
| drawer | `0 -2px 8px rgba(0, 0, 0, 0.08)` | `shadow-drawer` | 抽屉、弹层阴影 |
| panel | `0 -2px 8px rgba(0, 0, 0, 0.08)` | `shadow-panel` | 面板阴影 |

---

## 按钮尺寸规范 Button Sizes

| 尺寸 | 高度 | 圆角 | 水平边距 | 推荐用途 |
|------|------|------|----------|----------|
| 大型 | 40px | 8px | 16px/20px | 主要操作、表单提交 |
| 中型 | 36px | 8px | 16px | 常规操作 |
| 小型 | 28px | 4px | 12px | 辅助操作、表格内按钮 |

---

## 使用示例

### Tailwind CSS v3 (index.js)

```jsx
// 品牌按钮
<button className="bg-button-primary hover:bg-button-primary-hover text-white rounded-md px-4 py-2">
  主要按钮
</button>

// 次要按钮
<button className="bg-white border border-button-border text-text-1 rounded-md px-4 py-2 hover:bg-button-hover-overlay">
  次要按钮
</button>

// 文本层级
<h1 className="text-text-1 text-base font-medium">标题</h1>
<p className="text-text-1-supplement text-sm">副标题</p>
<span className="text-text-2 text-xs">说明文字</span>
<span className="text-text-3 text-xs">辅助信息</span>

// 卡片
<div className="bg-frame-card border border-control-card-border rounded-lg p-4 shadow-panel">
  卡片内容
</div>

// 表格表头
<thead className="bg-frame-header">
  <tr>
    <th>列1</th>
    <th>列2</th>
  </tr>
</thead>
```

### Tailwind CSS v4 (index.css)

```jsx
// 使用 CSS 变量实现主题切换
<div className="bg-canvas text-ink">
  <div className="bg-panel border-panel-border rounded-lg shadow-panel">
    面板内容
  </div>
</div>
```

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| 1.0.0 | 2024-01 | 初始版本，从 Figma 提取完整设计规范 |
