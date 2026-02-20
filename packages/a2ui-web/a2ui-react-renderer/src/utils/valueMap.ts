/**
 * 构造 A2UI ValueMap 的便捷函数
 * 供消息/组件创建时复用，避免各处重复定义
 */
import type * as v0_8 from "@a2ui-web/lit-core";

export type ValueMapEntry = v0_8.Types.ValueMap;

export const valueString = (key: string, valueString: string): ValueMapEntry => ({
  key,
  valueString,
});

export const valueNumber = (key: string, valueNumber: number): ValueMapEntry => ({
  key,
  valueNumber,
});

export const valueBoolean = (key: string, valueBoolean: boolean): ValueMapEntry => ({
  key,
  valueBoolean,
});

export const valueMap = (key: string, valueMap: ValueMapEntry[]): ValueMapEntry => ({
  key,
  valueMap,
});

/**
 * 将 ValueMap 数组解析成普通对象（仅用于简单展示/调试场景）
 */
export function valueMapToObject(map: ValueMapEntry[] | undefined): unknown {
  if (!Array.isArray(map)) return map;
  const result: Record<string, unknown> = {};
  for (const entry of map) {
    if (!entry?.key) continue;
    if ("valueMap" in entry && Array.isArray(entry.valueMap)) {
      result[entry.key] = valueMapToObject(entry.valueMap);
    } else if ("valueString" in entry) {
      result[entry.key] = entry.valueString;
    } else if ("valueNumber" in entry) {
      result[entry.key] = entry.valueNumber;
    } else if ("valueBoolean" in entry) {
      result[entry.key] = entry.valueBoolean;
    }
  }
  return result;
}
