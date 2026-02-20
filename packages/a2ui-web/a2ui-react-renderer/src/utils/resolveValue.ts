/**
 * Utilities for resolving A2UI BoundValue types to actual values
 * Used by both hooks (useA2UIValue) and event handlers (action context resolution)
 */
import type * as v0_8 from "@a2ui-web/lit-core";

/**
 * Normalize values returned from processor.getData()
 * Handles valueString/valueNumber/valueBoolean wrapper objects
 */
export function normalizeResolved<T>(resolved: T): T {
  if (typeof resolved === "object" && resolved !== null) {
    const vObj = resolved as Record<string, unknown>;
    if ("valueString" in vObj) return vObj.valueString as T;
    if ("valueNumber" in vObj) return vObj.valueNumber as T;
    if ("valueBoolean" in vObj) return vObj.valueBoolean as T;
  }
  return resolved;
}

/**
 * Resolve a BoundValue to its actual value
 * Handles:
 * - Literal values: { literalString: "value" } | { literalNumber: 42 } | { literalBoolean: true }
 * - Path references: { path: "/data/path" }
 * - Direct primitive values: string | number | boolean
 * - ValueMap format: { valueString: "value" } | { valueNumber: 42 } | { valueBoolean: true }
 */
export function resolveBoundValue<T = unknown>(
  prop: unknown,
  processor: InstanceType<typeof v0_8.Data.A2uiMessageProcessor>,
  component: v0_8.Types.AnyComponentNode,
  surfaceId: string,
  defaultValue?: T
): T | undefined {
  if (prop === null || prop === undefined) {
    return defaultValue;
  }

  // Handle primitive values (string path references or direct values)
  if (typeof prop === "number" || typeof prop === "boolean") {
    return prop as T;
  }

  if (typeof prop === "string") {
    // Try to resolve as a path
    const resolved = processor.getData(component, prop, surfaceId);
    if (resolved !== null && resolved !== undefined) {
      return normalizeResolved(resolved) as T;
    }
    // If resolution fails, treat as literal string
    return prop as T;
  }

  // Handle object-wrapped values
  if (typeof prop === "object") {
    const obj = prop as Record<string, unknown>;

    // Handle literal values
    if ("literalString" in obj) return obj.literalString as T;
    if ("literalNumber" in obj) return obj.literalNumber as T;
    if ("literalBoolean" in obj) return obj.literalBoolean as T;

    // Handle path references
    if ("path" in obj && typeof obj.path === "string") {
      const resolved = processor.getData(component, obj.path, surfaceId);
      if (resolved !== null && resolved !== undefined) {
        return normalizeResolved(resolved) as T;
      }
      return defaultValue;
    }

    // Handle direct ValueMap format (already resolved)
    if ("valueString" in obj) return obj.valueString as T;
    if ("valueNumber" in obj) return obj.valueNumber as T;
    if ("valueBoolean" in obj) return obj.valueBoolean as T;
  }

  return defaultValue;
}

/**
 * Resolve an action context object
 * Converts action.context array to a Record<string, unknown>
 */
export function resolveActionContext(
  action: {
    name: string;
    context?: Array<{ key: string; value: unknown }>;
  },
  processor: InstanceType<typeof v0_8.Data.A2uiMessageProcessor>,
  component: v0_8.Types.AnyComponentNode,
  surfaceId: string
): Record<string, unknown> {
  const context: Record<string, unknown> = {};

  if (!action.context) {
    return context;
  }

  for (const entry of action.context) {
    const resolvedValue = resolveBoundValue(
      entry.value,
      processor,
      component,
      surfaceId
    );
    if (resolvedValue !== undefined) {
      context[entry.key] = resolvedValue;
    }
  }

  return context;
}
