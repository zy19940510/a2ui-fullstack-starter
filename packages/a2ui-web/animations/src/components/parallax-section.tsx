'use client'

import type React from 'react'
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'

interface ParallaxSectionProps {
  children: React.ReactNode
  /**
   * Speed of parallax effect (higher = slower movement)
   * @default 50
   */
  speed?: number
  /**
   * Direction of parallax effect
   * @default 'up'
   */
  direction?: 'up' | 'down'
  /**
   * Additional CSS classes
   */
  className?: string
}

/**
 * ParallaxSection - Create smooth parallax scrolling effects
 *
 * Elements move at a different speed than the scroll, creating depth
 * Automatically disabled for users who prefer reduced motion
 *
 * @example
 * ```tsx
 * <ParallaxSection speed={100} direction="down">
 *   <img src="background.jpg" alt="Background" />
 * </ParallaxSection>
 * ```
 */
export function ParallaxSection({
  children,
  speed = 50,
  direction = 'up',
  className,
}: ParallaxSectionProps) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const shouldReduceMotion = useReducedMotion()

  // Calculate parallax movement based on direction
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    direction === 'up' ? [speed, -speed] : [-speed, speed],
  )

  // If user prefers reduced motion, disable parallax
  if (shouldReduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    )
  }

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}
