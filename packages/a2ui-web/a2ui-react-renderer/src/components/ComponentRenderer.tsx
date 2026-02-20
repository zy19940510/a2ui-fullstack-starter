/**
 * 组件渲染器：从全局 componentRegistry 动态获取并渲染组件
 */
'use client'

import type * as v0_8 from '@a2ui-web/lit-core'
import type React from 'react'
import { memo, useMemo } from 'react'
import { componentRegistry } from '../catalog/ComponentRegistry'
import { useNamespace } from '../context/NamespaceContext'

interface ComponentRendererProps {
  node: v0_8.Types.AnyComponentNode
  processor: InstanceType<typeof v0_8.Data.A2uiMessageProcessor>
  surfaceId: string
  emitUserAction?: (message: {
    userAction: {
      name: string
      surfaceId: string
      sourceComponentId: string
      timestamp: string
      context?: Record<string, unknown>
    }
  }) => void
}

const ComponentRendererBase = ({
  node,
  processor,
  surfaceId,
  emitUserAction,
}: ComponentRendererProps) => {
  const namespace = useNamespace()
  const componentType = node.type

  // 从全局 Registry 获取组件
  const Component = useMemo(
    () => componentRegistry.get(componentType, namespace),
    [componentType, namespace]
  )

  if (!Component) {
    const availableComponents = componentRegistry.getRegisteredComponents(namespace)
    console.warn(
      `未知组件类型：${componentType} (命名空间: ${namespace}). 可用组件：${availableComponents.join(', ')}`,
    )
    return (
      <div style={{ color: 'red', border: '1px solid red', padding: '8px' }}>
        未知组件：{componentType} (namespace: {namespace})
      </div>
    )
  }

  return (
    <Component
      component={node}
      processor={processor}
      surfaceId={surfaceId}
      emitUserAction={emitUserAction}
    />
  )
}

export const ComponentRenderer = memo(
  ComponentRendererBase,
  (prev: ComponentRendererProps, next: ComponentRendererProps) =>
    prev.node === next.node &&
    prev.processor === next.processor &&
    prev.surfaceId === next.surfaceId &&
    prev.emitUserAction === next.emitUserAction,
)
