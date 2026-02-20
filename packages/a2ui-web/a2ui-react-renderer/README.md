# @a2ui-web/a2ui-react-renderer

A2UI 0.8 React 渲染器（事件驱动，无轮询）。提供基础渲染器、数据绑定 Hook、processor 事件注入、组件目录上下文等能力，组件实现可由业务自定义。

## 安装
工作区引用（已在 client package.json 中使用 `workspace:*`）。单独安装：
```bash
bun add @a2ui-web/a2ui-react-renderer
```

Peer 依赖：`@a2ui/lit@^0.8.1`、`react@^19`。

## 快速使用
```tsx
import { v0_8 } from "@a2ui/lit";
import {
  A2UIRenderer,
  ComponentCatalog,
  useA2UIValue,
  ensureProcessorEventEmitter,
} from "@a2ui-web/a2ui-react-renderer";

const processor = new v0_8.Data.A2uiMessageProcessor();
processor.processMessages([
  { surfaceUpdate: { surfaceId: "demo", components: [/* ... */] } },
  { dataModelUpdate: { surfaceId: "demo", path: "/", contents: [/* ... */] } },
  { beginRendering: { surfaceId: "demo", root: "root", catalogId: "a2ui.org:standard_catalog_0_8_0" } },
]);

const catalog = new ComponentCatalog();
// catalog.register("MyComponent", MyComponent);

<A2UIRenderer
  processor={processor}
  surfaceId="demo"
  catalog={catalog}
  catalogById={{ "a2ui.org:standard_catalog_0_8_0": catalog }}
/>;
```

## 特性
- 事件驱动：包装 `processMessages/clearSurfaces/setData`，`useSyncExternalStore` 订阅，无轮询。
- 数据绑定：`useA2UIValue` 解析字面量/路径/ValueMap。
- 目录与上下文：`ComponentCatalog` + `CatalogProvider/useCatalog`。
- 可扩展：组件实现可由业务包（如 `@a2ui-web/custom-ui`）注册。

## 注意
- 仅提供渲染基础设施，不含具体 UI 组件。请在业务层注册组件并传入 catalog。
- 如果直接操作 processor 内部状态，请手动触发 `ensureProcessorEventEmitter(processor).notify()` 以刷新订阅。

## A2UI 数据/渲染要点（0.8）

### 数据模型合并规则
- `dataModelUpdate` 默认是“在指定 path 下写入这些 key”，同一路径按顺序覆盖（last-write-wins）。
- Map 节点更新推荐使用**叶子路径 + `key: '.'`** 写值，例如 `/messages/123` + `[{ key: '.', valueString: 'hello' }]`，这样不会重建父级 Map，不会影响兄弟字段。（来自上游 0.8 测试用例）
- 如果对某个 Map 路径（如 `/navbar`）发送只有局部字段的 contents，会重建该 Map，未提供的兄弟字段会丢失。避免用顶层路径做局部更新。
- `getData`/`setData` 支持相对路径；`'.'` 指向当前节点的数据上下文。

### SSR 与初始快照
- `A2UIRenderer` 支持传入 `initialSnapshot`（来自服务端 `getSurfaceSnapshot(processor, surfaceId)`），可避免首屏空白/闪动。
- SSR 时要用与客户端一致的 processor 和消息流（`surfaceUpdate` + `dataModelUpdate` + `beginRendering`），并在服务端调用 `processMessages` 后生成 snapshot 传给页面。
- 客户端 hydration 后仍复用同一 processor；`ensureProcessorEventEmitter` 会包装 `processMessages/setData`，`useSyncExternalStore` 订阅变更。
- 对需要 SSR 的绑定值，组件应在渲染时同步解析（`useA2UIValue` 现已在初始 render 就解析 `getData`），不要只在 effect 里解析，否则首屏会用默认值。

### 常见场景提示
- 局部数据更新（如切换语言）应指向具体叶子路径，例如 `/navbar/locale` + `key: '.'`，避免覆盖同级的 navAlign/navItems 等。
- 若必须对 Map 做整体替换（`path: '/navbar'`），请携带该 Map 下的全部必要字段。
- 调试数据时，可用 `valueMapToObject` 把 ValueMap 转成对象查看。
