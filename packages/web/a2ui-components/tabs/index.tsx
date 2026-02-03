/**
 * A2UI Tabs Component
 * 基于 shadcn/ui Tabs 的 A2UI 协议适配器
 *
 * 支持的属性:
 * - items: 标签页数组 [{title: BoundValue<string>, content: string}]
 * - defaultValue: 默认选中的标签页 ID
 * - className: 自定义样式类
 */

import * as React from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@a2ui-web/shadcn-ui/components/tabs'
import { cn } from '@a2ui-web/shadcn-ui/lib/utils'
import type { A2UIComponentProps } from '@a2ui-web/a2ui-react-renderer'
import { useA2UIValue } from '@a2ui-web/a2ui-react-renderer'
import { ComponentRenderer } from '@a2ui-web/a2ui-react-renderer/components/ComponentRenderer'

export function A2UITabs(props: A2UIComponentProps) {
  const { component, processor, surfaceId, emitUserAction } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // 解析数据绑定值
  const className = useA2UIValue<string>(
    componentProps.className,
    '',
    processor,
    component,
    surfaceId
  )

  const defaultValue = useA2UIValue<string>(
    componentProps.defaultValue,
    '',
    processor,
    component,
    surfaceId
  )

  // 解析标签页数组
  const rawItems = componentProps.items as any[]
  const items: Array<{ title: string; contentNode: any }> = []

  if (Array.isArray(rawItems)) {
    for (const item of rawItems) {
      const title = useA2UIValue<string>(item.title, '', processor, component, surfaceId)
      const contentNode = item.content

      if (contentNode) {
        items.push({ title, contentNode })
      }
    }
  }

  // 使用第一个标签页的 ID 作为默认值
  const firstTabValue = items.length > 0 ? items[0].contentNode.id : ''
  const tabDefaultValue = defaultValue || firstTabValue

  // 样式对象（仅用于 weight 属性）
  const styles: React.CSSProperties = {}
  if (component.weight !== undefined) {
    styles.flex = component.weight
  }

  return (
    <Tabs
      defaultValue={tabDefaultValue}
      className={cn(className)}
      style={styles}
      data-component-id={component.id}
    >
      <TabsList>
        {items.map((item, index) => (
          <TabsTrigger key={item.contentNode.id} value={item.contentNode.id}>
            {item.title || `Tab ${index + 1}`}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((item) => (
        <TabsContent key={item.contentNode.id} value={item.contentNode.id}>
          <ComponentRenderer
            node={item.contentNode}
            processor={processor}
            surfaceId={surfaceId}
            emitUserAction={emitUserAction}
          />
        </TabsContent>
      ))}
    </Tabs>
  )
}
