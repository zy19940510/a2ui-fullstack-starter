/**
 * 为 A2uiMessageProcessor 注入一个极简事件系统，用于替代轮询。
 * 包装 processMessages/clearSurfaces/setData 后触发通知。
 */
import type * as v0_8 from "@a2ui-web/lit-core";

type Processor = InstanceType<typeof v0_8.Data.A2uiMessageProcessor>;

type Emitter = {
  subscribe: (fn: () => void) => () => void;
  notify: () => void;
};

const emitterMap = new WeakMap<Processor, Emitter>();

class SimpleEmitter implements Emitter {
  private listeners = new Set<() => void>();

  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };

  notify = () => {
    const schedule =
      typeof globalThis.queueMicrotask === "function"
        ? globalThis.queueMicrotask.bind(globalThis)
        : (fn: () => void) => Promise.resolve().then(fn);
    schedule(() => {
      for (const fn of this.listeners) {
        fn();
      }
    });
  };
}

export function ensureProcessorEventEmitter(processor: Processor): Emitter {
  const existing = emitterMap.get(processor);
  if (existing) return existing;

  const target = new SimpleEmitter();
  const processorAny = processor as unknown as Record<string, unknown>;

  const patchKeys: Array<keyof Processor> = [
    "processMessages",
    "clearSurfaces",
    "setData",
  ];

  for (const key of patchKeys) {
    const original = processorAny[key as string] as
      | ((...args: unknown[]) => unknown)
      | undefined;
    if (typeof original !== "function") continue;
    const wrapped = (...args: unknown[]) => {
      const result = original.apply(processor, args);
      target.notify();
      return result;
    };
    processorAny[key as string] = wrapped;
  }

  const emitter: Emitter = {
    subscribe: target.subscribe,
    notify: target.notify,
  };
  emitterMap.set(processor, emitter);
  return emitter;
}
