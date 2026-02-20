/* eslint-disable react-hooks/set-state-in-effect */
/**
 * A2UI React 主渲染器
 * 事件驱动（无轮询）
 * React 17+ 兼容（使用 useSyncExternalStore shim）
 *
 * 使用全局 componentRegistry 获取组件，支持命名空间
 */
'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useSyncExternalStore } from 'use-sync-external-store/shim'
import type * as v0_8 from '@a2ui-web/lit-core'
import { DEFAULT_NAMESPACE } from './catalog/ComponentRegistry'
import { ComponentRenderer } from './components/ComponentRenderer'
import { NamespaceProvider } from './context/NamespaceContext'
import { useA2UIEnvironment } from './context/A2UIProvider'
import type { UserActionMessage } from './types'
import { ensureProcessorEventEmitter } from './utils/processorEvents'

interface A2UIRendererProps {
  processor?: InstanceType<typeof v0_8.Data.A2uiMessageProcessor>
  surfaceId: string
  /**
   * 命名空间 - 用于从全局 componentRegistry 获取组件
   * @default 'default'
   */
  namespace?: string
  onUserAction?: (message: UserActionMessage) => void
  onSurfaceMissing?: (surfaceId: string) => void
  /**
   * 方式1：initialMessages - 初始化消息（适用于 SSR 和纯客户端）
   *
   * 使用场景：
   * - ✅ 纯客户端应用（CSR）：消息只在客户端处理一次，推荐使用
   * - ✅ SSR 应用：消息在服务端和客户端各处理一次（有一定性能开销）
   *
   * 适用宿主：
   * - Create React App, Vite, Electron, SPA, React Native WebView
   * - Next.js (简单场景)
   *
   * 示例：
   * ```typescript
   * // 纯客户端
   * <A2UIRenderer
   *   surfaceId="my-surface"
   *   initialMessages={createMessages()}
   * />
   *
   * // Next.js 页面
   * function Page() {
   *   return (
   *     <A2UIRenderer
   *       surfaceId="navbar"
   *       initialMessages={createNavbarMessages()}
   *     />
   *   )
   * }
   * ```
   */
  initialMessages?: Array<any>
  /**
   * 方式2：initialSnapshot - 用于性能优化的 SSR（预计算，仅 Next.js）
   *
   * ⚠️ 注意：此参数仅适用于 Next.js SSR，不适用于纯客户端应用
   *
   * 使用场景：
   * - ✅ Next.js + getServerSideProps/getStaticProps
   * - ✅ 需要从 API/数据库获取数据构建 UI
   * - ✅ 关注首屏性能，避免重复处理
   *
   * 优势：
   * - 消息只在服务端处理一次（客户端直接使用预计算结果）
   * - 可以在数据获取阶段就构建 UI
   *
   * 示例：
   * ```typescript
   * // pages/dashboard.tsx
   * export async function getServerSideProps({ req }) {
   *   // 1. 获取数据
   *   const data = await fetchUserData(req.session.userId)
   *
   *   // 2. 处理消息
   *   const processor = new A2uiMessageProcessor()
   *   processor.processMessages(createMessages(data))
   *
   *   // 3. 提取 snapshot
   *   const surface = processor.getSurfaces().get(surfaceId)
   *   return {
   *     props: {
   *       initialSnapshot: {
   *         tree: surface?.componentTree ?? null,
   *         version: surface?.components.size ?? 0,
   *         exists: !!surface
   *       }
   *     }
   *   }
   * }
   *
   * function Dashboard({ initialSnapshot }) {
   *   return (
   *     <A2UIRenderer
   *       surfaceId="dashboard"
   *       initialSnapshot={initialSnapshot}
   *     />
   *   )
   * }
   * ```
   */
  initialSnapshot?: SurfaceSnapshot
}

export type SurfaceSnapshot = {
  tree: v0_8.Types.AnyComponentNode | null
  version: number
  exists: boolean
}

export function A2UIRenderer({
  processor,
  surfaceId,
  namespace,
  onUserAction,
  onSurfaceMissing,
  initialMessages,
  initialSnapshot,
}: A2UIRendererProps) {
  const env = useA2UIEnvironment()
  const effectiveProcessor = processor ?? env?.processor
  const effectiveNamespace = namespace ?? env?.namespace ?? DEFAULT_NAMESPACE

  // 处理初始消息（SSR + 首次客户端渲染）
  // 注意：这会在服务端和客户端各执行一次（不可避免，因为是两个独立的渲染过程）
  // 如果需要避免重复处理以提升性能，请使用 initialSnapshot + getServerSideProps
  useMemo(() => {
    if (initialMessages && initialMessages.length > 0) {
      effectiveProcessor.processMessages(initialMessages)
    }
  }, [effectiveProcessor, initialMessages])

  const lastTreeRef = useRef<v0_8.Types.AnyComponentNode | null>(null)

  if (!effectiveProcessor) {
    throw new Error('A2UIRenderer 需要 processor（来自 props 或 A2UIProvider）')
  }

  const emitter = useMemo(() => ensureProcessorEventEmitter(effectiveProcessor), [effectiveProcessor])
  const snapshotRef = useRef<SurfaceSnapshot | null>(null)

  const computeSnapshot = useCallback(() => {
    const surface = effectiveProcessor.getSurfaces().get(surfaceId)
    const next = {
      tree: surface?.componentTree ?? null,
      version: surface?.components.size ?? 0,
      exists: !!surface,
    }
    const prev = snapshotRef.current
    if (
      prev &&
      prev.tree === next.tree &&
      prev.version === next.version &&
      prev.exists === next.exists
    ) {
      return prev
    }
    snapshotRef.current = next
    return next
  }, [effectiveProcessor, surfaceId])

  const snapshot = useSyncExternalStore(
    emitter.subscribe,
    computeSnapshot,
    // SSR 时使用 initialSnapshot（如果提供）或计算新的 snapshot
    () => {
      if (initialSnapshot) {
        snapshotRef.current = initialSnapshot
        return initialSnapshot
      }
      return snapshotRef.current ?? computeSnapshot()
    },
  )

  const emitUserAction = useCallback(
    (message: UserActionMessage) => {
      onUserAction?.(message)
    },
    [onUserAction],
  )

  useEffect(() => {
    if (!snapshot.exists && lastTreeRef.current) {
      onSurfaceMissing?.(surfaceId)
    }
    lastTreeRef.current = snapshot.tree
  }, [snapshot.exists, snapshot.tree, onSurfaceMissing, surfaceId])

  if (!snapshot.tree) {
    return (
      <div style={{ padding: '20px', color: '#666' }}>Surface {surfaceId} 没有可用的组件树</div>
    )
  }

  return (
    <NamespaceProvider namespace={effectiveNamespace}>
      <ComponentRenderer
        node={snapshot.tree}
        processor={effectiveProcessor}
        surfaceId={surfaceId}
        emitUserAction={emitUserAction}
      />
    </NamespaceProvider>
  )
}
