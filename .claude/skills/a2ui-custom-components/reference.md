# A2UI 自定义组件参考

## 完整的 getValue() 实现

A2UIBase 中 getValue 方法的完整实现：

```typescript
protected getValue(
  prop: unknown,
  defaultValue: string | number | boolean = ""
): string | number | boolean {
  if (prop === null || prop === undefined) return defaultValue;

  if (typeof prop === "object" && prop !== null) {
    const obj = prop as Record<string, unknown>;

    // 1. 处理字面量值（在组件定义中直接赋值）
    if ("literalString" in obj) return obj.literalString as string;
    if ("literalNumber" in obj) return obj.literalNumber as number;
    if ("literalBoolean" in obj) return obj.literalBoolean as boolean;

    // 2. 处理路径引用 - 通过 processor 解析
    if ("path" in obj && typeof obj.path === "string") {
      if (!this.processor || !this.component) {
        console.warn(
          `${this.tagName}: processor or component not available for path resolution`,
          obj.path
        );
        return defaultValue;
      }

      // 调用 processor.getData() 解析路径
      const value = this.processor.getData(
        this.component,
        obj.path,
        this.surfaceId ?? "default"
      );

      if (value !== null && value !== undefined) {
        // 解析后的值可能是 ValueMap 对象或原始值
        if (typeof value === "object" && value !== null) {
          const valueObj = value as Record<string, unknown>;
          if ("valueString" in valueObj) return valueObj.valueString as string;
          if ("valueNumber" in valueObj) return valueObj.valueNumber as number;
          if ("valueBoolean" in valueObj) return valueObj.valueBoolean as boolean;
        }
        // 如果是原始值，直接返回
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          return value;
        }
      }
      return defaultValue;
    }

    // 3. 处理 ValueMap 格式（已从路径引用解析）
    if ("valueString" in obj) return obj.valueString as string;
    if ("valueNumber" in obj) return obj.valueNumber as number;
    if ("valueBoolean" in obj) return obj.valueBoolean as boolean;
  }

  // 4. 如果已经是原始值，直接返回
  if (
    typeof prop === "string" ||
    typeof prop === "number" ||
    typeof prop === "boolean"
  ) {
    return prop;
  }

  return defaultValue;
}
```

## 完整的 A2UIBase 类

```typescript
import { LitElement } from "lit";
import { property } from "lit/decorators.js";
import type { v0_8 } from "@a2ui/lit";

export class A2UIBase extends LitElement {
  // A2UI 核心属性 - 自动从 A2UI 接收
  @property({ attribute: false })
  declare processor: v0_8.Data.A2uiMessageProcessor | null;

  @property({ attribute: false })
  declare component: v0_8.Types.AnyComponentNode | null;

  @property({ attribute: false })
  declare surfaceId: string | null;

  protected getValue(
    prop: unknown,
    defaultValue: string | number | boolean = ""
  ): string | number | boolean {
    // 参见上面的完整实现
  }
}
```

## 消息结构参考

### ValueMap 格式

```typescript
interface ValueMap {
  key: string;
  valueString?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
}

// 辅助函数
const valueString = (key: string, valueString: string): ValueMap => ({
  key,
  valueString,
});

const valueNumber = (key: string, valueNumber: number): ValueMap => ({
  key,
  valueNumber,
});

const valueBoolean = (key: string, valueBoolean: boolean): ValueMap => ({
  key,
  valueBoolean,
});
```

### 组件属性值

```typescript
// 1. 字面量值
{
  myProp: { literalString: "value" }
  myProp: { literalNumber: 123 }
  myProp: { literalBoolean: true }
}

// 2. 路径引用
{
  myProp: { path: "data_key" }  // 通过 processor.getData() 解析
  myProp: { path: "/nested/path" }
}

// 3. ValueMap（已解析）
{
  myProp: { valueString: "value" }
  myProp: { valueNumber: 123 }
  myProp: { valueBoolean: true }
}
```

## 源代码位置

### @a2ui/lit 中的关键文件

