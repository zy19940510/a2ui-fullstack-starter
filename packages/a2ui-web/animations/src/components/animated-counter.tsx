'use client'

import { motion, useSpring, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface AnimatedCounterProps {
  /**
   * Target value to count to
   */
  value: number
  /**
   * Number of decimal places
   * @default 0
   */
  decimals?: number
  /**
   * Duration of the animation (in seconds)
   * @default 2
   */
  duration?: number
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * Prefix to display before the number
   */
  prefix?: string
  /**
   * Suffix to display after the number
   */
  suffix?: string
}

/**
 * AnimatedCounter - Smooth number counter animation
 *
 * Animates from 0 to the target value with spring physics
 * Starts animating when the element comes into view
 *
 * @example
 * ```tsx
 * <AnimatedCounter value={1250} prefix="$" suffix="K" />
 * ```
 */
export function AnimatedCounter({
  value,
  decimals = 0,
  duration = 2,
  className,
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
  const spring = useSpring(0, {
    stiffness: 100 / duration,
    damping: 30,
  })
  const [display, setDisplay] = useState('0')

  useEffect(() => {
    if (isInView) {
      spring.set(value)
    }
  }, [spring, value, isInView])

  useEffect(() => {
    const unsubscribe = spring.onChange((current) => {
      const formatted = current.toFixed(decimals)
      setDisplay(`${prefix}${Number.parseFloat(formatted).toLocaleString()}${suffix}`)
    })
    return () => unsubscribe()
  }, [spring, decimals, prefix, suffix])

  return (
    <span ref={ref} className={className}>
      <motion.span>{display}</motion.span>
    </span>
  )
}
