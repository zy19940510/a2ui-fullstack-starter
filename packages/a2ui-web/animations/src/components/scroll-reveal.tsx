'use client'

import type React from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { useRef } from 'react'
import type { Variants } from 'framer-motion'

type MarginValue = `${number}${'px' | '%'}`
type MarginType =
  | MarginValue
  | `${MarginValue} ${MarginValue}`
  | `${MarginValue} ${MarginValue} ${MarginValue}`
  | `${MarginValue} ${MarginValue} ${MarginValue} ${MarginValue}`

interface ScrollRevealProps {
  children: React.ReactNode
  /**
   * Animation variant to use
   * @default 'fadeInUp'
   */
  variant?: 'fadeInUp' | 'fadeIn' | 'scaleIn' | 'slideInLeft' | 'slideInRight'
  /**
   * Delay before animation starts (in seconds)
   * @default 0
   */
  delay?: number
  /**
   * Duration of the animation (in seconds)
   * @default 0.5
   */
  duration?: number
  /**
   * Whether the animation should only play once
   * @default true
   */
  once?: boolean
  /**
   * Amount of the element that must be visible before animating (0-1)
   * @default 0.3
   */
  amount?: number
  /**
   * Margin around the viewport to trigger animation early/late
   * @default '-50px'
   */
  margin?: MarginType
  /**
   * Additional CSS classes
   */
  className?: string
}

const variants: Record<string, Variants> = {
  fadeInUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  slideInLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0 },
  },
  slideInRight: {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
  },
}

/**
 * ScrollReveal - Animate elements when they come into view
 *
 * Automatically triggers animations when the element scrolls into the viewport
 * Respects user's motion preferences (prefers-reduced-motion)
 *
 * @example
 * ```tsx
 * <ScrollReveal variant="fadeInUp" delay={0.2}>
 *   <div>Content to animate</div>
 * </ScrollReveal>
 * ```
 */
export function ScrollReveal({
  children,
  variant = 'fadeInUp',
  delay = 0,
  duration = 0.5,
  once = true,
  amount = 0.3,
  margin = '-50px',
  className,
}: ScrollRevealProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, amount, margin })
  const shouldReduceMotion = useReducedMotion()

  // If user prefers reduced motion, skip animation
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants[variant]}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
