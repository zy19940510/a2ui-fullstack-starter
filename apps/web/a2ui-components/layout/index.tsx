/**
 * Basic Layout Components for A2UI
 * Provides Column and Row components for organizing child components
 *
 * Enhanced with responsive features:
 * - wrap: Enable flex-wrap for multi-line layouts
 * - padding: Add padding to container
 * - width/height: Set container dimensions
 * - maxWidth/maxHeight: Set max dimensions
 *
 * 使用 Tailwind CSS 类名 + auicom 前缀实现样式隔离
 */

import type { A2UIComponentProps } from '@a2ui-web/a2ui-react-renderer'
import { useA2UIValue } from '@a2ui-web/a2ui-react-renderer'
import { ComponentRenderer } from '@a2ui-web/a2ui-react-renderer/components/ComponentRenderer'
import type * as v0_8 from '@a2ui-web/lit-core'
import type { CSSProperties } from 'react'

/**
 * 生成带 auicom 前缀的 Tailwind 类名
 */
function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}

/**
 * Layout 类名映射 - 硬编码所有类名以便 Tailwind 扫描
 */
const layoutClasses = {
  flex: 'auicom:flex',
  flexCol: 'auicom:flex-col',
  flexRow: 'auicom:flex-row',
  flexWrap: 'auicom:flex-wrap',
  flexNowrap: 'auicom:flex-nowrap',
  justifyStart: 'auicom:justify-start',
  justifyEnd: 'auicom:justify-end',
  justifyCenter: 'auicom:justify-center',
  justifyBetween: 'auicom:justify-between',
  justifyAround: 'auicom:justify-around',
  justifyEvenly: 'auicom:justify-evenly',
  itemsStart: 'auicom:items-start',
  itemsEnd: 'auicom:items-end',
  itemsCenter: 'auicom:items-center',
  itemsStretch: 'auicom:items-stretch',
  // Gap 预定义类（硬编码常用值，确保 Tailwind 扫描到）
  gap0: '',
  gap1: 'auicom:gap-1',     // 4px
  gap2: 'auicom:gap-2',     // 8px
  gap3: 'auicom:gap-3',     // 12px
  gap4: 'auicom:gap-4',     // 16px
  gap5: 'auicom:gap-5',     // 20px
  gap6: 'auicom:gap-6',     // 24px
  gap8: 'auicom:gap-8',     // 32px
  gap10: 'auicom:gap-10',   // 40px
  gap12: 'auicom:gap-12',   // 48px
  // Padding 预定义类
  p0: '',
  p1: 'auicom:p-1',         // 4px
  p2: 'auicom:p-2',         // 8px
  p3: 'auicom:p-3',         // 12px
  p4: 'auicom:p-4',         // 16px
  p5: 'auicom:p-5',         // 20px
  p6: 'auicom:p-6',         // 24px
  p8: 'auicom:p-8',         // 32px
  p10: 'auicom:p-10',       // 40px
  p12: 'auicom:p-12',       // 48px
} as const

/**
 * 将 px 值映射到 Tailwind spacing scale
 * Tailwind spacing: 1 unit = 0.25rem = 4px
 */
function getGapClass(gap: number): string {
  if (gap === 0) return ''
  // 精确匹配常用值
  const gapMap: Record<number, string> = {
    4: layoutClasses.gap1,
    8: layoutClasses.gap2,
    12: layoutClasses.gap3,
    16: layoutClasses.gap4,
    20: layoutClasses.gap5,
    24: layoutClasses.gap6,
    32: layoutClasses.gap8,
    40: layoutClasses.gap10,
    48: layoutClasses.gap12,
  }
  return gapMap[gap] || `auicom:gap-[${gap}px]` // 未匹配的值降级到任意值
}

