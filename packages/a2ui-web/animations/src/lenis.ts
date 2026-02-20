'use client'

/**
 * Lenis smooth scrolling library
 * @see https://github.com/studio-freight/lenis
 */

export { default as Lenis } from '@studio-freight/lenis'
export type { LenisOptions } from '@studio-freight/lenis'

// Re-export useful utilities
import Lenis from '@studio-freight/lenis'

/**
 * Create a Lenis instance with sensible defaults
 */
export function createLenis(options?: ConstructorParameters<typeof Lenis>[0]) {
  return new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    infinite: false,
    ...options,
  })
}

/**
 * Hook for using Lenis in React components
 * Note: Install @studio-freight/lenis peer dependency for React hooks
 */
// export { useLenis } from '@studio-freight/lenis/react'
