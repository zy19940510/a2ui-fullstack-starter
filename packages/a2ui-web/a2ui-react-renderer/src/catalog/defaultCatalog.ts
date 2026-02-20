import type React from "react";
import { A2UITypography, A2UIShadcnButton } from "../a2ui-components/shadcnui";
import { Column, Row } from "../a2ui-components/layout";
import { A2UIIcon } from "../a2ui-components/icon";
import type { A2UIComponentProps } from "../types";
import { ComponentCatalog } from "./ComponentCatalog";
import { componentRegistry } from "./ComponentRegistry";

/**
 * 内置默认组件目录
 * 包含 a2ui-react-renderer 提供的所有内置组件
 *
 * 内置组件分为两类：
 * 1. 基础布局组件：Typography、Column、Row
 * 2. shadcn/ui 自定义组件：ShadcnButton（未来可能有 ShadcnCard、ShadcnInput 等）
 *
 * 注意：
 * - 内置组件自动注册到全局 ComponentRegistry 的 'default' 命名空间
 * - 应用层特定的组件（如 Navbar）应该注册到自定义命名空间
 *
 * @deprecated getDefaultCatalog() 已废弃，建议直接使用 componentRegistry
 */

export const DEFAULT_CATALOG_ID = "a2ui.org:default_react_catalog_0_1_0";

let cached: ComponentCatalog | null = null;

const defaultComponents: Array<
  [string, React.ComponentType<A2UIComponentProps>]
> = [
  // 基础布局组件
  ["Typography", A2UITypography],
  ["Column", Column],
  ["Row", Row],

  // shadcn/ui 自定义组件（a2ui-react-renderer 内置）
  ["ShadcnButton", A2UIShadcnButton],

  // 标准图标组件
  ["Icon", A2UIIcon],
];

// 在模块加载时自动注册内置组件到全局 Registry
componentRegistry.registerBuiltins(defaultComponents);

/**
 * 获取默认组件目录 (ComponentCatalog)
 * @deprecated 建议使用全局 componentRegistry 替代
 * import { componentRegistry } from '@a2ui-web/a2ui-react-renderer'
 * const component = componentRegistry.get('Typography')
 */
export function getDefaultCatalog(): ComponentCatalog {
  if (cached) return cached;
  const catalog = new ComponentCatalog();
  for (const [name, component] of defaultComponents) {
    catalog.register(name, component);
  }
  cached = catalog;
  return catalog;
}
