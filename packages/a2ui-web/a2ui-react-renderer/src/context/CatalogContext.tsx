/**
 * 组件目录上下文
 */
'use client'

import { createContext, useContext } from 'react'
import type { ComponentCatalog } from '../catalog/ComponentCatalog'

const CatalogContext = createContext<ComponentCatalog | null>(null)

export function CatalogProvider({
  catalog,
  children,
}: {
  catalog: ComponentCatalog
  children: React.ReactNode
}) {
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>
}

export function useCatalog(): ComponentCatalog {
  const catalogFromProvider = useContext(CatalogContext)
  if (catalogFromProvider) return catalogFromProvider
  throw new Error('useCatalog 必须在 CatalogProvider 内部使用')
}
