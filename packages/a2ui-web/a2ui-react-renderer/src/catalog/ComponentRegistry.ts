/**
 * A2UI React 渲染器的全局组件注册表 (单例模式)
 * 支持命名空间,用于多租户/微前端等场景
 *
 * 核心概念:
 * - 默认命名空间 ('default'): 包含所有内置组件 (Typography、Column、Row、ShadcnButton)
 * - 自定义命名空间: 应用可以创建自己的命名空间,自动继承 default 命名空间
 * - Fallback 链: customNamespace → default namespace
 *
 * @example
 * // 注册到默认命名空间
 * componentRegistry.register('MyComponent', MyComponent)
 *
 * @example
 * // 注册到自定义命名空间
 * componentRegistry.register('Navbar', TenantANavbar, 'tenant-a')
 * componentRegistry.register('Navbar', TenantBNavbar, 'tenant-b')
 *
 * @example
 * // 使用插件批量注册
 * const navbarPlugin = defineComponentPlugin('Navbar', MyNavbar)
 * componentRegistry.use(navbarPlugin, 'my-app')
 */

import type React from "react";
import type { A2UIComponentProps } from "../types";
import type { ComponentPlugin } from "./plugins";

export const DEFAULT_NAMESPACE = "default";

/**
 * 命名空间配置
 */
export interface NamespaceConfig {
  /**
   * 是否启用自动 fallback 到 default 命名空间
   * @default true
   */
  autoFallback?: boolean;
  /**
   * 自定义 fallback 命名空间 (默认为 'default')
   */
  fallbackNamespace?: string;
}

/**
 * 全局组件注册表 (单例模式)
 */
class ComponentRegistry {
  private static instance: ComponentRegistry | null = null;

  // 存储所有命名空间的组件映射: namespace → (componentName → Component)
  private namespaces = new Map<
    string,
    Map<string, React.ComponentType<A2UIComponentProps>>
  >();

  // 存储命名空间配置: namespace → config
  private namespaceConfigs = new Map<string, NamespaceConfig>();

  // 存储已应用的插件: namespace → plugins[]
  private namespacePlugins = new Map<string, ComponentPlugin[]>();

  private constructor() {
    // 初始化默认命名空间
    this.initDefaultNamespace();
  }

