/**
 * 插件式组件注册入口
 * 允许业务方在单个入口中批量注册组件，并获得 catalog/registry 能力
 */
import type React from "react";
import type { ComponentCatalog } from "./ComponentCatalog";
import type { A2UIComponentProps } from "../types";

/**
 * 组件插件上下文 (用于 ComponentCatalog)
 * @deprecated 建议使用 ComponentRegistry 和 ComponentRegistryPluginContext
 */
export type ComponentPluginContext = {
  catalog: ComponentCatalog;
  register: ComponentCatalog["register"];
  has: ComponentCatalog["has"];
  get: ComponentCatalog["get"];
  getRegisteredComponents: ComponentCatalog["getRegisteredComponents"];
};

/**
 * 组件插件上下文 (用于 ComponentRegistry)
 */
export type ComponentRegistryPluginContext = {
  /**
   * 注册组件到当前命名空间
   */
  register: (
    name: string,
    component: React.ComponentType<A2UIComponentProps>
  ) => void;
  /**
   * 检查组件是否存在 (支持 fallback)
   */
  has: (name: string) => boolean;
  /**
   * 获取组件 (支持 fallback)
   */
  get: (
    name: string
  ) => React.ComponentType<A2UIComponentProps> | undefined;
  /**
   * 获取所有已注册组件名称 (包括 fallback)
   */
  getRegisteredComponents: () => string[];
  /**
   * 当前命名空间
   */
  namespace: string;
};

/**
 * 组件插件 (兼容 ComponentCatalog 和 ComponentRegistry)
 */
export type ComponentPlugin = (
  ctx: ComponentPluginContext | ComponentRegistryPluginContext
) => void;

export function createPluginRegistry(plugins: ComponentPlugin[]): ComponentPlugin {
  return (ctx) => {
    for (const plugin of plugins) {
      plugin(ctx);
    }
  };
}

/**
 * 辅助创建单组件插件
 */
export function defineComponentPlugin(
  name: string,
  component: React.ComponentType<A2UIComponentProps>
): ComponentPlugin {
  return ({ register }) => register(name, component);
}
