# Text Component

A2UI 文本组件，用于显示各种文本内容。

## 组件名称
`Text`

## 命名空间
`a2ui-test.web`

## 属性 (Props)

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `text` | `BoundValue<string>` | `""` | 文本内容（支持数据绑定） |
| `usageHint` | `BoundValue<string>` | `"body"` | 语义化标签，决定渲染的 HTML 元素和样式 |
| `className` | `BoundValue<string>` | `""` | 自定义 CSS 类名 |
| `weight` | `number` | - | flex 布局权重 |

## usageHint 选项

| 值 | HTML 标签 | 用途 |
|---|----------|------|
| `h1` | `<h1>` | 一级标题 - 超大、粗体 |
| `h2` | `<h2>` | 二级标题 - 带下划线分隔 |
| `h3` | `<h3>` | 三级标题 - 大号、粗体 |
| `h4` | `<h4>` | 四级标题 - 中号、粗体 |
| `h5` | `<h5>` | 五级标题 - 小号、粗体 |
| `h6` | `<h6>` | 六级标题 - 基础大小、粗体 |
| `body` | `<p>` | 正文段落 - 默认样式 |
| `caption` | `<p>` | 说明文字 - 较小、次要颜色 |
| `label` | `<label>` | 表单标签 - 中等字号、粗体 |
| `code` | `<code>` | 行内代码 - 等宽字体、背景色 |
| `pre` | `<pre>` | 代码块 - 等宽字体、背景色、可滚动 |
| `blockquote` | `<blockquote>` | 引用块 - 斜体、左边框 |

## 使用示例

### 基础文本
```json
{
  "id": "text1",
  "component": {
    "Text": {
      "text": {
        "literalString": "这是一段普通文本"
      }
    }
  }
}
```

### 标题
```json
{
  "id": "title",
  "component": {
    "Text": {
      "text": {
        "literalString": "欢迎使用 A2UI"
      },
      "usageHint": {
        "literalString": "h1"
      }
    }
  }
}
```

### 数据绑定
```json
{
  "id": "username",
  "component": {
    "Text": {
      "text": {
        "path": "/user/name"
      },
      "usageHint": {
        "literalString": "h3"
      }
    }
  }
}
```

### 说明文字
```json
{
  "id": "description",
  "component": {
    "Text": {
      "text": {
        "literalString": "这是一段说明文字"
      },
      "usageHint": {
        "literalString": "caption"
      }
    }
  }
}
```

### 代码文本
```json
{
  "id": "code_example",
  "component": {
    "Text": {
      "text": {
        "literalString": "const hello = 'world'"
      },
      "usageHint": {
        "literalString": "code"
      }
    }
  }
}
```

## 完整示例：信息卡片

```json
{
  "surfaceUpdate": {
    "surfaceId": "info_card",
    "components": [
      {
        "id": "root",
        "component": {
          "Column": {
            "children": {
              "explicitList": ["title", "subtitle", "description"]
            }
          }
        }
      },
      {
        "id": "title",
        "component": {
          "Text": {
            "text": {
              "literalString": "产品特性"
            },
            "usageHint": {
              "literalString": "h2"
            }
          }
        }
      },
      {
        "id": "subtitle",
        "component": {
          "Text": {
            "text": {
              "literalString": "高性能、易用、可扩展"
            },
            "usageHint": {
              "literalString": "h4"
            }
          }
        }
      },
      {
        "id": "description",
        "component": {
          "Text": {
            "text": {
              "literalString": "我们的产品提供业界领先的性能，同时保持简单易用的 API 设计。"
            },
            "usageHint": {
              "literalString": "body"
            }
          }
        }
      }
    ]
  }
}
```

## 注意事项

1. **语义化**: 使用正确的 `usageHint` 以确保良好的 HTML 语义和 SEO
2. **可访问性**: 标题层级应该有序（h1 → h2 → h3），不应跳级
3. **数据绑定**: `text` 属性支持 `path` 和 `literalString`
4. **自定义样式**: 可以通过 `className` 添加额外的样式类
5. **flex 布局**: 在 Row/Column 中可以使用 `weight` 控制宽度分配

## 样式定制

所有文本组件都使用 shadcn/ui 的默认主题样式，支持暗色模式。你可以通过以下方式自定义样式：

1. **使用 className**: 添加 Tailwind CSS 类
2. **全局主题**: 修改 `app/globals.css` 中的 CSS 变量
3. **组件级别**: 通过 `beginRendering` 的 `styles` 配置主题色

## 相关组件

- **Typography**: 更高级的排版组件，支持更多样式变体
- **Card**: 卡片容器，常与 Text 组件配合使用
- **Column/Row**: 布局组件，用于排列多个 Text 元素
