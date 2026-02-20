import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '../lib/utils'

const buttonVariants = cva(
  "auicom:inline-flex auicom:items-center auicom:justify-center auicom:gap-2 auicom:whitespace-nowrap auicom:rounded-md auicom:text-sm auicom:font-medium auicom:transition-all auicom:disabled:pointer-events-none auicom:disabled:opacity-50 [&_svg]:auicom:pointer-events-none [&_svg:not([class*='size-'])]:auicom:size-4 auicom:shrink-0 [&_svg]:auicom:shrink-0 auicom:outline-none auicom:focus-visible:border-ring auicom:focus-visible:ring-ring/50 auicom:focus-visible:ring-[3px] auicom:aria-invalid:ring-destructive/20 auicom:dark:aria-invalid:ring-destructive/40 auicom:aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'auicom:bg-primary auicom:text-primary-foreground auicom:hover:bg-primary/90',
        destructive:
          'auicom:bg-destructive auicom:text-white auicom:hover:bg-destructive/90 auicom:focus-visible:ring-destructive/20 auicom:dark:focus-visible:ring-destructive/40 auicom:dark:bg-destructive/60',
        outline:
          'auicom:border auicom:border-input auicom:bg-background auicom:text-foreground auicom:shadow-xs auicom:hover:bg-accent auicom:hover:text-accent-foreground auicom:dark:bg-input/30 auicom:dark:border-input auicom:dark:hover:bg-input/50',
        secondary: 'auicom:bg-secondary auicom:text-secondary-foreground auicom:hover:bg-secondary/80',
        ghost: 'auicom:hover:bg-accent auicom:hover:text-accent-foreground auicom:dark:hover:bg-accent/50',
        link: 'auicom:text-primary auicom:underline-offset-4 auicom:hover:underline',
      },
      size: {
        default: 'auicom:h-9 auicom:px-4 auicom:py-2 has-[>svg]:auicom:px-3',
        sm: 'auicom:h-8 auicom:rounded-md auicom:gap-1.5 auicom:px-3 has-[>svg]:auicom:px-2.5',
        lg: 'auicom:h-10 auicom:rounded-md auicom:px-6 has-[>svg]:auicom:px-4',
        icon: 'auicom:size-9',
        'icon-sm': 'auicom:size-8',
        'icon-lg': 'auicom:size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...(props as any)}
    />
  )
}

export { Button, buttonVariants }
