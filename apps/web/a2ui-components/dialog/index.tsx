/**
 * A2UI Dialog Component
 * 基于 shadcn/ui Dialog 的 A2UI 协议适配器
 *
 * 支持的属性:
 * - trigger: 触发器组件 ID
 * - content: 内容组件 ID
 * - title: 对话框标题
 * - description: 对话框描述
 * - className: 自定义样式类
 */

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@a2ui-web/shadcn-ui/components/dialog'
import { cn } from '@a2ui-web/shadcn-ui/lib/utils'
import type { A2UIComponentProps } from '@a2ui-web/a2ui-react-renderer'
import { useA2UIValue } from '@a2ui-web/a2ui-react-renderer'
import { ComponentRenderer } from '@a2ui-web/a2ui-react-renderer/components/ComponentRenderer'

type RenderNode = React.ComponentProps<typeof ComponentRenderer>['node']

export function A2UIDialog(props: A2UIComponentProps) {
  const { component, processor, surfaceId, emitUserAction } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // 解析数据绑定值
  const title = useA2UIValue<string>(
    componentProps.title,
    '',
    processor,
    component,
    surfaceId
  )

  const description = useA2UIValue<string>(
    componentProps.description,
    '',
    processor,
    component,
    surfaceId
  )

  const className = useA2UIValue<string>(
    componentProps.className,
    '',
    processor,
    component,
    surfaceId
  )

  // 获取触发器和内容组件
  const triggerNode = componentProps.trigger as RenderNode | undefined
  const contentNode = componentProps.content as RenderNode | undefined

  // 样式对象（仅用于 weight 属性）
  const styles: React.CSSProperties = {}
  if (component.weight !== undefined) {
    styles.flex = component.weight
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div style={styles} data-component-id={`${component.id}-trigger`}>
          {triggerNode && (
            <ComponentRenderer
              node={triggerNode}
              processor={processor}
              surfaceId={surfaceId}
              emitUserAction={emitUserAction}
            />
          )}
        </div>
      </DialogTrigger>
      <DialogContent className={cn(className)} data-component-id={component.id}>
        {(title || description) && (
          <DialogHeader>
            {title && <DialogTitle>{title}</DialogTitle>}
            {description && <DialogDescription>{description}</DialogDescription>}
          </DialogHeader>
        )}
        {contentNode && (
          <ComponentRenderer
            node={contentNode}
            processor={processor}
            surfaceId={surfaceId}
            emitUserAction={emitUserAction}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