function getPaddingClass(padding: number): string {
  if (padding === 0) return ''
  const paddingMap: Record<number, string> = {
    4: layoutClasses.p1,
    8: layoutClasses.p2,
    12: layoutClasses.p3,
    16: layoutClasses.p4,
    20: layoutClasses.p5,
    24: layoutClasses.p6,
    32: layoutClasses.p8,
    40: layoutClasses.p10,
    48: layoutClasses.p12,
  }
  return paddingMap[padding] || `auicom:p-[${padding}px]`
}

/**
 * Column - Vertical layout component
 */
export function Column(props: A2UIComponentProps) {
  const { component, processor, surfaceId, emitUserAction } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // children is already resolved by processor as AnyComponentNode[]
  const children = (componentProps.children as v0_8.Types.AnyComponentNode[]) ?? []

  const distribution = useA2UIValue<string>(
    componentProps.distribution,
    'start',
    processor,
    component,
    surfaceId
  )

  const alignment = useA2UIValue<string>(
    componentProps.alignment,
    'stretch',
    processor,
    component,
    surfaceId
  )

  const gap = useA2UIValue<number>(
    componentProps.gap,
    0,
    processor,
    component,
    surfaceId
  )

  // Enhanced responsive properties
  const wrap = useA2UIValue<boolean>(
    componentProps.wrap,
    false,
    processor,
    component,
    surfaceId
  )

  const padding = useA2UIValue<number>(
    componentProps.padding,
    0,
    processor,
    component,
    surfaceId
  )

  const width = useA2UIValue<string>(
    componentProps.width,
    '',
    processor,
    component,
    surfaceId
  )

  const height = useA2UIValue<string>(
    componentProps.height,
    '',
    processor,
    component,
    surfaceId
  )

  const maxWidth = useA2UIValue<string>(
    componentProps.maxWidth,
    '',
    processor,
    component,
    surfaceId
  )

  const maxHeight = useA2UIValue<string>(
    componentProps.maxHeight,
    '',
    processor,
    component,
    surfaceId
  )

  // Map distribution to Tailwind justify-content classes
  const justifyClass =
    distribution === 'start'
      ? layoutClasses.justifyStart
      : distribution === 'end'
        ? layoutClasses.justifyEnd
        : distribution === 'center'
          ? layoutClasses.justifyCenter
          : distribution === 'space-between' || distribution === 'spaceBetween'
            ? layoutClasses.justifyBetween
            : distribution === 'space-around' || distribution === 'spaceAround'
              ? layoutClasses.justifyAround
              : distribution === 'space-evenly' || distribution === 'spaceEvenly'
                ? layoutClasses.justifyEvenly
                : layoutClasses.justifyStart

  // Map alignment to Tailwind align-items classes
  const alignClass =
    alignment === 'start'
      ? layoutClasses.itemsStart
      : alignment === 'end'
        ? layoutClasses.itemsEnd
        : alignment === 'center'
          ? layoutClasses.itemsCenter
          : alignment === 'stretch'
            ? layoutClasses.itemsStretch
            : layoutClasses.itemsStretch

  // Map gap to Tailwind gap classes (using predefined classes)
  const gapClass = getGapClass(gap)

  // Map padding to Tailwind padding classes (using predefined classes)
  const paddingClass = getPaddingClass(padding)

  // Wrap control
  const wrapClass = wrap ? layoutClasses.flexWrap : layoutClasses.flexNowrap

  // Combine all classes
  const className = cn(
    layoutClasses.flex,
    layoutClasses.flexCol,
    justifyClass,
    alignClass,
    gapClass,
    wrapClass,
    paddingClass
  )

  // 使用 style 处理动态的 width/height/maxWidth/maxHeight
  const inlineStyle: CSSProperties = {
    width: width || undefined,
    height: height || undefined,
    maxWidth: maxWidth || undefined,
    maxHeight: maxHeight || undefined,
  }

  return (
    <div className={className} style={inlineStyle}>
      {Array.isArray(children) &&
        children.map((childComponent) => (
          <ComponentRenderer
            key={childComponent.id}
            node={childComponent}
            processor={processor}
            surfaceId={surfaceId}
            emitUserAction={emitUserAction}
          />
        ))}
    </div>
  )
}

