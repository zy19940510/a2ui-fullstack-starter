# A2UI 自定义组件示例

## 示例 1：简单的进度条组件

带有标签和颜色的进度条的完整实现。

```typescript
// src/app/components/progress-bar.ts
import { html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { A2UIBase } from "./a2ui-base";

@customElement("a2ui-progress-bar")
export class ProgressBar extends A2UIBase {
  @property({ attribute: false })
  declare value: unknown;  // 0-100

  @property({ attribute: false })
  declare label: unknown;

  @property({ attribute: false })
  declare color: unknown;

  static styles = css`
    :host {
      display: block;
    }
    .progress-container {
      width: 100%;
      background: #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    .progress-bar {
      height: 24px;
      transition: width 0.3s ease;
    }
    .progress-label {
      margin-bottom: 8px;
      font-weight: 600;
    }
  `;

  render() {
    const value = Number(this.getValue(this.value, 0));
    const label = String(this.getValue(this.label, ""));
    const color = String(this.getValue(this.color, "#3b82f6"));

    return html`
      <div>
        <div class="progress-label">${label}</div>
        <div class="progress-container">
          <div
            class="progress-bar"
            style="width: ${value}%; background-color: ${color};"
          ></div>
        </div>
      </div>
    `;
  }
}
```

**注册：**
```typescript
UI.componentRegistry.register("ProgressBar", ProgressBar);
```

**数据模型：**
```typescript
const data = [
  valueString("progress_label", "完成度"),
  valueNumber("progress_value", 75),
  valueString("progress_color", "#10b981"),
];
```

**在消息中的使用：**
```typescript
{
  component: {
    ProgressBar: {
      label: { path: "progress_label" },
      value: { path: "progress_value" },
      color: { path: "progress_color" },
    }
  }
}
```

## 示例 2：带格式化的统计卡片

带有数字格式化和趋势指示器的卡片组件。

```typescript
@customElement("a2ui-stat-card")
export class StatCard extends A2UIBase {
  @property({ attribute: false })
  declare label: unknown;

  @property({ attribute: false })
  declare value: unknown;

  @property({ attribute: false })
  declare change: unknown;

  @property({ attribute: false })
  declare trend: unknown;

  private formatNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  private getTrendArrow(trend: string): string {
    switch (trend) {
      case "up": return "↗";
      case "down": return "↘";
      default: return "→";
    }
  }

  render() {
    const labelValue = String(this.getValue(this.label, ""));
    const valueNum = Number(this.getValue(this.value, 0));
    const changeNum = Number(this.getValue(this.change, 0));
    const trendValue = String(this.getValue(this.trend, "neutral"));

    return html`
      <div class="stat-card">
        <div class="label">${labelValue}</div>
        <div class="value">${this.formatNumber(valueNum)}</div>
        <div class="change ${trendValue}">
          <span>${this.getTrendArrow(trendValue)}</span>
          ${Math.abs(changeNum)}%
        </div>
      </div>
    `;
  }
}
```

## 示例 3：带变体的徽章

```typescript
@customElement("a2ui-custom-badge")
export class CustomBadge extends A2UIBase {
  @property({ attribute: false })
  declare text: unknown;

  @property({ attribute: false })
  declare variant: unknown;

  static styles = css`
    .badge {
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 700;
    }
    .badge.primary {
      background: linear-gradient(135deg, #f97316, #ea580c);
      color: white;
    }
    .badge.success {
      background: #10b981;
      color: white;
    }
  `;

  render() {
    const textValue = String(this.getValue(this.text, ""));
    const variantValue = String(this.getValue(this.variant, "primary"));

    return html`
      <span class="badge ${variantValue}">
        ${textValue}
      </span>
    `;
  }
}
```

## 示例 4：混合路径引用和字面量

```typescript
const messages = [
  {
    surfaceUpdate: {
      components: [{
        id: "user-card",
        component: {
          Card: {
            // 混合路径引用和字面量
            title: { path: "user_name" },        // 动态
            subtitle: { literalString: "用户" },  // 静态
            badge: { path: "user_status" },      // 动态
            icon: { literalString: "👤" },       // 静态
          }
        }
      }]
    }
  },
  {
    dataModelUpdate: {
      contents: [
        valueString("user_name", "张三"),
        valueString("user_status", "在线"),
      ]
    }
  },
  {
    beginRendering: { ... }
  }
];
```

## 示例 5：验证和错误处理

```typescript
render() {
  const value = this.getValue(this.value, 0);

  // 验证输入
  if (typeof value !== 'number' || isNaN(value)) {
    console.warn(`Invalid value for ${this.tagName}:`, this.value);
    return html`<div class="error">无效数据</div>`;
  }

  if (value < 0 || value > 100) {
    return html`<div class="error">值必须在 0-100 之间</div>`;
  }

  return html`<div class="progress" style="width: ${value}%"></div>`;
}
```

## 完整示例：包含多个组件的仪表板

```typescript
// 数据模型
const dashboardData = [
  // 用户统计
  valueString("users_label", "活跃用户"),
  valueNumber("users_value", 12450),
  valueNumber("users_change", 8.3),
  valueString("users_trend", "up"),

  // 收入统计
  valueString("revenue_label", "月收入"),
  valueNumber("revenue_value", 892400),
  valueNumber("revenue_change", 15.2),
  valueString("revenue_trend", "up"),

  // 进度
  valueString("progress_label", "项目进度"),
  valueNumber("progress_value", 75),
  valueString("progress_color", "#10b981"),

  // 徽章
  valueString("badge1_text", "新功能"),
  valueString("badge1_variant", "primary"),
];

// 消息
export const dashboardMessages = [
  // 步骤 1：结构
  {
    surfaceUpdate: {
      surfaceId: "dashboard",
      components: [
        {
          id: "root",
          component: {
            Column: {
              children: { explicitList: ["stats-row", "progress", "badges"] }
            }
          }
        },
        {
          id: "stats-row",
          component: {
            Row: {
              children: { explicitList: ["stat-users", "stat-revenue"] }
            }
          }
        },
        {
          id: "stat-users",
          component: {
            StatCard: {
              label: { path: "users_label" },
              value: { path: "users_value" },
              change: { path: "users_change" },
              trend: { path: "users_trend" },
            }
          }
        },
        {
          id: "stat-revenue",
          component: {
            StatCard: {
              label: { path: "revenue_label" },
              value: { path: "revenue_value" },
              change: { path: "revenue_change" },
              trend: { path: "revenue_trend" },
            }
          }
        },
        {
          id: "progress",
          component: {
            ProgressBar: {
              label: { path: "progress_label" },
              value: { path: "progress_value" },
              color: { path: "progress_color" },
            }
          }
        },
        {
          id: "badges",
          component: {
            Row: {
              children: { explicitList: ["badge1"] }
            }
          }
        },
        {
          id: "badge1",
          component: {
            CustomBadge: {
              text: { path: "badge1_text" },
              variant: { path: "badge1_variant" },
            }
          }
        },
      ]
    }
  },

  // 步骤 2：数据
  {
    dataModelUpdate: {
      surfaceId: "dashboard",
      path: "/",
      contents: dashboardData,
    }
  },

  // 步骤 3：渲染
  {
    beginRendering: {
      surfaceId: "dashboard",
      root: "root",
    }
  }
];
```