  /**
   * 获取全局单例实例
   */
  static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }

  /**
   * 初始化默认命名空间,注册所有内置组件
   */
  private initDefaultNamespace(): void {
    const defaultMap = new Map<
      string,
      React.ComponentType<A2UIComponentProps>
    >();
    this.namespaces.set(DEFAULT_NAMESPACE, defaultMap);

    // 配置默认命名空间 (不需要 fallback)
    this.namespaceConfigs.set(DEFAULT_NAMESPACE, {
      autoFallback: false,
    });

    // 注意: 内置组件的导入延迟到 registerBuiltins() 方法
    // 避免循环依赖问题
  }

  /**
   * 注册内置组件 (延迟导入)
   * 由 defaultCatalog.ts 调用,在模块初始化时执行
   */
  registerBuiltins(
    builtins: Array<[string, React.ComponentType<A2UIComponentProps>]>
  ): void {
    const defaultMap = this.namespaces.get(DEFAULT_NAMESPACE);
    if (!defaultMap) {
      throw new Error("Default namespace not initialized");
    }

    for (const [name, component] of builtins) {
      defaultMap.set(name, component);
    }
  }

  /**
   * 创建或配置命名空间
   */
  createNamespace(
    namespace: string,
    config: NamespaceConfig = {}
  ): void {
    if (namespace === DEFAULT_NAMESPACE) {
      throw new Error(
        `Cannot create namespace "${DEFAULT_NAMESPACE}": reserved for built-in components`
      );
    }

    if (!this.namespaces.has(namespace)) {
      this.namespaces.set(
        namespace,
        new Map<string, React.ComponentType<A2UIComponentProps>>()
      );
    }

    // 合并配置 (默认启用 autoFallback)
    const existingConfig = this.namespaceConfigs.get(namespace) || {};
    this.namespaceConfigs.set(namespace, {
      autoFallback: true,
      fallbackNamespace: DEFAULT_NAMESPACE,
      ...existingConfig,
      ...config,
    });
  }

  /**
   * 注册组件到指定命名空间
   */
  register(
    name: string,
    component: React.ComponentType<A2UIComponentProps>,
    namespace: string = DEFAULT_NAMESPACE
  ): void {
    // 如果命名空间不存在,自动创建
    if (!this.namespaces.has(namespace)) {
      this.createNamespace(namespace);
    }

    const namespaceMap = this.namespaces.get(namespace);
    if (!namespaceMap) {
      throw new Error(`Namespace "${namespace}" not found`);
    }

    namespaceMap.set(name, component);
  }

  /**
   * 从指定命名空间获取组件 (支持自动 fallback)
   */
  get(
    name: string,
    namespace: string = DEFAULT_NAMESPACE
  ): React.ComponentType<A2UIComponentProps> | undefined {
    // 1. 先从指定命名空间查找
    const namespaceMap = this.namespaces.get(namespace);
    if (namespaceMap) {
      const component = namespaceMap.get(name);
      if (component) {
        return component;
      }
    }

    // 2. 如果找不到且启用了 autoFallback,从 fallback 命名空间查找
    const config = this.namespaceConfigs.get(namespace);
    if (config?.autoFallback && config.fallbackNamespace) {
      if (config.fallbackNamespace !== namespace) {
        // 递归查找 (支持多级 fallback)
        return this.get(name, config.fallbackNamespace);
      }
    }

    return undefined;
  }

  /**
   * 检查组件是否存在于指定命名空间 (支持自动 fallback)
   */
  has(name: string, namespace: string = DEFAULT_NAMESPACE): boolean {
    return this.get(name, namespace) !== undefined;
  }

  /**
   * 获取指定命名空间的所有已注册组件名称 (包括 fallback)
   */
  getRegisteredComponents(namespace: string = DEFAULT_NAMESPACE): string[] {
    const components = new Set<string>();

    // 1. 添加当前命名空间的组件
    const namespaceMap = this.namespaces.get(namespace);
    if (namespaceMap) {
      for (const name of namespaceMap.keys()) {
        components.add(name);
      }
    }

    // 2. 添加 fallback 命名空间的组件
    const config = this.namespaceConfigs.get(namespace);
    if (config?.autoFallback && config.fallbackNamespace) {
      if (config.fallbackNamespace !== namespace) {
        const fallbackComponents = this.getRegisteredComponents(
          config.fallbackNamespace
        );
        for (const name of fallbackComponents) {
          components.add(name);
        }
      }
    }

    return Array.from(components);
  }

  /**
   * 批量注册组件 (插件模式)
   */
  use(plugin: ComponentPlugin, namespace: string = DEFAULT_NAMESPACE): void {
    // 如果命名空间不存在,自动创建
    if (!this.namespaces.has(namespace)) {
      this.createNamespace(namespace);
    }

    // 记录插件
    if (!this.namespacePlugins.has(namespace)) {
      this.namespacePlugins.set(namespace, []);
    }
    this.namespacePlugins.get(namespace)!.push(plugin);

    // 执行插件
    plugin({
      register: (name, component) => this.register(name, component, namespace),
      has: (name) => this.has(name, namespace),
      get: (name) => this.get(name, namespace),
      getRegisteredComponents: () => this.getRegisteredComponents(namespace),
      namespace,
    });
  }

  /**
   * 获取所有命名空间列表
   */
  getNamespaces(): string[] {
    return Array.from(this.namespaces.keys());
  }

  /**
   * 重置注册表 (仅用于测试)
   */
  reset(): void {
    this.namespaces.clear();
    this.namespaceConfigs.clear();
    this.namespacePlugins.clear();
    this.initDefaultNamespace();
  }

  /**
   * 重置指定命名空间 (仅用于测试)
   */
  resetNamespace(namespace: string): void {
    if (namespace === DEFAULT_NAMESPACE) {
      throw new Error(
        `Cannot reset namespace "${DEFAULT_NAMESPACE}": use reset() instead`
      );
    }

    this.namespaces.delete(namespace);
    this.namespaceConfigs.delete(namespace);
    this.namespacePlugins.delete(namespace);
  }
}

/**
 * 全局组件注册表实例
 *
 * @example
 * // 注册组件到默认命名空间
 * import { componentRegistry } from '@a2ui-web/a2ui-react-renderer'
 * componentRegistry.register('MyComponent', MyComponent)
 *
 * @example
 * // 注册组件到自定义命名空间
 * componentRegistry.register('Navbar', TenantANavbar, 'tenant-a')
 *
 * @example
 * // 使用插件
 * const navbarPlugin = defineComponentPlugin('Navbar', MyNavbar)
 * componentRegistry.use(navbarPlugin, 'my-app')
 */
export const componentRegistry = ComponentRegistry.getInstance();
