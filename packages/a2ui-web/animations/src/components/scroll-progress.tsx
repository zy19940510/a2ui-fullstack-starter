'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

interface ScrollProgressProps {
  /**
   * Position of the progress bar
   * @default 'top'
   */
  position?: 'top' | 'bottom'
  /**
   * Height of the progress bar in pixels
   * @default 2
   */
  height?: number
  /**
   * Color of the progress bar
   * @default 'rgb(59, 130, 246)' (blue-500)
   */
  color?: string
  /**
   * Spring configuration for smooth animation
   */
  springConfig?: {
    stiffness?: number
    damping?: number
    restDelta?: number
  }
}

/**
 * ScrollProgress - A smooth scroll progress indicator
 *
 * Displays a horizontal bar that fills as the user scrolls down the page
 *
 * @example
 * ```tsx
 * <ScrollProgress position="top" color="rgb(16, 185, 129)" />
 * ```
 */
export function ScrollProgress({
  position = 'top',
  height = 2,
  color = 'rgb(59, 130, 246)',
  springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 },
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, springConfig)

  return (
    <motion.div
      className="auianim:fixed auianim:left-0 auianim:right-0 auianim:origin-left auianim:z-[1200]"
      style={{
        [position]: 0,
        height: `${height}px`,
        scaleX,
        backgroundColor: color,
        pointerEvents: 'none', // Allow clicks to pass through
      }}
    />
  )
}
