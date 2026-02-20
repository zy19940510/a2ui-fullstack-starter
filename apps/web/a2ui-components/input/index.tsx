/**
 * A2UI Input Component
 * 基于 shadcn/ui Input 和 Label 的 A2UI 协议适配器
 *
 * 支持的属性:
 * - label: 输入框标签
 * - text: 当前值（支持双向数据绑定）
 * - type: 输入类型 (text, email, password, number, tel, url, search)
 * - placeholder: 占位符文本
 * - disabled: 禁用状态
 * - required: 必填字段
 * - className: 自定义样式类
 */

import * as React from 'react'
import { Input } from '@a2ui-web/shadcn-ui/components/input'
import { Label } from '@a2ui-web/shadcn-ui/components/label'
import { cn } from '@a2ui-web/shadcn-ui/lib/utils'
import type { A2UIComponentProps } from '@a2ui-web/a2ui-react-renderer'
import { useA2UIValue } from '@a2ui-web/a2ui-react-renderer'

export function A2UIInput(props: A2UIComponentProps) {
  const { component, processor, surfaceId } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // 解析数据绑定值
  const label = useA2UIValue<string>(
    componentProps.label,
    '',
    processor,
    component,
    surfaceId
  )

  const initialText = useA2UIValue<string>(
    componentProps.text,
    '',
    processor,
    component,
    surfaceId
  )

  const type = useA2UIValue<string>(
    componentProps.type,
    'text',
    processor,
    component,
    surfaceId
  )

  const placeholder = useA2UIValue<string>(
    componentProps.placeholder,
    '',
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

  const required = useA2UIValue<boolean>(
    componentProps.required,
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

  // 本地状态管理
  const [value, setValue] = React.useState(initialText || '')

  // 同步外部数据变化
  React.useEffect(() => {
    if (initialText !== undefined && initialText !== null) {
      setValue(initialText)
    }
  }, [initialText])

  // 处理输入变化
  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)

      // 更新数据模型（双向绑定）
      const textProp = componentProps.text as { path?: string } | undefined
      if (textProp && typeof textProp.path === 'string' && textProp.path) {
        processor?.setData(component, textProp.path, newValue, surfaceId || '@default')
      }
    },
    [componentProps.text, processor, component, surfaceId]
  )

  // 样式对象（仅用于 weight 属性）
  const styles: React.CSSProperties = {}
  if (component.weight !== undefined) {
    styles.flex = component.weight
  }

  return (
    <div
      className={cn('flex flex-col gap-2', className)}
      style={styles}
      data-component-id={component.id}
    >
      {label && (
        <Label htmlFor={component.id} className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Input
        id={component.id}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className="w-full"
      />
    </div>
  )
}
