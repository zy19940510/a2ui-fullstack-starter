/**
 * A2UI React 渲染器的组件注册表
 * 将组件类型名称映射到 React 组件实现
 * 支持 fallback catalog 链式查找
 */

import type React from "react";
import type { A2UIComponentProps } from "../types";
import type { ComponentPlugin } from "./plugins";

export class ComponentCatalog {
  private catalog = new Map<string, React.ComponentType<A2UIComponentProps>>();
  private fallback?: ComponentCatalog;

  constructor(fallback?: ComponentCatalog) {
    this.fallback = fallback;
  }

  register(
    name: string,
    component: React.ComponentType<A2UIComponentProps>
  ): void {
    this.catalog.set(name, component);
  }

  get(name: string): React.ComponentType<A2UIComponentProps> | undefined {
    // 先在当前 catalog 查找
    const component = this.catalog.get(name);
    if (component) {
      return component;
    }
    // 如果找不到且有 fallback，在 fallback 中查找
    if (this.fallback) {
      return this.fallback.get(name);
    }
    return undefined;
  }

  has(name: string): boolean {
    return this.catalog.has(name) || (this.fallback?.has(name) ?? false);
  }

  getRegisteredComponents(): string[] {
    const components = Array.from(this.catalog.keys());
    if (this.fallback) {
      // 合并 fallback 的组件，但去重（当前 catalog 的组件优先）
      const fallbackComponents = this.fallback.getRegisteredComponents();
      for (const name of fallbackComponents) {
        if (!this.catalog.has(name)) {
          components.push(name);
        }
      }
    }
    return components;
  }

  /**
   * 以插件形式批量注册组件，插件可以访问注册表提供的能力
   */
  use(plugin: ComponentPlugin): void {
    plugin({
      catalog: this,
      register: this.register.bind(this),
      has: this.has.bind(this),
      get: this.get.bind(this),
      getRegisteredComponents: this.getRegisteredComponents.bind(this),
    });
  }
}