```
node_modules/@a2ui/lit/dist/src/0.8/
├── ui/
│   ├── root.js                  # 核心渲染引擎
│   │   └── Lines 200-216:       # 自定义组件属性传递
│   │   └── Lines 217-350:       # 标准组件渲染
│   ├── text.js                  # 标准 Text 组件
│   │   └── Lines 116-124:       # 路径引用解析示例
│   ├── component-registry.js    # 组件注册
│   └── custom-components/
│       └── index.js            # 自定义组件工具
├── data/
│   └── model-processor.js      # A2uiMessageProcessor 实现
│       └── getData() method    # 路径解析逻辑
└── types/
    └── types.d.ts              # TypeScript 定义
```

### 关键源代码部分

#### 1. 自定义组件渲染 (root.js:200-216)

```javascript
// A2UI 如何创建并传递 props 给自定义组件
const node = component;
const el = new elCtor();
el.id = node.id;
if (node.slotName) {
  el.slot = node.slotName;
}
el.component = node;              // ← 传递组件节点
el.weight = node.weight ?? "initial";
el.processor = this.processor;    // ← 传递 processor
el.surfaceId = this.surfaceId;    // ← 传递 surfaceId
el.dataContextPath = node.dataContextPath ?? "/";

// 直接传递所有属性（不进行自动路径解析！）
for (const [prop, val] of Object.entries(component.properties)) {
  // @ts-expect-error We're off the books.
  el[prop] = val;  // ← 原样传递 {path: "xxx"}
}
return html`${el}`;
```

**关键洞察**：属性按原样传递。自定义组件必须手动解析 `{path: "xxx"}`。

#### 2. 路径解析示例 (text.js:116-124)

```javascript
// 标准 Text 组件手动解析路径
else if (this.text && "path" in this.text && this.text.path) {
  if (!this.processor || !this.component) {
    return html`(no model)`;
  }
  const value = this.processor.getData(
    this.component,
    this.text.path,
    this.surfaceId ?? A2uiMessageProcessor.DEFAULT_SURFACE_ID
  );
  if (value !== null && value !== undefined) {
    textValue = value.toString();
  }
}
```

**模式**：检查 `path` 属性，然后调用 `processor.getData()`。

## 组件注册详情

### 注册

```typescript
import * as UI from "@a2ui/lit/ui";

// 基本注册
UI.componentRegistry.register(
  "ComponentName",   // JSON 消息中使用的类型名称
  ComponentClass,    // 组件类
  "tag-name"        // 可选：HTML 标签名
);

// 示例
UI.componentRegistry.register("StatCard", StatCard, "a2ui-stat-card");
```

### 注册工作原理

```typescript
// ComponentRegistry 类（简化版）
class ComponentRegistry {
  private registry = new Map();

  register(typeName: string, constructor: any, tagName?: string) {
    this.registry.set(typeName, constructor);
    if (tagName && constructor.constructor) {
      // 如果尚未完成，自动注册到 customElements
    }
  }

  get(typeName: string) {
    return this.registry.get(typeName);
  }
}
```

## 自定义元素注册

### @customElement 装饰器

```typescript
@customElement("a2ui-my-component")
export class MyComponent extends LitElement {
  // ...
}

// 等同于：
customElements.define("a2ui-my-component", MyComponent);
```

### 副作用导入

```typescript
// 在 a2ui-root-provider.ts 中
import "./custom-surface";  // ← 执行该文件

// custom-surface.ts 被执行，运行：
@customElement("custom-a2ui-surface")  // ← 注册元素
export class CustomSurface extends LitElement { ... }
```

## 数据上下文路径

### 路径解析

```typescript
// 绝对路径
{ path: "/users/0/name" }  // 从根开始

// 相对路径（在 List 模板中）
{ path: "name" }  // 相对于当前项

// dataContextPath 影响解析
el.dataContextPath = "/users/0";
// 然后路径 "name" 解析为 "/users/0/name"
```

### 在 List 组件中

```typescript
{
  List: {
    children: {
      template: {
        // 在模板内部，路径相对于列表项
        Text: {
          text: { path: "name" }  // 解析为 /items/0/name, /items/1/name 等
        }
      }
    }
  }
}
```

## 性能优化

### Lit 响应式更新

