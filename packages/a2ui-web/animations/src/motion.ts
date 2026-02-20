'use client'

/**
 * Framer Motion animation library
 * @see https://www.framer.com/motion/
 */

// Core components
export {
  motion,
  m, // Optimized motion component for use with LazyMotion
  AnimatePresence,
  MotionConfig,
  LazyMotion,
  domAnimation,
  domMax,
  LayoutGroup,
  Reorder,
} from 'framer-motion'

// Hooks
export {
  useAnimation,
  useAnimationControls,
  useAnimationFrame,
  useCycle,
  useDragControls,
  useInView,
  useIsPresent,
  useMotionValue,
  usePresence,
  useReducedMotion,
  useScroll,
  useSpring,
  useTime,
  useTransform,
  useVelocity,
} from 'framer-motion'

// Types
export type {
  AnimationControls,
  AnimationLifecycles,
  AnimationProps,
  DragControls,
  DragHandlers,
  EasingFunction,
  MotionProps,
  MotionStyle,
  MotionValue,
  PanHandlers,
  TapHandlers,
  Transition,
  Variant,
  Variants,
  ScrollMotionValues,
} from 'framer-motion'

// Utilities
export { animate } from 'framer-motion'

// Import types for local use
import type { Transition, Variants } from 'framer-motion'

// Common animation variants
export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
}

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
}

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -100 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 100 },
}

// Common transition presets
export const springTransition: Transition = {
  type: 'spring',
  stiffness: 260,
  damping: 20,
}

export const easeTransition: Transition = {
  duration: 0.3,
  ease: 'easeInOut',
}

export const smoothTransition: Transition = {
  duration: 0.6,
  ease: [0.43, 0.13, 0.23, 0.96],
}

export const bounceTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 17,
}

export const slowTransition: Transition = {
  duration: 0.8,
  ease: [0.16, 1, 0.3, 1],
}

// Stagger animation variants
export const staggerContainer: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

// 3D card animation variants
export const card3D: Variants = {
  initial: { opacity: 0, y: 50, rotateX: 15 },
  animate: { opacity: 1, y: 0, rotateX: 0 },
  exit: { opacity: 0, y: -50, rotateX: -15 },
}

// Modal/Dialog animation variants
export const modalBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const modalContent: Variants = {
  initial: { opacity: 0, scale: 0.9, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 20 },
}

// Viewport animation configuration (optimized for scroll animations)
export const viewportConfig = {
  once: true,
  margin: '-50px',
  amount: 0.3,
}

// Performance optimization: Use will-change for smooth animations
export const optimizedAnimation = {
  willChange: 'transform, opacity',
}

// Hover animations
export const hoverScale = {
  scale: 1.05,
  transition: bounceTransition,
}

export const hoverLift = {
  y: -8,
  transition: { duration: 0.2, ease: 'easeOut' },
}
