'use client'

import { motion, useAnimation } from 'framer-motion'
import { useEffect } from 'react'

interface PageLoadProgressProps {
  /**
   * Color of the progress bar
   * @default 'rgb(59, 130, 246)' (blue-500)
   */
  color?: string
  /**
   * Height of the progress bar in pixels
   * @default 3
   */
  height?: number
  /**
   * Duration to complete the progress (in seconds)
   * @default 2
   */
  duration?: number
}

/**
 * PageLoadProgress - Animated progress bar during page load
 *
 * Displays a smooth loading animation at the top of the page
 * Automatically completes when the page finishes loading
 *
 * @example
 * ```tsx
 * <PageLoadProgress color="rgb(16, 185, 129)" duration={1.5} />
 * ```
 */
export function PageLoadProgress({
  color = 'rgb(59, 130, 246)',
  height = 3,
  duration = 2,
}: PageLoadProgressProps) {
  const controls = useAnimation()

  useEffect(() => {
    const sequence = async () => {
      // Start from 0% to 70% quickly
      await controls.start({
        scaleX: 0.7,
        transition: { duration: duration * 0.5, ease: 'easeOut' },
      })

      // Slowly progress to 90%
      await controls.start({
        scaleX: 0.9,
        transition: { duration: duration * 0.3, ease: 'linear' },
      })

      // Wait for page load, then complete
      await controls.start({
        scaleX: 1,
        transition: { duration: duration * 0.2, ease: 'easeIn' },
      })

      // Fade out
      await controls.start({
        opacity: 0,
        transition: { duration: 0.3 },
      })
    }

    sequence()
  }, [controls, duration])

  return (
    <motion.div
      initial={{ scaleX: 0, opacity: 1 }}
      animate={controls}
      className="auianim:fixed auianim:top-0 auianim:left-0 auianim:right-0 auianim:origin-left auianim:z-50"
      style={{
        height: `${height}px`,
        backgroundColor: color,
      }}
    />
  )
}