```typescript
// Lit 只在 @property 值改变时重新渲染
@property({ attribute: false })
declare myProp: unknown;

// 变更检测是自动的
this.myProp = newValue;  // 触发更新
```

### 优化 render()

```typescript
// ❌ 避免在 render() 中进行昂贵操作
render() {
  const data = this.expensiveComputation();  // 每次渲染都会调用！
  return html`<div>${data}</div>`;
}

// ✅ 使用 willUpdate() 进行预处理
willUpdate(changedProperties) {
  if (changedProperties.has('rawData')) {
    this._processedData = this.expensiveComputation();
  }
}

render() {
  return html`<div>${this._processedData}</div>`;
}
```

### 记忆化

```typescript
private _cachedValue: string | null = null;
private _lastProp: unknown = null;

render() {
  if (this.myProp !== this._lastProp) {
    this._cachedValue = String(this.getValue(this.myProp, ""));
    this._lastProp = this.myProp;
  }
  return html`<div>${this._cachedValue}</div>`;
}
```

## 测试策略

### 单元测试

```typescript
import { fixture, html } from '@open-wc/testing';
import './my-component';

describe('MyComponent', () => {
  it('renders with path reference', async () => {
    const mockProcessor = {
      getData: (component, path, surfaceId) => {
        if (path === 'test_label') {
          return { valueString: 'Test Label' };
        }
      }
    };

    const el = await fixture(html`
      <a2ui-my-component
        .processor=${mockProcessor}
        .component=${{ id: 'test' }}
        .surfaceId=${'test-surface'}
        .label=${{ path: 'test_label' }}
      ></a2ui-my-component>
    `);

    expect(el.shadowRoot.textContent).to.include('Test Label');
  });
});
```

### 集成测试

```typescript
// 测试完整的消息流
it('updates when data model changes', async () => {
  const processor = new A2uiMessageProcessor();

  // 发送消息
  processor.processMessage({ surfaceUpdate: { ... } });
  processor.processMessage({ dataModelUpdate: { contents: [...] } });
  processor.processMessage({ beginRendering: { ... } });

  await nextFrame();

  // 验证组件反映数据模型
  const component = document.querySelector('a2ui-my-component');
  expect(component.shadowRoot.textContent).to.include('Expected Value');
});
```

## 高级模式

### 计算属性

```typescript
render() {
  const value = Number(this.getValue(this.value, 0));
  const max = Number(this.getValue(this.max, 100));

  // 计算
  const percentage = (value / max) * 100;
  const displayValue = `${value} / ${max} (${percentage.toFixed(1)}%)`;

  return html`<div>${displayValue}</div>`;
}
```

### 条件渲染

```typescript
render() {
  const status = String(this.getValue(this.status, ""));

  return html`
    <div class="card">
      ${status === "success"
        ? html`<span class="success">✓ Success</span>`
        : status === "error"
        ? html`<span class="error">✗ Error</span>`
        : html`<span class="pending">⟳ Pending</span>`
      }
    </div>
  `;
}
```

### 事件处理

```typescript
render() {
  return html`
    <button @click=${this._handleClick}>
      点击我
    </button>
  `;
}

private _handleClick(e: Event) {
  // 为 A2UI 分发自定义事件
  this.dispatchEvent(new CustomEvent('action', {
    detail: { action: 'button_clicked' },
    bubbles: true,
    composed: true
  }));
}
```

## 故障排除调试模式

### 启用日志

```typescript
protected getValue(prop: unknown, defaultValue: any): any {
  console.log(`[${this.tagName}] getValue:`, prop);

  // ... rest of implementation

  if ("path" in obj) {
    console.log(`  Resolving path: ${obj.path}`);
    const value = this.processor.getData(...);
    console.log(`  Resolved to:`, value);
    return value;
  }
}
```

### 检查 Processor 可用性

```typescript
connectedCallback() {
  super.connectedCallback();
  console.log('Processor:', this.processor);
  console.log('Component:', this.component);
  console.log('SurfaceId:', this.surfaceId);
}
```

### 检查数据模型

```typescript
// 在浏览器控制台中
const processor = document.querySelector('a2ui-root-provider').processor;
const surface = processor.getSurfaces().get('your-surface-id');
console.log('数据模型:', surface.dataModel);
```
