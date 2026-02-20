/**
 * 用于解析 A2UI BoundValue 到实际值的 Hook
 * 处理字面量值、路径引用和 ValueMap 格式
 */
"use client";

import type * as v0_8 from "@a2ui-web/lit-core";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ensureProcessorEventEmitter } from "../utils/processorEvents";
import { normalizeResolved } from "../utils/resolveValue";

export function useA2UIValue<T = string | number | boolean>(
  prop: unknown,
  defaultValue: T,
  processor: InstanceType<typeof v0_8.Data.A2uiMessageProcessor>,
  component: v0_8.Types.AnyComponentNode,
  surfaceId: string
): T {
  const defaultRef = useRef(defaultValue);
  const stableDefault = defaultRef.current;
  const resolveNow = useCallback((): T => {
    if (prop === null || prop === undefined) {
      return stableDefault;
    }

    if (typeof prop === "number" || typeof prop === "boolean" || typeof prop === "string") {
      if (typeof prop === "string") {
        const resolved = processor.getData(component, prop, surfaceId);
        if (resolved !== null && resolved !== undefined) {
          return normalizeResolved(resolved as T);
        }
      }
      return prop as T;
    }

    if (typeof prop === "object") {
      const obj = prop as Record<string, unknown>;
      if ("literalString" in obj) return obj.literalString as T;
      if ("literalNumber" in obj) return obj.literalNumber as T;
      if ("literalBoolean" in obj) return obj.literalBoolean as T;

      if ("path" in obj && typeof obj.path === "string") {
        const resolved = processor.getData(component, obj.path as string, surfaceId);
        if (resolved !== null && resolved !== undefined) {
          return normalizeResolved(resolved as T);
        }
        return stableDefault;
      }

      if ("valueString" in obj) return obj.valueString as T;
      if ("valueNumber" in obj) return obj.valueNumber as T;
      if ("valueBoolean" in obj) return obj.valueBoolean as T;
    }

    return stableDefault;
  }, [prop, processor, component, surfaceId, stableDefault]);

  const [value, setValue] = useState<T>(resolveNow);
  const emitter = useMemo(
    () => ensureProcessorEventEmitter(processor),
    [processor]
  );

  useEffect(() => {
    const resolveValue = () => setValue(resolveNow());

    setValue(resolveNow());
    const unsubscribe = emitter.subscribe(resolveValue);
    return () => unsubscribe();
  }, [resolveNow, emitter]);

  return value;
}
