/**
 * A2UI Card Component
 * 基于 shadcn/ui Card 的 A2UI 协议适配器
 *
 * 支持的属性:
 * - child: 单个子组件 ID
 * - children: 多个子组件（explicitList 或 template）
 * - className: 自定义样式类
 */

import * as React from 'react'
import { Card } from '@a2ui-web/shadcn-ui/components/card'
import { cn } from '@a2ui-web/shadcn-ui/lib/utils'
import type { A2UIComponentProps } from '@a2ui-web/a2ui-react-renderer'
import { useA2UIValue } from '@a2ui-web/a2ui-react-renderer'
import { ComponentRenderer } from '@a2ui-web/a2ui-react-renderer/components/ComponentRenderer'

type RenderNode = React.ComponentProps<typeof ComponentRenderer>['node']

export function A2UICard(props: A2UIComponentProps) {
  const { component, processor, surfaceId, emitUserAction } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // 解析 className
  const className = useA2UIValue<string>(
    componentProps.className,
    '',
    processor,
    component,
    surfaceId
  )

  // 获取子组件
  const childNode = componentProps.child as RenderNode | undefined
  const childrenNodes = componentProps.children as RenderNode[] | undefined

  // 合并 child 和 children
  const allChildren: RenderNode[] = []
  if (childNode) {
    allChildren.push(childNode)
  }
  if (Array.isArray(childrenNodes)) {
    allChildren.push(...childrenNodes)
  }

  // 样式对象（仅用于 weight 属性）
  const styles: React.CSSProperties = {}
  if (component.weight !== undefined) {
    styles.flex = component.weight
  }

  return (
    <Card
      className={cn('p-6', className)}
      style={styles}
      data-component-id={component.id}
    >
      <div className="flex flex-col gap-4">
        {allChildren.map((child) => (
          <ComponentRenderer
            key={child.id}
            node={child}
            processor={processor}
            surfaceId={surfaceId}
            emitUserAction={emitUserAction}
          />
        ))}
      </div>
    </Card>
  )
}
