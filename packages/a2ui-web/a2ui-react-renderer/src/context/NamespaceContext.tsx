/**
 * Namespace Context - 提供命名空间给子组件
 * 用于从全局 componentRegistry 获取组件
 */
'use client'

import { createContext, useContext, type ReactNode } from 'react'
import { DEFAULT_NAMESPACE } from '../catalog/ComponentRegistry'

interface NamespaceContextValue {
  namespace: string
}

const NamespaceContext = createContext<NamespaceContextValue | null>(null)

export function NamespaceProvider({
  namespace,
  children,
}: {
  namespace?: string
  children: ReactNode
}) {
  const value = {
    namespace: namespace ?? DEFAULT_NAMESPACE,
  }

  return (
    <NamespaceContext.Provider value={value}>
      {children}
    </NamespaceContext.Provider>
  )
}

/**
 * 获取当前命名空间
 */
export function useNamespace(): string {
  const context = useContext(NamespaceContext)
  return context?.namespace ?? DEFAULT_NAMESPACE
}
