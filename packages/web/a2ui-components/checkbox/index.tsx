/**
 * A2UI Checkbox Component
 * 基于 shadcn/ui Checkbox 和 Label 的 A2UI 协议适配器
 *
 * 支持的属性:
 * - label: 复选框标签
 * - checked: 选中状态（支持双向数据绑定）
 * - disabled: 禁用状态
 * - action: 用户操作定义
 * - className: 自定义样式类
 */

import * as React from 'react'
import { Checkbox } from '@a2ui-web/shadcn-ui/components/checkbox'
import { Label } from '@a2ui-web/shadcn-ui/components/label'
import { cn } from '@a2ui-web/shadcn-ui/lib/utils'
import type { A2UIComponentProps } from '@a2ui-web/a2ui-react-renderer'
import { useA2UIValue } from '@a2ui-web/a2ui-react-renderer'
import { emitUserAction as emitAction } from '@a2ui-web/a2ui-react-renderer/utils/userAction'
import { resolveActionContext } from '@a2ui-web/a2ui-react-renderer/utils/resolveValue'

export function A2UICheckbox(props: A2UIComponentProps) {
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

  const initialChecked = useA2UIValue<boolean>(
    componentProps.checked,
    false,
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

  // action 定义
  const action = componentProps.action as
    | {
        name: string
        context?: Array<{ key: string; value: any }>
      }
    | undefined

  // 本地状态管理
  const [checked, setChecked] = React.useState(initialChecked)

  // 同步外部数据变化
  React.useEffect(() => {
    setChecked(initialChecked)
  }, [initialChecked])

  // 处理选中状态变化
  const handleCheckedChange = React.useCallback(
    (newChecked: boolean) => {
      setChecked(newChecked)

      // 更新数据模型（双向绑定）
      const checkedProp = componentProps.checked as any
      if (checkedProp && typeof checkedProp === 'object' && 'path' in checkedProp && checkedProp.path) {
        processor?.setData(component, checkedProp.path, newChecked, surfaceId || '@default')
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
    [componentProps.checked, processor, component, surfaceId, action, emitUserAction]
  )

  // 样式对象（仅用于 weight 属性）
  const styles: React.CSSProperties = {}
  if (component.weight !== undefined) {
    styles.flex = component.weight
  }

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      style={styles}
      data-component-id={component.id}
    >
      <Checkbox
        id={component.id}
        checked={checked}
        onCheckedChange={handleCheckedChange}
        disabled={disabled}
      />
      {label && (
        <Label
          htmlFor={component.id}
          className="text-sm font-normal cursor-pointer"
        >
          {label}
        </Label>
      )}
    </div>
  )
}
