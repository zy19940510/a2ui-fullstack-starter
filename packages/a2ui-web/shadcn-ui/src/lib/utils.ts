import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Re-export CVA utilities for components that need them
export { cva, type VariantProps } from 'class-variance-authority'
