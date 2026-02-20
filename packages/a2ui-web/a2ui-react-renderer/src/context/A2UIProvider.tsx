/**
 * A2UI 全局环境 Provider，提供 processor / namespace / 事件回调
 * 支持原生 React 组件与 A2UIRenderer 混用
 */
'use client'

import type * as v0_8 from '@a2ui-web/lit-core'
import { createContext, useContext } from 'react'

export type A2UIEnvironment = {
  processor: InstanceType<typeof v0_8.Data.A2uiMessageProcessor>
  /**
   * 默认命名空间
   */
  namespace?: string
}

const A2UIContext = createContext<A2UIEnvironment | null>(null)

export function A2UIProvider({
  value,
  children,
}: { value: A2UIEnvironment; children: React.ReactNode }) {
  return <A2UIContext.Provider value={value}>{children}</A2UIContext.Provider>
}

export function useA2UIEnvironment(): A2UIEnvironment {
  const ctx = useContext(A2UIContext)
  if (!ctx) {
    throw new Error('useA2UIEnvironment 必须在 A2UIProvider 内使用')
  }
  return ctx
}
