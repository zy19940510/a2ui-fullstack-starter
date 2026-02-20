# Layout 组件文档

A2UI 0.8 协议的布局组件，基于 Flexbox 布局模型，提供 Column（垂直布局）和 Row（横向布局）两种容器组件。

## 📋 目录

- [基本概念](#基本概念)
- [Column 组件](#column-组件)
- [Row 组件](#row-组件)
- [属性详解](#属性详解)
- [使用示例](#使用示例)
- [最佳实践](#最佳实践)

## 基本概念

### 设计理念

Layout 组件基于 **CSS Flexbox** 布局模型：

- **Column**: `flex-direction: column` - 子元素垂直排列
- **Row**: `flex-direction: row` - 子元素横向排列

### 核心属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `children` | `ComponentArrayReference` | - | 子组件列表（必需） |
| `distribution` | `string` | `"start"` | 主轴对齐方式 |
| `alignment` | `string` | `"stretch"` (Column) / `"center"` (Row) | 交叉轴对齐方式 |
| `gap` | `number` | `0` | 子元素间距（像素） |
| `wrap` | `boolean` | `false` | 是否允许换行（flex-wrap） |
| `padding` | `number` | `0` | 容器内边距（像素） |
| `width` | `string` | - | 容器宽度（如 "100%"、"500px"） |
| `height` | `string` | - | 容器高度（如 "100%"、"300px"） |
| `maxWidth` | `string` | - | 容器最大宽度（如 "1200px"） |
| `maxHeight` | `string` | - | 容器最大高度（如 "600px"） |

## Column 组件

### 类型定义

```typescript
// A2UI 0.8 协议规范（来自 lit-core）
export interface ResolvedColumn {
    children: AnyComponentNode[];
    distribution?: "start" | "center" | "end" | "spaceBetween" | "spaceAround" | "spaceEvenly";
    alignment?: "start" | "center" | "end" | "stretch";
}
```

### 消息格式

```typescript
{
  id: 'my-column',
  component: {
    Column: {
      children: { explicitList: ['child-1', 'child-2', 'child-3'] },
      distribution: { literalString: 'start' },    // 垂直方向对齐
      alignment: { literalString: 'center' },      // 水平方向对齐
      gap: { literalNumber: 16 }                   // 间距 16px
    }
  }
}
```

### 布局行为

**Column 的主轴和交叉轴**：

```
┌─────────────────────┐
│                     │ ← alignment 控制（交叉轴 = 水平）
│   ┌─────────┐       │
│   │ Child 1 │       │
│   └─────────┘       │
│        ↕ gap        │
│   ┌─────────┐       │ ← distribution 控制（主轴 = 垂直）
│   │ Child 2 │       │
│   └─────────┘       │
│        ↕ gap        │
│   ┌─────────┐       │
│   │ Child 3 │       │
│   └─────────┘       │
│                     │
└─────────────────────┘
```

## Row 组件

### 类型定义

```typescript
// A2UI 0.8 协议规范（来自 lit-core）
export interface ResolvedRow {
    children: AnyComponentNode[];
    distribution?: "start" | "center" | "end" | "spaceBetween" | "spaceAround" | "spaceEvenly";
    alignment?: "start" | "center" | "end" | "stretch";
}
```

### 消息格式

```typescript
{
  id: 'my-row',
  component: {
    Row: {
      children: { explicitList: ['child-1', 'child-2', 'child-3'] },
      distribution: { literalString: 'spaceBetween' },  // 水平方向对齐
      alignment: { literalString: 'center' },           // 垂直方向对齐
      gap: { literalNumber: 12 }                        // 间距 12px
    }
  }
}
```

### 布局行为

**Row 的主轴和交叉轴**：

```
┌───────────────────────────────────────┐
│                                       │
│  ┌─────┐ gap ┌─────┐ gap ┌─────┐    │
│  │  1  │ ←──→│  2  │ ←──→│  3  │    │ ← alignment 控制（交叉轴 = 垂直）
│  └─────┘     └─────┘     └─────┘    │
│  ←──── distribution 控制 ────────→   │ （主轴 = 水平）
│                                       │
└───────────────────────────────────────┘
```

## 属性详解

### `children` - 子组件列表

**类型**: `ComponentArrayReference`

**两种定义方式**：

#### 1. 显式列表（explicitList）

直接指定子组件 ID 列表：

```typescript
children: {
  explicitList: ['header', 'content', 'footer']
}
```

#### 2. 模板绑定（template）

从数据模型动态生成子组件：

```typescript
children: {
  template: {
    componentId: 'item-template',
    dataBinding: 'items'  // 绑定到 data model 中的 items 数组
  }
}
```

### `distribution` - 主轴对齐

**类型**: `"start" | "center" | "end" | "spaceBetween" | "spaceAround" | "spaceEvenly"`

**默认值**: `"start"`

**映射到 CSS**: `justify-content`

| 值 | CSS 值 | 效果 | 适用场景 |
|---|--------|------|---------|
| `start` | `flex-start` | 从起点开始排列 | 默认顺序排列 |
| `center` | `center` | 居中排列 | 内容居中显示 |
| `end` | `flex-end` | 从终点开始排列 | 底部/右侧对齐 |
| `spaceBetween` | `space-between` | 两端对齐，中间等分 | 导航栏、工具栏 |
| `spaceAround` | `space-around` | 环绕等分空间 | 卡片网格 |
| `spaceEvenly` | `space-evenly` | 完全等分空间 | 均匀分布 |

**示例对比**：

```
start:         [■][■][■]___________
center:        _____[■][■][■]______
end:           ___________[■][■][■]
spaceBetween:  [■]_______[■]_______[■]
spaceAround:   __[■]____[■]____[■]__
spaceEvenly:   ___[■]___[■]___[■]___
```

### `alignment` - 交叉轴对齐

**类型**: `"start" | "center" | "end" | "stretch"`

**默认值**: `"stretch"`

**映射到 CSS**: `align-items`

| 值 | CSS 值 | 效果 | 适用场景 |
|---|--------|------|---------|
| `start` | `flex-start` | 交叉轴起点对齐 | 顶部/左侧对齐 |
| `center` | `center` | 交叉轴居中 | 垂直居中 |
| `end` | `flex-end` | 交叉轴终点对齐 | 底部/右侧对齐 |
| `stretch` | `stretch` | 拉伸填充交叉轴 | 等高/等宽布局 |

### `gap` - 间距

**类型**: `number`

**默认值**: `0`

**单位**: 像素（px）

**映射到 CSS**: `gap` 属性

```typescript
gap: { literalNumber: 16 }  // 16px 间距
```

### `wrap` - 换行控制（新增）

**类型**: `boolean`

**默认值**: `false`

**映射到 CSS**: `flex-wrap`

允许子元素在空间不足时自动换行，实现响应式布局。

```typescript
// 示例：按钮组自动换行
{
  Row: {
    children: { explicitList: ['btn1', 'btn2', 'btn3', 'btn4', 'btn5'] },
    wrap: { literalBoolean: true },    // 启用换行
    gap: { literalNumber: 12 }
  }
}
```

**效果对比**：

```text
wrap: false (默认)
┌─────────────────────────────────┐
│ [Btn1][Btn2][Btn3][Btn4][Btn5]  │ ← 所有按钮挤在一行，可能溢出
└─────────────────────────────────┘

wrap: true
┌─────────────────────────────────┐
│ [Btn1] [Btn2] [Btn3]            │ ← 自动换行
│ [Btn4] [Btn5]                   │
└─────────────────────────────────┘
```

### `padding` - 容器内边距（新增）

**类型**: `number`

**默认值**: `0`

**单位**: 像素（px）

**映射到 CSS**: `padding` 属性

```typescript
{
  Row: {
    children: { explicitList: ['item1', 'item2'] },
    padding: { literalNumber: 16 }  // 容器四周 16px 内边距
  }
}
```

### `width` / `height` - 容器尺寸（新增）

**类型**: `string`

**默认值**: 无（自动尺寸）

**映射到 CSS**: `width` / `height` 属性

```typescript
{
  Column: {
    children: { explicitList: ['content'] },
    width: { literalString: '100%' },    // 宽度 100%
    height: { literalString: '500px' }   // 高度 500px
  }
}
```

**常用值**：

- 百分比：`"100%"`, `"50%"`
- 固定像素：`"300px"`, `"500px"`
- 视口单位：`"100vw"`, `"100vh"`
- 自适应：`"auto"`

### `maxWidth` / `maxHeight` - 最大尺寸（新增）

**类型**: `string`

**默认值**: 无

**映射到 CSS**: `max-width` / `max-height` 属性

```typescript
{
  Row: {
    children: { explicitList: ['card1', 'card2', 'card3'] },
    width: { literalString: '100%' },
    maxWidth: { literalString: '1200px' },  // 最大宽度 1200px，实现居中布局
    padding: { literalNumber: 24 }
  }
}
```

**使用场景**：

- 响应式容器：`maxWidth: "1200px"` + `width: "100%"`
- 限制卡片高度：`maxHeight: "600px"` + 滚动

## 使用示例

### 示例 1: 页面布局（Header + Content + Footer）

```typescript
const pageLayoutMessages = [
  {
    surfaceUpdate: {
      surfaceId: 'page-layout',
      components: [
        {
          id: 'root-column',
          component: {
            Column: {
              children: { explicitList: ['header', 'content', 'footer'] },
              distribution: { literalString: 'start' },
              alignment: { literalString: 'stretch' },
              gap: { literalNumber: 0 }
            }
          }
        },
        {
          id: 'header',
          component: {
            Typography: {
              text: { literalString: 'Header' },
              variant: { literalString: 'heading-l' }
            }
          }
        },
        {
          id: 'content',
          component: {
            Typography: {
              text: { literalString: 'Main Content Area' },
              variant: { literalString: 'body-m' }
            }
          }
        },
        {
          id: 'footer',
          component: {
            Typography: {
              text: { literalString: 'Footer' },
              variant: { literalString: 'caption' }
            }
          }
        }
      ]
    }
  },
  {
    beginRendering: {
      surfaceId: 'page-layout',
      root: 'root-column'
    }
  }
]
```

### 示例 2: 导航栏（水平布局 + 两端对齐）

```typescript
const navbarMessages = [
  {
    surfaceUpdate: {
      surfaceId: 'navbar',
      components: [
        {
          id: 'navbar-row',
          component: {
            Row: {
              children: { explicitList: ['logo', 'menu', 'actions'] },
              distribution: { literalString: 'spaceBetween' },  // 两端对齐
              alignment: { literalString: 'center' },            // 垂直居中
              gap: { literalNumber: 16 }
            }
          }
        },
        {
          id: 'logo',
          component: {
            Typography: {
              text: { literalString: 'LOGO' },
              variant: { literalString: 'heading-m' }
            }
          }
        },
        {
          id: 'menu',
          component: {
            Row: {
              children: { explicitList: ['menu-1', 'menu-2', 'menu-3'] },
              distribution: { literalString: 'start' },
              alignment: { literalString: 'center' },
              gap: { literalNumber: 24 }
            }
          }
        },
        {
          id: 'menu-1',
          component: {
            Typography: {
              text: { literalString: '首页' },
              variant: { literalString: 'body-m' }
            }
          }
        },
        {
          id: 'menu-2',
          component: {
            Typography: {
              text: { literalString: '产品' },
              variant: { literalString: 'body-m' }
            }
          }
        },
        {
          id: 'menu-3',
          component: {
            Typography: {
              text: { literalString: '关于' },
              variant: { literalString: 'body-m' }
            }
          }
        },
        {
          id: 'actions',
          component: {
            Typography: {
              text: { literalString: '登录' },
              variant: { literalString: 'body-m' }
            }
          }
        }
      ]
    }
  },
  {
    beginRendering: {
      surfaceId: 'navbar',
      root: 'navbar-row'
    }
  }
]
```

**效果**：

```
┌────────────────────────────────────────────────┐
│ LOGO    首页  产品  关于              登录     │
└────────────────────────────────────────────────┘
  ↑                                            ↑
  左侧                                        右侧
       ←── spaceBetween 两端对齐 ──→
```

### 示例 3: 卡片网格（嵌套 Row + Column）

```typescript
const cardGridMessages = [
  {
    surfaceUpdate: {
      surfaceId: 'card-grid',
      components: [
        {
          id: 'grid-column',
          component: {
            Column: {
              children: { explicitList: ['row-1', 'row-2'] },
              distribution: { literalString: 'start' },
              alignment: { literalString: 'stretch' },
              gap: { literalNumber: 24 }
            }
          }
        },
        {
          id: 'row-1',
          component: {
            Row: {
              children: { explicitList: ['card-1', 'card-2', 'card-3'] },
              distribution: { literalString: 'spaceAround' },
              alignment: { literalString: 'stretch' },
              gap: { literalNumber: 16 }
            }
          }
        },
        {
          id: 'row-2',
          component: {
            Row: {
              children: { explicitList: ['card-4', 'card-5', 'card-6'] },
              distribution: { literalString: 'spaceAround' },
              alignment: { literalString: 'stretch' },
              gap: { literalNumber: 16 }
            }
          }
        },
        // ... card-1 到 card-6 的定义
      ]
    }
  },
  {
    beginRendering: {
      surfaceId: 'card-grid',
      root: 'grid-column'
    }
  }
]
```

**效果**：

```
┌────────────────────────────────────┐
│  [Card 1]  [Card 2]  [Card 3]     │
│                                    │
│  [Card 4]  [Card 5]  [Card 6]     │
└────────────────────────────────────┘
```

### 示例 4: 表单布局（标签 + 输入框）

```typescript
const formLayoutMessages = [
  {
    surfaceUpdate: {
      surfaceId: 'form-layout',
      components: [
        {
          id: 'form-column',
          component: {
            Column: {
              children: { explicitList: ['field-1', 'field-2', 'field-3'] },
              distribution: { literalString: 'start' },
              alignment: { literalString: 'stretch' },
              gap: { literalNumber: 16 }
            }
          }
        },
        {
          id: 'field-1',
          component: {
            Row: {
              children: { explicitList: ['label-1', 'input-1'] },
              distribution: { literalString: 'start' },
              alignment: { literalString: 'center' },
              gap: { literalNumber: 12 }
            }
          }
        },
        {
          id: 'label-1',
          component: {
            Typography: {
              text: { literalString: '用户名:' },
              variant: { literalString: 'body-m' }
            }
          }
        },
        {
          id: 'input-1',
          component: {
            TextField: {
              placeholder: { literalString: '请输入用户名' }
            }
          }
        },
        // ... field-2 和 field-3 类似
      ]
    }
  },
  {
    beginRendering: {
      surfaceId: 'form-layout',
      root: 'form-column'
    }
  }
]
```

### 示例 5: 响应式按钮组（使用 wrap 自动换行）

```typescript
const responsiveButtonsMessages = [
  {
    surfaceUpdate: {
      surfaceId: 'button-group',
      components: [
        {
          id: 'buttons-row',
          component: {
            Row: {
              children: {
                explicitList: [
                  'btn-primary', 'btn-secondary', 'btn-danger',
                  'btn-warning', 'btn-success', 'btn-info'
                ]
              },
              wrap: { literalBoolean: true },          // 启用自动换行
              gap: { literalNumber: 12 },              // 按钮间距 12px
              maxWidth: { literalString: '800px' },    // 最大宽度
              padding: { literalNumber: 16 }           // 容器内边距
            }
          }
        },
        // ... 按钮组件定义（btn-primary, btn-secondary 等）
      ]
    }
  },
  {
    beginRendering: {
      surfaceId: 'button-group',
      root: 'buttons-row'
    }
  }
]
```

**效果**：

```text
桌面端 (宽屏):
┌──────────────────────────────────────────────────────────┐
│  [Primary] [Secondary] [Danger] [Warning] [Success] [Info]│
└──────────────────────────────────────────────────────────┘

移动端 (窄屏，自动换行):
┌────────────────────────────┐
│  [Primary] [Secondary]     │
│  [Danger]  [Warning]       │
│  [Success] [Info]          │
└────────────────────────────┘
```

### 示例 6: 响应式模板（动态子元素）

```typescript
// 1. 更新数据模型
processor.processMessages([
  {
    dataModelUpdate: {
      surfaceId: 'dynamic-list',
      path: 'items',
      contents: [
        { key: '0', valueString: 'Item 1' },
        { key: '1', valueString: 'Item 2' },
        { key: '2', valueString: 'Item 3' }
      ]
    }
  }
])

// 2. 使用模板绑定
const dynamicListMessages = [
  {
    surfaceUpdate: {
      surfaceId: 'dynamic-list',
      components: [
        {
          id: 'list-column',
          component: {
            Column: {
              children: {
                template: {
                  componentId: 'item-template',
                  dataBinding: 'items'  // 绑定到 items 数组
                }
              },
              distribution: { literalString: 'start' },
              alignment: { literalString: 'stretch' },
              gap: { literalNumber: 8 }
            }
          }
        },
        {
          id: 'item-template',
          component: {
            Typography: {
              text: { path: '.' },  // 绑定到当前数组项
              variant: { literalString: 'body-m' }
            }
          }
        }
      ]
    }
  },
  {
    beginRendering: {
      surfaceId: 'dynamic-list',
      root: 'list-column'
    }
  }
]
```

## 最佳实践

### 1. 选择正确的布局组件

```typescript
// ✅ 垂直列表 - 使用 Column
{
  component: {
    Column: {
      children: { explicitList: ['title', 'desc', 'action'] }
    }
  }
}

// ✅ 水平导航 - 使用 Row
{
  component: {
    Row: {
      children: { explicitList: ['logo', 'menu', 'profile'] }
    }
  }
}

// ❌ 不要用 Column 做水平布局
{
  component: {
    Column: {  // 错误：Column 是垂直的
      children: { explicitList: ['btn1', 'btn2', 'btn3'] }
    }
  }
}
```

### 2. 合理使用 distribution

```typescript
// ✅ 导航栏 - 两端对齐
{
  Row: {
    distribution: { literalString: 'spaceBetween' },  // Logo 左，Menu 右
    children: { explicitList: ['logo', 'menu'] }
  }
}

// ✅ 按钮组 - 居中显示
{
  Row: {
    distribution: { literalString: 'center' },
    children: { explicitList: ['cancel-btn', 'submit-btn'] }
  }
}

// ✅ 卡片网格 - 环绕等分
{
  Row: {
    distribution: { literalString: 'spaceAround' },
    children: { explicitList: ['card1', 'card2', 'card3'] }
  }
}
```

### 3. 合理使用 alignment

```typescript
// ✅ 图标 + 文字垂直居中
{
  Row: {
    alignment: { literalString: 'center' },  // 垂直居中
    children: { explicitList: ['icon', 'text'] }
  }
}

// ✅ 等高卡片
{
  Row: {
    alignment: { literalString: 'stretch' },  // 拉伸到相同高度
    children: { explicitList: ['card1', 'card2', 'card3'] }
  }
}

// ✅ 标签顶部对齐输入框
{
  Row: {
    alignment: { literalString: 'start' },  // 顶部对齐
    children: { explicitList: ['label', 'textarea'] }
  }
}
```

### 4. 间距设计

```typescript
// ✅ 标准间距规范（8px 基准）
gap: { literalNumber: 8 }   // 小间距
gap: { literalNumber: 16 }  // 中间距（常用）
gap: { literalNumber: 24 }  // 大间距
gap: { literalNumber: 32 }  // 超大间距

// ✅ 紧密排列
gap: { literalNumber: 4 }   // 标签、徽章

// ✅ 分组间距
gap: { literalNumber: 48 }  // 不同区块之间

// ❌ 避免奇数间距
gap: { literalNumber: 13 }  // 不推荐
gap: { literalNumber: 17 }  // 不推荐
```

### 5. 嵌套布局

```typescript
// ✅ 外层 Column，内层 Row
{
  id: 'page',
  component: {
    Column: {
      children: { explicitList: ['header', 'content', 'footer'] },
      gap: { literalNumber: 0 }
    }
  }
},
{
  id: 'header',
  component: {
    Row: {
      children: { explicitList: ['logo', 'nav', 'actions'] },
      distribution: { literalString: 'spaceBetween' },
      alignment: { literalString: 'center' }
    }
  }
}

// ✅ 嵌套深度不要超过 3-4 层
// ❌ 过度嵌套会导致性能问题和维护困难
```

### 6. 性能优化

```typescript
// ✅ 使用 template 动态渲染列表（而非 explicitList）
{
  Column: {
    children: {
      template: {
        componentId: 'item',
        dataBinding: 'items'  // 数据驱动
      }
    }
  }
}

// ❌ 不要为大量子元素使用 explicitList
{
  Column: {
    children: {
      explicitList: ['item-1', 'item-2', ..., 'item-1000']  // 不推荐
    }
  }
}
```

### 7. 响应式布局（使用新增属性）

```typescript
// ✅ 按钮组自动换行 - 使用 wrap
{
  Row: {
    children: { explicitList: ['btn1', 'btn2', 'btn3', 'btn4', 'btn5'] },
    wrap: { literalBoolean: true },    // 空间不足时自动换行
    gap: { literalNumber: 12 }
  }
}

// ✅ 限制容器最大宽度 - 使用 maxWidth
{
  Row: {
    children: { explicitList: ['card1', 'card2', 'card3'] },
    width: { literalString: '100%' },
    maxWidth: { literalString: '1200px' },  // 桌面端最大宽度
    padding: { literalNumber: 24 }          // 内边距
  }
}

// ✅ 固定高度 + 内边距
{
  Column: {
    children: { explicitList: ['item1', 'item2', 'item3'] },
    height: { literalString: '400px' },
    padding: { literalNumber: 16 }
  }
}

// ❌ 避免同时使用 width 和 maxWidth 导致冲突
{
  Row: {
    width: { literalString: '800px' },      // 固定宽度
    maxWidth: { literalString: '600px' }    // ❌ 矛盾：固定宽度大于最大宽度
  }
}
```

## 技术规范

### A2UI 0.8 协议来源

Layout 组件基于 **A2UI 0.8 协议规范**，定义在 `@a2ui-web/lit-core` 包中：

- **类型定义**: `lit-core/dist/types/types.d.ts`
  - `ResolvedColumn` (line 349-353)
  - `ResolvedRow` (line 344-348)

- **Web Components 实现**: `lit-core/dist/ui/`
  - `column.d.ts` - Column Lit 组件
  - `row.d.ts` - Row Lit 组件

- **React 实现**: `a2ui-react-renderer/src/a2ui-components/layout/`
  - `index.tsx` - Column 和 Row React 组件

### CSS 实现原理

```typescript
// Column 组件渲染为：
<div style={{
  display: 'flex',
  flexDirection: 'column',
  justifyContent: distributionMap[distribution],  // 主轴（垂直）
  alignItems: alignmentMap[alignment],            // 交叉轴（水平）
  gap: gap > 0 ? `${gap}px` : undefined,
  flexWrap: wrap ? 'wrap' : 'nowrap',            // 新增：换行控制
  padding: padding > 0 ? `${padding}px` : undefined, // 新增：内边距
  width,                                         // 新增：容器宽度
  height,                                        // 新增：容器高度
  maxWidth,                                      // 新增：最大宽度
  maxHeight                                      // 新增：最大高度
}}>
  {children}
</div>

// Row 组件渲染为：
<div style={{
  display: 'flex',
  flexDirection: 'row',
  justifyContent: distributionMap[distribution],  // 主轴（水平）
  alignItems: alignmentMap[alignment],            // 交叉轴（垂直）
  gap: gap > 0 ? `${gap}px` : undefined,
  flexWrap: wrap ? 'wrap' : 'nowrap',            // 新增：换行控制
  padding: padding > 0 ? `${padding}px` : undefined, // 新增：内边距
  width,                                         // 新增：容器宽度
  height,                                        // 新增：容器高度
  maxWidth,                                      // 新增：最大宽度
  maxHeight                                      // 新增：最大高度
}}>
  {children}
</div>
```

## 常见问题

### Q1: Column 和 Row 有什么区别？

**A**: 唯一区别是 `flex-direction`：
- **Column**: `flex-direction: column` - 主轴是垂直的
- **Row**: `flex-direction: row` - 主轴是水平的

其他属性（`distribution`、`alignment`、`gap`）行为完全相同，只是作用的方向不同。

### Q2: 如何实现响应式布局？

**A**: A2UI 0.8 协议本身不支持响应式断点。需要通过数据模型动态切换布局：

```typescript
// 根据屏幕宽度更新数据模型
const isMobile = window.innerWidth < 768

processor.processMessages([
  {
    surfaceUpdate: {
      surfaceId: 'responsive-layout',
      components: [
        {
          id: 'root',
          component: isMobile ? {
            Column: {  // 移动端垂直布局
              children: { explicitList: ['item1', 'item2', 'item3'] }
            }
          } : {
            Row: {  // 桌面端水平布局
              children: { explicitList: ['item1', 'item2', 'item3'] }
            }
          }
        }
      ]
    }
  }
])
```

### Q3: 如何实现固定高度/宽度？

**A**: Layout 组件不直接支持固定尺寸，需要在子组件上设置 `styles`：

```typescript
{
  id: 'fixed-height-child',
  component: {
    Typography: {
      text: { literalString: 'Fixed Height' },
      styles: {
        height: { literalString: '200px' }
      }
    }
  }
}
```

### Q4: 如何实现滚动容器？

**A**: 在 `beginRendering` 消息中设置容器样式：

```typescript
{
  beginRendering: {
    surfaceId: 'scrollable-list',
    root: 'list-column',
    styles: {
      'max-height': '400px',
      'overflow-y': 'auto'
    }
  }
}
```

### Q5: 可以嵌套相同类型的布局吗？

**A**: 可以！Column 内可以嵌套 Column，Row 内可以嵌套 Row：

```typescript
{
  id: 'outer-column',
  component: {
    Column: {
      children: { explicitList: ['section1', 'section2'] },
      gap: { literalNumber: 48 }
    }
  }
},
{
  id: 'section1',
  component: {
    Column: {  // 嵌套 Column
      children: { explicitList: ['title', 'content'] },
      gap: { literalNumber: 16 }
    }
  }
}
```

## 相关资源

- [A2UI 0.8 协议规范](../../README.md)
- [Typography 组件文档](../shadcnui/typography/README.md)
- [Navbar 组件文档](../navbar/README.md)
- [示例项目](../../../example/next12-react17/README.md)

---

**最后更新**: 2025-01-12
**维护者**: A2UI Team
