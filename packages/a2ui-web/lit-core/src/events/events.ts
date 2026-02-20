/*
 Copyright 2025 Google LLC

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

import type * as A2UI from "./a2ui.js";
import { BaseEventDetail } from "./base.js";

// SSR-safe CustomEvent shim
const SafeCustomEvent: typeof CustomEvent = (() => {
  if (typeof CustomEvent !== 'undefined') {
    return CustomEvent;
  }

  // Minimal shim for SSR environments
  return class CustomEventShim<T = any> {
    type: string;
    detail: T;
    bubbles: boolean;
    cancelable: boolean;
    composed: boolean;

    constructor(type: string, eventInitDict?: CustomEventInit<T>) {
      this.type = type;
      this.detail = eventInitDict?.detail as T;
      this.bubbles = eventInitDict?.bubbles ?? false;
      this.cancelable = eventInitDict?.cancelable ?? false;
      this.composed = (eventInitDict as any)?.composed ?? false;
    }
  } as any;
})();

const eventInit = {
  bubbles: true,
  cancelable: true,
  composed: true,
};

type EnforceEventTypeMatch<T extends Record<string, BaseEventDetail<string>>> =
  {
    [K in keyof T]: T[K] extends BaseEventDetail<infer EventType>
      ? EventType extends K
        ? T[K]
        : never
      : never;
  };

export type StateEventDetailMap = EnforceEventTypeMatch<{
  "a2ui.action": A2UI.A2UIAction;
}>;

export class StateEvent<
  T extends keyof StateEventDetailMap
> extends SafeCustomEvent<StateEventDetailMap[T]> {
  static eventName = "a2uiaction";

  constructor(readonly payload: StateEventDetailMap[T]) {
    super(StateEvent.eventName, { detail: payload, ...eventInit });
  }
}

declare global {
  interface HTMLElementEventMap {
    a2uiaction: StateEvent<"a2ui.action">;
  }
}
