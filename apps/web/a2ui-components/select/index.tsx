/**
 * A2UI Select Component
 * 基于 shadcn/ui Select 的 A2UI 协议适配器
 *
 * 支持的属性:
 * - label: 选择框标签
 * - value: 当前选中值（支持双向数据绑定）
 * - options: 选项数组 [{label: BoundValue<string>, value: string}]
 * - placeholder: 占位符文本
 * - disabled: 禁用状态
 * - action: 用户操作定义
 * - className: 自定义样式类
 */

import * as React from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@a2ui-web/shadcn-ui/components/select'
import { Label } from '@a2ui-web/shadcn-ui/components/label'
import { cn } from '@a2ui-web/shadcn-ui/lib/utils'
import type { A2UIComponentProps } from '@a2ui-web/a2ui-react-renderer'
import { useA2UIValue } from '@a2ui-web/a2ui-react-renderer'
import { emitUserAction as emitAction } from '@a2ui-web/a2ui-react-renderer/utils/userAction'
import { resolveActionContext, resolveBoundValue } from '@a2ui-web/a2ui-react-renderer/utils/resolveValue'

type SelectOption = {
  label: string
  value: string
}

export function A2UISelect(props: A2UIComponentProps) {
  const { component, processor, surfaceId, emitUserAction } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // 解析数据绑定值
  const label = useA2UIValue<string>(
    componentProps.label,
    '',
    processor,
    component,
    surfaceId
  )

  const initialValue = useA2UIValue<string>(
    componentProps.value,
    '',
    processor,
    component,
    surfaceId
  )

  const placeholder = useA2UIValue<string>(
    componentProps.placeholder,
    'Select an option',
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

  // 解析选项数组
  const rawOptions = componentProps.options as unknown
  const options: SelectOption[] = []

  if (Array.isArray(rawOptions)) {
    for (const option of rawOptions) {
      if (!option || typeof option !== 'object') continue
      const optionRecord = option as Record<string, unknown>
      const label =
        resolveBoundValue<string>(
          optionRecord.label,
          processor,
          component,
          surfaceId,
          ''
        ) ?? ''
      const rawValue = resolveBoundValue<unknown>(
        optionRecord.value,
        processor,
        component,
        surfaceId,
        ''
      )
      const value =
        typeof rawValue === 'string' ? rawValue : String(rawValue ?? '')

      if (value) {
        options.push({ label, value })
      }
    }
  }

  // action 定义
  const action = componentProps.action as
    | {
        name: string
        context?: Array<{ key: string; value: unknown }>
      }
    | undefined

  // 本地状态管理
  const [value, setValue] = React.useState(initialValue || '')

  // 同步外部数据变化
  React.useEffect(() => {
    if (initialValue !== undefined && initialValue !== null) {
      setValue(initialValue)
    }
  }, [initialValue])

  // 处理选择变化
  const handleValueChange = React.useCallback(
    (newValue: string) => {
      setValue(newValue)

      // 更新数据模型（双向绑定）
      const valueProp = componentProps.value as { path?: string } | undefined
      if (valueProp && typeof valueProp.path === 'string' && valueProp.path) {
        processor?.setData(component, valueProp.path, newValue, surfaceId || '@default')
      }

      // 触发 action（如果定义）
      if (action && emitUserAction) {
        const context = resolveActionContext(action, processor, component, surfaceId)
        emitAction(emitUserAction, {
          name: action.name,
          surfaceId,
          componentId: component.id,
          context,
        })
      }
    },
    [componentProps.value, processor, component, surfaceId, action, emitUserAction]
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
        </Label>
      )}
      <Select value={value} onValueChange={handleValueChange}>
        <SelectTrigger id={component.id} className="w-full" disabled={disabled}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent position="popper">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
