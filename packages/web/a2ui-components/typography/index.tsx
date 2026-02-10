/**
 * A2UI Typography Component
 * 带 auicom: 前缀的独立 Typography 组件，不依赖宿主项目的 Tailwind
 */

import * as React from 'react'
import type { A2UIComponentProps } from '@a2ui-web/a2ui-react-renderer'
import { useA2UIValue } from '@a2ui-web/a2ui-react-renderer'
import { cn } from '@a2ui-web/shadcn-ui/lib/utils'

// Typography variant 到 className 的映射（使用 auicom: 前缀）
const variantClasses = {
  // 特殊 variant：完全继承父元素样式（用于 Button 内的文字）
  'inherit': 'auicom:font-[inherit] auicom:text-[inherit] auicom:leading-[inherit]',

  // 通用变体（原有的语义化设计）
  'display-xl': 'auicom:text-7xl auicom:font-bold auicom:leading-[72px] auicom:tracking-[-1.677px]',
  'display-l': 'auicom:text-6xl auicom:font-bold auicom:leading-[60px] auicom:tracking-[-1.4px]',
  'display-m': 'auicom:text-5xl auicom:font-bold auicom:leading-[48px] auicom:tracking-[-1.2px]',
  'display-s': 'auicom:text-4xl auicom:font-bold auicom:leading-[40px] auicom:tracking-[-1px]',
  'heading-xl': 'auicom:text-5xl auicom:font-bold auicom:leading-[48px] auicom:tracking-[0.5px]',
  'heading-l': 'auicom:text-4xl auicom:font-bold auicom:leading-[40px] auicom:tracking-[0.37px]',
  'heading-m': 'auicom:text-3xl auicom:font-bold auicom:leading-[32px] auicom:tracking-[0.3px]',
  'heading-s': 'auicom:text-2xl auicom:font-bold auicom:leading-[28px] auicom:tracking-[0.25px]',
  'heading-xs': 'auicom:text-xl auicom:font-bold auicom:leading-[24px] auicom:tracking-[0.2px]',
  'body-l': 'auicom:text-lg auicom:font-light auicom:leading-[29.25px] auicom:tracking-[-0.44px]',
  'body-m': 'auicom:text-base auicom:font-normal auicom:leading-[24px]',
  'body-s': 'auicom:text-sm auicom:font-normal auicom:leading-[20px]',
  'caption': 'auicom:text-xs auicom:font-normal auicom:leading-[16px]',
  'overline': 'auicom:text-xs auicom:font-medium auicom:leading-[16px] auicom:uppercase auicom:tracking-[1px]',

  // web-old 主题变体（基于 Figma Web Design System）
  // 字体栈: PingFang SC (简体中文) → PingFang TC (繁体中文) → SF Pro Display (English) → 系统默认
  'web-old-hero': 'auicom:font-[\'PingFang_SC\',\'PingFang_TC\',\'SF_Pro_Display\',system-ui,sans-serif] auicom:text-[24px] auicom:font-semibold auicom:leading-normal', // 特级标题 - 资讯/长文详情页大标题
  'web-old-h1': 'auicom:font-[\'PingFang_SC\',\'PingFang_TC\',\'SF_Pro_Display\',system-ui,sans-serif] auicom:text-[18px] auicom:font-semibold auicom:leading-normal', // 一级标题 - 一级导航栏、一级 TAB 选中状态
  'web-old-h2': 'auicom:font-[\'PingFang_SC\',\'PingFang_TC\',\'SF_Pro_Display\',system-ui,sans-serif] auicom:text-[16px] auicom:font-semibold auicom:leading-normal', // 二级标题 - 左侧主内容模块标题、右侧边栏卡片标题
  'web-old-title': 'auicom:font-[\'PingFang_SC\',\'PingFang_TC\',\'SF_Pro_Display\',system-ui,sans-serif] auicom:text-[14px] auicom:font-medium auicom:leading-normal', // 正文标题 - 社区 Feed 流长文标题、新闻列表标题
  'web-old-body': 'auicom:font-[\'PingFang_SC\',\'PingFang_TC\',\'SF_Pro_Display\',system-ui,sans-serif] auicom:text-[14px] auicom:font-normal auicom:leading-normal', // 正文内容 - 全局正文基准字号
  'web-old-subtitle': 'auicom:font-[\'PingFang_SC\',\'PingFang_TC\',\'SF_Pro_Display\',system-ui,sans-serif] auicom:text-[12px] auicom:font-medium auicom:leading-normal', // 次要标题 - Footer 小标题或辅助信息
  'web-old-caption': 'auicom:font-[\'PingFang_SC\',\'PingFang_TC\',\'SF_Pro_Display\',system-ui,sans-serif] auicom:text-[12px] auicom:font-normal auicom:leading-normal', // 次要正文 - 次要说明、辅助信息、Footer 正文
} as const

// Color variant 到 className 的映射（使用 auicom: 前缀）
// 遵循 A2UI 语义化原则：使用语义化的颜色名称而非直接颜色值
const colorClasses = {
  // 通用颜色（原有的语义化设计）
  'inherit': 'auicom:text-inherit', // 继承父元素颜色
  'default': 'auicom:text-foreground',
  'primary': 'auicom:text-primary',
  'secondary': 'auicom:text-secondary-foreground',
  'muted': 'auicom:text-muted-foreground',
  'mutedForeground': 'auicom:text-muted-foreground', // 别名支持
  'accent': 'auicom:text-accent-foreground',
  'destructive': 'auicom:text-destructive',
  'success': 'auicom:text-green-600 dark:auicom:text-green-400',
  'warning': 'auicom:text-yellow-600 dark:auicom:text-yellow-400',
  'info': 'auicom:text-blue-600 dark:auicom:text-blue-400',
  'inverse': 'auicom:text-background', // 反色文本（用于深色背景上的浅色文本）

  // web-old 主题颜色（基于 Figma Web Design System）
  'web-old-primary': 'auicom:text-[#1c1c28]', // 主要文字颜色 - Dark 0
  'web-old-secondary': 'auicom:text-[#5d6267]', // 次要说明文字 - 用于辅助信息
  'web-old-tertiary': 'auicom:text-[#82888d]', // 三级文字颜色 - 用于禁用状态或极次要信息
} as const

export function A2UITypography(props: A2UIComponentProps) {
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

  const variant = useA2UIValue<keyof typeof variantClasses>(
    componentProps.variant,
    'body-m',
    processor,
    component,
    surfaceId
  )

  const color = useA2UIValue<keyof typeof colorClasses>(
    componentProps.color,
    'default',
    processor,
    component,
    surfaceId
  )

  // 避免依赖全局 JSX namespace（部分 TS 配置下不可用）
  const as = useA2UIValue<React.ElementType>(
    componentProps.as,
    'p',
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

  const align = useA2UIValue<'left' | 'center' | 'right' | 'justify'>(
    componentProps.align,
    'left',
    processor,
    component,
    surfaceId
  )

  // 样式对象
  const styles: React.CSSProperties = {
    textAlign: align,
  }

  // 如果有 weight 属性，添加 flex 样式
  if (component.weight !== undefined) {
    styles.flex = component.weight
  }

  // 构建完整的 className
  const fullClassName = cn(
    variantClasses[variant],
    colorClasses[color],
    className
  )

  return React.createElement(
    as,
    {
      className: fullClassName,
      style: styles,
      'data-component-id': component.id,
    },
    text || '(empty)'
  )
}
