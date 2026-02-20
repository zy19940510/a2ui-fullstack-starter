# A2UI shadcn/ui Components

基于 shadcn/ui 的 A2UI 0.8 组件库，使用 `auicom:` 前缀实现样式隔离。

## 架构说明

### 样式隔离策略

- **@a2ui-web/shadcn-ui**: 基础 UI 组件库（Button、Card 等），使用标准 Tailwind CSS，由宿主项目扫描和构建
- **@a2ui-web/a2ui-react-renderer**: A2UI 组件（Navbar、Typography），使用 `auicom:` 前缀，预构建并发布

### 为什么使用 auicom: 前缀？

所有 a2ui-react-renderer 中的组件都使用 `auicom:` 前缀，原因：

1. **避免样式污染**: 防止与宿主项目的 Tailwind 类冲突
2. **预构建隔离**: a2ui-react-renderer 包的样式已经预构建在 `dist/styles.css` 中
3. **宿主项目无需扫描**: 宿主项目的 `tailwind.config.js` 不需要扫描 a2ui-react-renderer 源文件

### 宿主项目配置

```javascript
// tailwind.config.js
export default {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    // ✅ 扫描 shadcn-ui 组件源文件（Button、Card 等基础组件）
    '../../node_modules/@a2ui-web/shadcn-ui/src/**/*.{js,ts,jsx,tsx}',
    // ❌ 不扫描 a2ui-react-renderer 源文件（使用 auicom: 前缀，已预构建）
  ],
}
```

```typescript
// _app.tsx 或 layout.tsx
import '@a2ui-web/a2ui-react-renderer/styles.css' // 导入预构建的 CSS
```

## 组件列表

### Typography 组件

文字排版组件，支持多种变体和颜色。

**文件位置**:
- `/a2ui-react-renderer/src/a2ui-components/shadcnui/typography/index.tsx` - 组件实现
- `/a2ui-react-renderer/src/a2ui-components/shadcnui/typography/typography.example.ts` - 使用示例

**组件属性**:

| 属性 | 类型 | 说明 | 默认值 |
|------|------|------|--------|
| text | StringValue | 文本内容（支持 literalString 或 path） | - |
| variant | StringValue | 排版变体（见下方变体列表） | "body-m" |
| color | StringValue | 文本颜色（见下方颜色列表） | "default" |
| as | StringValue | HTML 元素标签 (h1/h2/p/span/div 等) | "p" |
| align | StringValue | 文本对齐 (left/center/right/justify) | "left" |
| className | StringValue | 额外的 CSS 类 | - |

**排版变体**:

Display 系列（大标题）:
- `display-xl` - 72px, Bold, -1.677px tracking
- `display-l` - 60px, Bold, -1.4px tracking
- `display-m` - 48px, Bold, -1.2px tracking
- `display-s` - 40px, Bold, -1px tracking

Heading 系列（标题）:
- `heading-xl` - 48px, Bold, 0.5px tracking
- `heading-l` - 36px, Bold, 0.37px tracking
- `heading-m` - 30px, Bold, 0.3px tracking
- `heading-s` - 24px, Bold, 0.25px tracking
- `heading-xs` - 20px, Bold, 0.2px tracking

Body 系列（正文）:
- `body-l` - 18px, Light, -0.44px tracking
- `body-m` - 16px, Normal（默认）
- `body-s` - 14px, Normal

工具类:
- `caption` - 12px, Normal
- `overline` - 12px, Medium, Uppercase, 1px tracking

**颜色选项**:
- `default` - 前景色
- `primary` - 主色
- `secondary` - 次要色
- `muted` - 弱化色
- `accent` - 强调色
- `destructive` - 危险色
- `white` - 白色
- `inherit` - 继承父元素颜色

## 使用示例

### 示例 1: 大标题（Display）

```typescript
{
  id: 'hero-title',
  component: {
    Typography: {
      text: { literalString: 'Trading Growth' },
      variant: { literalString: 'display-xl' },
      color: { literalString: 'white' },
      as: { literalString: 'h1' },
    },
  },
}
```

### 示例 2: 章节标题（Heading）

```typescript
{
  id: 'section-title',
  component: {
    Typography: {
      text: { literalString: 'Market Overview' },
      variant: { literalString: 'heading-l' },
      color: { literalString: 'white' },
      as: { literalString: 'h2' },
    },
  },
}
```

