export { A2UIRenderer } from "./A2UIRenderer";
export { useA2UIValue } from "./hooks/useA2UIValue";
export { useA2UIInteraction, getDeviceCapabilities } from "./hooks/useA2UIInteraction";
export type { UseA2UIInteractionOptions, UseA2UIInteractionReturn } from "./hooks/useA2UIInteraction";
export { ensureProcessorEventEmitter } from "./utils/processorEvents";
export { ComponentRenderer } from "./components/ComponentRenderer";
export { A2UIProvider, useA2UIEnvironment } from "./context/A2UIProvider";
export { NamespaceProvider, useNamespace } from "./context/NamespaceContext";
export { getSurfaceSnapshot } from "./ssr/getSurfaceSnapshot";
export type { ComponentPlugin, ComponentRegistryPluginContext } from "./catalog/plugins";
export { createPluginRegistry, defineComponentPlugin } from "./catalog/plugins";
export {
  valueString,
  valueNumber,
  valueBoolean,
  valueMap,
  valueMapToObject,
} from "./utils/valueMap";
export { buildUserAction, emitUserAction } from "./utils/userAction";
export { resolveBoundValue, resolveActionContext, normalizeResolved } from "./utils/resolveValue";
export * from "./types";
export type { SurfaceSnapshot } from "./A2UIRenderer";

// 全局 Registry API (推荐使用)
export { componentRegistry, DEFAULT_NAMESPACE } from "./catalog/ComponentRegistry";
export type { NamespaceConfig } from "./catalog/ComponentRegistry";

// 旧的 Catalog API (已废弃，仅用于兼容)
export { ComponentCatalog } from "./catalog/ComponentCatalog";
export { getDefaultCatalog, DEFAULT_CATALOG_ID } from "./catalog/defaultCatalog";
export { CatalogProvider, useCatalog } from "./context/CatalogContext";
export type { ComponentPluginContext } from "./catalog/plugins";

// Note: Import @a2ui-web/lit-core directly instead of re-exporting
// import * as v0_8 from "@a2ui-web/lit-core";

