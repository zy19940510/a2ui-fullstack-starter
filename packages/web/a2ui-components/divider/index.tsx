/**
 * A2UI Divider Component
 * 符合 A2UI 0.8 协议的分割线组件
 *
 * 支持的属性:
 * - orientation: 方向 ('horizontal' | 'vertical')
 * - decorative: 是否为装饰性元素（影响无障碍属性）
 * - className: 自定义样式类
 * - weight: flex 权重
 */

import * as React from 'react'
import type { A2UIComponentProps } from '@a2ui-web/a2ui-react-renderer'
import { useA2UIValue } from '@a2ui-web/a2ui-react-renderer'
import { Separator } from '@a2ui-web/shadcn-ui/components/separator'

export function A2UIDivider(props: A2UIComponentProps) {
  const { component, processor, surfaceId } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // 解析数据绑定值
  const orientation = useA2UIValue<'horizontal' | 'vertical'>(
    componentProps.orientation,
    'horizontal',
    processor,
    component,
    surfaceId
  )

  const decorative = useA2UIValue<boolean>(
    componentProps.decorative,
    true,
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

  // 样式对象（仅用于 weight 属性）
  const styles: React.CSSProperties = {}
  if (component.weight !== undefined) {
    styles.flex = component.weight
  }

  return (
    <Separator
      orientation={orientation}
      decorative={decorative}
      className={className}
      style={styles}
      data-component-id={component.id}
    />
  )
}
