/**
 * A2UI React 渲染器类型定义
 */
import type * as v0_8 from "@a2ui-web/lit-core";

// 本地定义 BoundValue 联合类型（A2UI 0.8 未导出）
export type BoundValue =
  | { literalString: string }
  | { literalNumber: number }
  | { literalBoolean: boolean }
  | { path: string }
  | { valueString: string }
  | { valueNumber: number }
  | { valueBoolean: boolean };

export interface A2UIComponentProps {
  component: v0_8.Types.AnyComponentNode;
  processor: InstanceType<typeof v0_8.Data.A2uiMessageProcessor>;
  surfaceId: string;
  weight?: string | number;
  emitUserAction?: (message: UserActionMessage) => void;
}

export interface UserActionMessage {
  userAction: {
    name: string;
    surfaceId: string;
    sourceComponentId: string;
    timestamp: string;
    context?: Record<string, unknown>;
  };
}

export interface ActionContextEntry {
  key: string;
  value: BoundValue;
}
