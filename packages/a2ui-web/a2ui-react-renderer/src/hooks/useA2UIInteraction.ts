/**
 * useA2UIInteraction Hook
 *
 * 统一处理多设备交互事件（桌面、移动、触控笔）的 Hook
 * 使用 Pointer Events API（优先）或 Click 事件（回退）
 *
 * @example
 * ```tsx
 * const { interactionProps, supportsPointer } = useA2UIInteraction({
 *   onInteract: handleClick,
 *   disabled: false,
 * })
 *
 * return <button {...interactionProps}>Click me</button>
 * ```
 */

import * as React from 'react'

// 检测 Pointer Events 支持性（仅在客户端执行一次）
let cachedSupportsPointer: boolean | undefined

const checkPointerSupport = (): boolean => {
  if (cachedSupportsPointer !== undefined) {
    return cachedSupportsPointer
  }

  if (typeof window === 'undefined') {
    cachedSupportsPointer = false
    return false
  }

  cachedSupportsPointer = 'PointerEvent' in window
  return cachedSupportsPointer
}

export interface UseA2UIInteractionOptions {
  /**
   * 交互回调函数（点击/触摸/指针按下）
   */
  onInteract?: (event: React.PointerEvent | React.MouseEvent) => void

  /**
   * 是否禁用交互
   */
  disabled?: boolean

  /**
   * 是否阻止默认行为
   * @default true
   */
  preventDefault?: boolean

  /**
   * 是否只响应主要按钮/触摸点
   * @default true
   */
  primaryOnly?: boolean
}

export interface UseA2UIInteractionReturn {
  /**
   * 需要传递给元素的 props
   */
  interactionProps: {
    onPointerDown?: (event: React.PointerEvent) => void
    onClick?: (event: React.MouseEvent) => void
  }

  /**
   * 浏览器是否支持 Pointer Events
   */
  supportsPointer: boolean

  /**
   * 当前使用的事件类型
   */
  eventType: 'pointer' | 'click'
}

/**
 * 统一处理多设备交互事件的 Hook
 *
 * **兼容性**:
 * - Pointer Events: Chrome 55+, Firefox 59+, Safari 13+, Edge 79+
 * - Click 事件: 所有浏览器（回退方案）
 *
 * **设备支持**:
 * - ✅ 桌面端鼠标
 * - ✅ 移动端触摸（无延迟）
 * - ✅ 触控笔
 * - ✅ 混合设备（如 Surface）
 */
export function useA2UIInteraction(
  options: UseA2UIInteractionOptions = {}
): UseA2UIInteractionReturn {
  const {
    onInteract,
    disabled = false,
    preventDefault = true,
    primaryOnly = true,
  } = options

  const supportsPointer = React.useMemo(() => checkPointerSupport(), [])

  // 统一的交互处理器
  const handleInteraction = React.useCallback(
    (event: React.PointerEvent | React.MouseEvent) => {
      // 如果禁用，直接返回
      if (disabled || !onInteract) return

      // 如果是 pointer 事件，检查是否只响应主要按钮
      if (primaryOnly && 'pointerId' in event) {
        // button === 0 表示主要按钮（鼠标左键、触摸、笔的主要按钮）
        if (event.button !== 0) return
      }

      // 阻止默认行为（可选）
      if (preventDefault) {
        event.preventDefault()
      }

      // 调用回调
      onInteract(event)
    },
    [disabled, onInteract, preventDefault, primaryOnly]
  )

  // 根据浏览器支持情况返回对应的 props
  const interactionProps = React.useMemo(() => {
    if (supportsPointer) {
      return {
        onPointerDown: handleInteraction as (event: React.PointerEvent) => void,
      }
    } else {
      return {
        onClick: handleInteraction as (event: React.MouseEvent) => void,
      }
    }
  }, [supportsPointer, handleInteraction])

  return {
    interactionProps,
    supportsPointer,
    eventType: supportsPointer ? 'pointer' : 'click',
  }
}

/**
 * 获取设备能力信息（用于调试和分析）
 */
export function getDeviceCapabilities() {
  if (typeof window === 'undefined') {
    return {
      supportsPointer: false,
      supportsTouch: false,
      isMobile: false,
      userAgent: 'SSR',
    }
  }

  return {
    supportsPointer: 'PointerEvent' in window,
    supportsTouch: 'ontouchstart' in window,
    isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
    userAgent: navigator.userAgent,
  }
}
