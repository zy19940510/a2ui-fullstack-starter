'use client'

import { useMemo, useCallback } from 'react'
import { A2UIProvider } from '@a2ui-web/a2ui-react-renderer'
import * as v0_8 from '@a2ui-web/lit-core'

// 导入组件注册（确保组件被注册）
import '../lib/customCatalog'

export function Providers({ children }: { children: React.ReactNode }) {
  // 创建 A2UI processor 实例（只创建一次）
  const processor = useMemo(() => {
    const p = new v0_8.Data.A2uiMessageProcessor()
    console.log('[A2UIProvider] Processor created')
    return p
  }, [])

  return <A2UIProvider value={{ processor }}>{children}</A2UIProvider>
}
