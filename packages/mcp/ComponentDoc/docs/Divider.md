# Divider Component

A2UI 分割线组件，用于在视觉上分隔内容区域。

## 组件名称
`Divider`

## 命名空间
`a2ui-test.web`

## 属性 (Props)

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `orientation` | `BoundValue<string>` | `"horizontal"` | 分割线方向：`"horizontal"` 或 `"vertical"` |
| `decorative` | `BoundValue<boolean>` | `true` | 是否为装饰性元素（影响无障碍属性） |
| `className` | `BoundValue<string>` | `""` | 自定义 CSS 类名 |
| `weight` | `number` | - | flex 布局权重 |

## orientation 选项

| 值 | 描述 |
|---|------|
| `horizontal` | 水平分割线（默认），适用于垂直堆叠的内容 |
| `vertical` | 垂直分割线，适用于水平排列的内容 |

## 使用示例

### 基础水平分割线
```json
{
  "id": "divider1",
  "component": {
    "Divider": {}
  }
}
```

### 垂直分割线
```json
{
  "id": "divider_vertical",
  "component": {
    "Divider": {
      "orientation": {
        "literalString": "vertical"
      }
    }
  }
}
```

### 非装饰性分割线
```json
{
  "id": "divider_semantic",
  "component": {
    "Divider": {
      "decorative": {
        "literalBoolean": false
      }
    }
  }
}
```

## 完整示例：内容分组

### 垂直布局（水平分割线）
```json
{
  "surfaceUpdate": {
    "surfaceId": "content",
    "components": [
      {
        "id": "root",
        "component": {
          "Column": {
            "children": {
              "explicitList": ["section1", "divider", "section2"]
            }
          }
        }
      },
      {
        "id": "section1",
        "component": {
          "Text": {
            "text": {
              "literalString": "第一部分内容"
            },
            "usageHint": {
              "literalString": "body"
            }
          }
        }
      },
      {
        "id": "divider",
        "component": {
          "Divider": {
            "orientation": {
              "literalString": "horizontal"
            }
          }
        }
      },
      {
        "id": "section2",
        "component": {
          "Text": {
            "text": {
              "literalString": "第二部分内容"
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

### 水平布局（垂直分割线）
```json
{
  "surfaceUpdate": {
    "surfaceId": "nav",
    "components": [
      {
        "id": "root",
        "component": {
          "Row": {
            "children": {
              "explicitList": ["item1", "divider", "item2"]
            }
          }
        }
      },
      {
        "id": "item1",
        "component": {
          "Text": {
            "text": {
              "literalString": "首页"
            }
          }
        }
      },
      {
        "id": "divider",
        "component": {
          "Divider": {
            "orientation": {
              "literalString": "vertical"
            }
          }
        }
      },
      {
        "id": "item2",
        "component": {
          "Text": {
            "text": {
              "literalString": "关于"
            }
          }
        }
      }
    ]
  }
}
```

### 卡片内分割
```json
{
  "surfaceUpdate": {
    "surfaceId": "profile_card",
    "components": [
      {
        "id": "root",
        "component": {
          "Card": {
            "child": "content"
          }
        }
      },
      {
        "id": "content",
        "component": {
          "Column": {
            "children": {
              "explicitList": ["header", "divider", "body"]
            }
          }
        }
      },
      {
        "id": "header",
        "component": {
          "Text": {
            "text": {
              "literalString": "用户信息"
            },
            "usageHint": {
              "literalString": "h3"
            }
          }
        }
      },
      {
        "id": "divider",
        "component": {
          "Divider": {}
        }
      },
      {
        "id": "body",
        "component": {
          "Text": {
            "text": {
              "literalString": "姓名：张三"
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

1. **方向选择**:
   - 在 `Column` 中使用 `horizontal` (水平线)
   - 在 `Row` 中使用 `vertical` (垂直线)

2. **装饰性属性**:
   - `decorative: true` (默认): 仅用于视觉装饰，屏幕阅读器会忽略
   - `decorative: false`: 语义化分隔符，屏幕阅读器会读取

3. **垂直分割线高度**:
   - 垂直分割线默认自动适应父容器高度
   - 确保父容器有明确的高度

4. **间距控制**:
   - Divider 自身不添加间距
   - 使用 Column/Row 的 spacing 属性或在兄弟组件上添加 margin

## 样式定制

分割线使用 shadcn/ui Separator 组件，默认样式：
- 颜色：`border-border`
- 粗细：1px
- 支持暗色模式

自定义样式示例：
```json
{
  "id": "custom_divider",
  "component": {
    "Divider": {
      "className": {
        "literalString": "bg-primary h-0.5"
      }
    }
  }
}
```

## 相关组件

- **Card**: 卡片组件，常与 Divider 配合使用分隔内容区域
- **Column**: 垂直布局，使用 horizontal Divider
- **Row**: 水平布局，使用 vertical Divider
- **Text**: 文本组件，常与 Divider 配合使用分隔文本内容
