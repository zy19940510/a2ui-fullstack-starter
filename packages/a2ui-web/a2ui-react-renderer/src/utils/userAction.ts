/**
 * 组件内部触发 userAction 的小工具，避免重复拼装消息
 */
import type { UserActionMessage } from "../types";

export type UserActionParams = {
  name: string;
  surfaceId: string;
  componentId: string;
  context?: Record<string, unknown>;
  timestamp?: string;
};

export function buildUserAction({
  name,
  surfaceId,
  componentId,
  context,
  timestamp,
}: UserActionParams): UserActionMessage {
  return {
    userAction: {
      name,
      surfaceId,
      sourceComponentId: componentId,
      timestamp: timestamp ?? new Date().toISOString(),
      context: context && Object.keys(context).length ? context : undefined,
    },
  };
}

export function emitUserAction(
  emit: ((message: UserActionMessage) => void) | undefined,
  params: UserActionParams
): void {
  if (!emit) return;
  emit(buildUserAction(params));
}