/**
 * Row - Horizontal layout component
 */
export function Row(props: A2UIComponentProps) {
  const { component, processor, surfaceId, emitUserAction } = props
  const componentProps = (component.properties as Record<string, unknown>) ?? {}

  // children is already resolved by processor as AnyComponentNode[]
  const children = (componentProps.children as v0_8.Types.AnyComponentNode[]) ?? []

  const distribution = useA2UIValue<string>(
    componentProps.distribution,
    'start',
    processor,
    component,
    surfaceId
  )

  const alignment = useA2UIValue<string>(
    componentProps.alignment,
    'center',
    processor,
    component,
    surfaceId
  )

  const gap = useA2UIValue<number>(
    componentProps.gap,
    0,
    processor,
    component,
    surfaceId
  )

  // Enhanced responsive properties
  const wrap = useA2UIValue<boolean>(
    componentProps.wrap,
    false,
    processor,
    component,
    surfaceId
  )

  const padding = useA2UIValue<number>(
    componentProps.padding,
    0,
    processor,
    component,
    surfaceId
  )

  const width = useA2UIValue<string>(
    componentProps.width,
    '',
    processor,
    component,
    surfaceId
  )

  const height = useA2UIValue<string>(
    componentProps.height,
    '',
    processor,
    component,
    surfaceId
  )

  const maxWidth = useA2UIValue<string>(
    componentProps.maxWidth,
    '',
    processor,
    component,
    surfaceId
  )

  const maxHeight = useA2UIValue<string>(
    componentProps.maxHeight,
    '',
    processor,
    component,
    surfaceId
  )

  // Map distribution to Tailwind justify-content classes
  const justifyClass =
    distribution === 'start'
      ? layoutClasses.justifyStart
      : distribution === 'end'
        ? layoutClasses.justifyEnd
        : distribution === 'center'
          ? layoutClasses.justifyCenter
          : distribution === 'space-between' || distribution === 'spaceBetween'
            ? layoutClasses.justifyBetween
            : distribution === 'space-around' || distribution === 'spaceAround'
              ? layoutClasses.justifyAround
              : distribution === 'space-evenly' || distribution === 'spaceEvenly'
                ? layoutClasses.justifyEvenly
                : layoutClasses.justifyStart

  // Map alignment to Tailwind align-items classes
  const alignClass =
    alignment === 'start'
      ? layoutClasses.itemsStart
      : alignment === 'end'
        ? layoutClasses.itemsEnd
        : alignment === 'center'
          ? layoutClasses.itemsCenter
          : alignment === 'stretch'
            ? layoutClasses.itemsStretch
            : layoutClasses.itemsCenter

  // Map gap to Tailwind gap classes (using predefined classes)
  const gapClass = getGapClass(gap)

  // Map padding to Tailwind padding classes (using predefined classes)
  const paddingClass = getPaddingClass(padding)

  // Wrap control
  const wrapClass = wrap ? layoutClasses.flexWrap : layoutClasses.flexNowrap

  // Combine all classes
  const className = cn(
    layoutClasses.flex,
    layoutClasses.flexRow,
    justifyClass,
    alignClass,
    gapClass,
    wrapClass,
    paddingClass
  )

  // 使用 style 处理动态的 width/height/maxWidth/maxHeight
  const inlineStyle: CSSProperties = {
    width: width || undefined,
    height: height || undefined,
    maxWidth: maxWidth || undefined,
    maxHeight: maxHeight || undefined,
  }

  return (
    <div className={className} style={inlineStyle}>
      {Array.isArray(children) &&
        children.map((childComponent) => (
          <ComponentRenderer
            key={childComponent.id}
            node={childComponent}
            processor={processor}
            surfaceId={surfaceId}
            emitUserAction={emitUserAction}
          />
        ))}
    </div>
  )
}