### 示例 3: 正文文本（Body）

```typescript
{
  id: 'description',
  component: {
    Typography: {
      text: {
        literalString: 'Top 1 in trading growth for Hong Kong stocks among all technology brokers.',
      },
      variant: { literalString: 'body-l' },
      color: { literalString: 'muted' },
      as: { literalString: 'p' },
    },
  },
}
```

### 示例 4: 数据绑定

```typescript
{
  id: 'dynamic-text',
  component: {
    Typography: {
      text: { path: 'article.title' }, // 从数据模型获取
      variant: { literalString: 'heading-l' },
      color: { literalString: 'white' },
      as: { literalString: 'h1' },
    },
  },
}
```

### 示例 5: 完整的 Surface 示例

```typescript
processor.processMessages([
  {
    surfaceUpdate: {
      surfaceId: 'typography-demo',
      components: [
        {
          id: 'root',
          component: {
            Column: {
              children: { explicitList: ['title', 'subtitle', 'body'] },
              distribution: { literalString: 'start' },
              gap: { literalNumber: 16 },
            },
          },
        },
        {
          id: 'title',
          component: {
            Typography: {
              text: { literalString: 'Welcome' },
              variant: { literalString: 'display-l' },
              color: { literalString: 'white' },
              as: { literalString: 'h1' },
            },
          },
        },
        {
          id: 'subtitle',
          component: {
            Typography: {
              text: { literalString: 'Get Started' },
              variant: { literalString: 'heading-m' },
              color: { literalString: 'white' },
              as: { literalString: 'h2' },
            },
          },
        },
        {
          id: 'body',
          component: {
            Typography: {
              text: { literalString: 'This is body text with default styling.' },
              variant: { literalString: 'body-m' },
              as: { literalString: 'p' },
            },
          },
        },
      ],
    },
  },
  {
    beginRendering: {
      surfaceId: 'typography-demo',
      root: 'root',
    },
  },
])
```

## 实现细节

### 样式映射

Typography 组件使用静态类名映射，所有类都带 `auicom:` 前缀：

```typescript
const variantClasses = {
  'display-xl': 'auicom:text-7xl auicom:font-bold auicom:leading-[72px] auicom:tracking-[-1.677px]',
  'heading-l': 'auicom:text-4xl auicom:font-bold auicom:leading-[40px] auicom:tracking-[0.37px]',
  'body-m': 'auicom:text-base auicom:font-normal auicom:leading-[24px]',
  // ...
} as const

const colorClasses = {
  'white': 'auicom:text-white',
  'muted': 'auicom:text-muted-foreground',
  // ...
} as const
```

### CSS 构建

- 使用 Tailwind CSS v4 构建
- 所有类都带 `auicom:` 前缀
- 通过 PostCSS 插件移除 `@layer` 指令，确保兼容 Tailwind v3/v4 项目
- 最终 CSS 输出在 `dist/styles.css` (~10KB)

### React 兼容性

- 支持 React 17+
- 使用 `useA2UIValue` hook 实现数据绑定
- SSR 安全（无 CustomEvent 依赖）
- 自动客户端边界（通过 hooks）

## 技术栈

- **React**: 17+
- **Tailwind CSS**: v4（生成 auicom: 前缀）
- **A2UI Protocol**: 0.8
- **TypeScript**: 完整类型支持

## 注意事项

1. **必须导入 CSS**: 在应用入口导入 `@a2ui-web/a2ui-react-renderer/styles.css`
2. **不要扫描源文件**: 宿主项目的 Tailwind 配置不应扫描 a2ui-react-renderer 源文件
3. **前缀一致性**: 所有组件内部类名都使用 `auicom:` 前缀
4. **消息格式**: 使用 `component: { Typography: {...} }` 格式，不是旧的 `type/properties` 格式

## 设计系统

Typography 组件基于以下设计系统：
- Figma URL: https://www.figma.com/design/5RV0MmCs1YbHpEfBjUadk1
- Node ID: 14-424
- 设计系统：web官网组件库（厨子）

## 更多示例

查看 `/typography/typography.example.ts` 获取更多完整示例，包括：
- Display 变体示例
- Heading 变体示例
- Body & Utility 变体示例
- 数据绑定示例
- 组合使用示例
