/**
 * A2UI Button Component - Base Implementation
 * 基于 shadcn/ui Button 的 A2UI 协议适配器
 *
 * 这是一个轻量级的基础组件，负责：
 * 1. A2UI 协议到 React props 的转换
 * 2. 事件处理（action）
 * 3. 数据绑定（useA2UIValue）
 * 4. 支持自定义变体扩展（customVariants）
 *
 * 基础样式由 shadcn/ui Button 提供，业务主题通过 customVariants 扩展
 */

import * as React from 'react'
import { Button, buttonVariants } from '@a2ui-web/shadcn-ui/components/button'
import type { VariantProps } from 'class-variance-authority'
import { cn } from '@a2ui-web/shadcn-ui/lib/utils'
import type { A2UIComponentProps } from '@a2ui-web/a2ui-react-renderer'
import { useA2UIValue, useA2UIInteraction } from '@a2ui-web/a2ui-react-renderer'
import { ComponentRenderer } from '@a2ui-web/a2ui-react-renderer/components/ComponentRenderer'
import { emitUserAction as emitAction } from '@a2ui-web/a2ui-react-renderer/utils/userAction'
import { resolveActionContext } from '@a2ui-web/a2ui-react-renderer/utils/resolveValue'

// 从 shadcn-ui buttonVariants 推断类型
type ButtonVariantProps = VariantProps<typeof buttonVariants>

// 自定义变体函数类型
export type CustomButtonVariants = typeof buttonVariants

/**
 * A2UIShadcnButton - 符合 A2UI 0.8 协议的基础按钮组件
 *
 * 支持的 variant（shadcn/ui 标准）:
 * - default: 主按钮
 * - destructive: 危险操作按钮
 * - outline: 描边按钮
 * - secondary: 次要按钮
 * - ghost: 幽灵按钮（透明背景）
 * - link: 链接样式按钮
 *
 * 支持的 size:
 * - default: 默认尺寸 (h-9)
 * - sm: 小尺寸 (h-8)
 * - lg: 大尺寸 (h-10)
 * - icon: 图标按钮 (size-9)
 * - icon-sm: 小图标按钮 (size-8)
 * - icon-lg: 大图标按钮 (size-10)
 *
 * A2UI 协议支持:
 * - child: 子组件 ID（支持嵌套组件）
 * - action: 用户操作定义
 * - variant: 按钮语义变体（literalString）
 * - size: 按钮尺寸（literalString）
 * - disabled: 禁用状态（literalBoolean）
 * - className: 自定义样式类（literalString）
 * - weight: flex 权重（number）
 *
 * 扩展支持:
 * - customVariants: 自定义变体函数，用于业务主题扩展（替换 buttonVariants）
 * - asChild: 使用 Slot 渲染
 */
export function A2UIShadcnButton(
  props: A2UIComponentProps & {
    customVariants?: CustomButtonVariants
    asChild?: boolean
  }
) {
  const { component, processor, surfaceId, emitUserAction, customVariants, asChild } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // 解析数据绑定值
  const variant = useA2UIValue<string>(
    componentProps.variant,
    'default',
    processor,
    component,
    surfaceId
  )

  const size = useA2UIValue<ButtonVariantProps['size']>(
    componentProps.size,
    'default',
    processor,
    component,
    surfaceId
  )

  const disabled = useA2UIValue<boolean>(
    componentProps.disabled,
    false,
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

  // child 属性已经被 processor 解析为 AnyComponentNode
  const childNode = componentProps.child as any

  // 处理 action（A2UI 0.8 协议）
  const action = componentProps.action as
    | {
        name: string
        context?: Array<{ key: string; value: any }>
      }
    | undefined

  // 使用统一的多设备交互 Hook
  const { interactionProps, eventType } = useA2UIInteraction({
    onInteract: React.useCallback(
      () => {
        if (!action || !emitUserAction) return

        // 解析上下文
        const context = resolveActionContext(action, processor, component, surfaceId)

        // 发送用户操作消息
        emitAction(emitUserAction, {
          name: action.name,
          surfaceId,
          componentId: component.id,
          context,
        })
      },
      [action, surfaceId, component, processor, emitUserAction]
    ),
    disabled,
    preventDefault: true,
    primaryOnly: true,
  })

  // 样式对象（仅用于 weight 属性）
  const styles: React.CSSProperties = {}

  if (component.weight !== undefined) {
    styles.flex = component.weight
  }

  // 根据是否提供 customVariants 决定如何传递 props
  // 1. 有 customVariants：手动组合 className（用于业务主题扩展）
  //    关键：传递 variant={null} 阻止 Button 内部应用默认 variant 样式
  // 2. 无 customVariants：直接传递 variant/size 给 Button（shadcn 标准）
  const buttonProps = customVariants
    ? {
        variant: null as any, // 阻止 buttonVariants 应用 variant 样式
        className: cn(customVariants({ variant: variant as any, size, className })),
      }
    : {
        variant: variant as any,
        size,
        className,
      }

  return (
    <Button
      {...buttonProps}
      style={styles}
      disabled={disabled}
      asChild={asChild}
      {...interactionProps}
      data-component-id={component.id}
      data-event-type={eventType}
    >
      {childNode && (
        <ComponentRenderer
          node={childNode}
          processor={processor}
          surfaceId={surfaceId}
          emitUserAction={emitUserAction}
        />
      )}
    </Button>
  )
}

// 导出 buttonVariants 供扩展组件使用
export { buttonVariants }
