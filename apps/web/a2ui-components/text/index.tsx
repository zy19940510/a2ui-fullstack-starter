/**
 * A2UI Text Component
 * 符合 A2UI 0.8 协议的文本组件
 *
 * 支持的属性:
 * - text: 文本内容（支持数据绑定）
 * - usageHint: 语义化标签 (h1, h2, h3, h4, h5, h6, body, caption, label, code, pre, blockquote)
 * - className: 自定义样式类
 * - weight: flex 权重
 */

import * as React from 'react'
import type { A2UIComponentProps } from '@a2ui-web/a2ui-react-renderer'
import { useA2UIValue } from '@a2ui-web/a2ui-react-renderer'
import { cn } from '@a2ui-web/shadcn-ui/lib/utils'

// 语义化标签映射到 HTML 元素和默认样式
const usageHintConfig = {
  h1: { tag: 'h1', className: 'scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl' },
  h2: { tag: 'h2', className: 'scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0' },
  h3: { tag: 'h3', className: 'scroll-m-20 text-2xl font-semibold tracking-tight' },
  h4: { tag: 'h4', className: 'scroll-m-20 text-xl font-semibold tracking-tight' },
  h5: { tag: 'h5', className: 'scroll-m-20 text-lg font-semibold tracking-tight' },
  h6: { tag: 'h6', className: 'scroll-m-20 text-base font-semibold tracking-tight' },
  body: { tag: 'p', className: 'leading-7' },
  caption: { tag: 'p', className: 'text-sm text-muted-foreground' },
  label: { tag: 'label', className: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70' },
  code: { tag: 'code', className: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold' },
  pre: { tag: 'pre', className: 'rounded-lg bg-muted p-4 font-mono text-sm overflow-x-auto' },
  blockquote: { tag: 'blockquote', className: 'mt-6 border-l-2 pl-6 italic' },
} as const

export function A2UIText(props: A2UIComponentProps) {
  const { component, processor, surfaceId } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // 解析数据绑定值
  const text = useA2UIValue<string>(
    componentProps.text,
    '',
    processor,
    component,
    surfaceId
  )

  const usageHint = useA2UIValue<keyof typeof usageHintConfig>(
    componentProps.usageHint,
    'body',
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

  // 获取配置
  const config = usageHintConfig[usageHint] || usageHintConfig.body
  // 在某些 TS 配置下（尤其是 react 新 JSX runtime），全局 JSX namespace 可能不可用。
  // 用 React.ElementType 避免依赖全局 JSX 类型。
  const Tag = config.tag as React.ElementType

  // 样式对象（仅用于 weight 属性）
  const styles: React.CSSProperties = {}
  if (component.weight !== undefined) {
    styles.flex = component.weight
  }

  return (
    <Tag
      className={cn(config.className, className)}
      style={styles}
      data-component-id={component.id}
    >
      {text}
    </Tag>
  )
}
