import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../lib/utils"

const typographyVariants = cva("", {
  variants: {
    variant: {
      "display-xl": "text-7xl font-bold leading-[72px] tracking-[-1.677px]",
      "display-l": "text-6xl font-bold leading-[60px] tracking-[-1.4px]",
      "display-m": "text-5xl font-bold leading-[48px] tracking-[-1.2px]",
      "display-s": "text-4xl font-bold leading-[40px] tracking-[-1px]",
      "heading-xl": "text-5xl font-bold leading-[48px] tracking-[0.5px]",
      "heading-l": "text-4xl font-bold leading-[40px] tracking-[0.37px]",
      "heading-m": "text-3xl font-bold leading-[32px] tracking-[0.3px]",
      "heading-s": "text-2xl font-bold leading-[28px] tracking-[0.25px]",
      "heading-xs": "text-xl font-bold leading-[24px] tracking-[0.2px]",
      "body-l": "text-lg font-light leading-[29.25px] tracking-[-0.44px]",
      "body-m": "text-base font-normal leading-[24px]",
      "body-s": "text-sm font-normal leading-[20px]",
      "caption": "text-xs font-normal leading-[16px]",
      "overline": "text-xs font-medium leading-[16px] uppercase tracking-[1px]",
    },
    color: {
      default: "text-foreground",
      primary: "text-primary",
      secondary: "text-secondary-foreground",
      muted: "text-muted-foreground",
      accent: "text-accent-foreground",
      destructive: "text-destructive",
      white: "text-white",
      inherit: "text-inherit",
    },
  },
  defaultVariants: {
    variant: "body-m",
    color: "default",
  },
})

export interface TypographyProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    VariantProps<typeof typographyVariants> {
  /**
   * HTML element to render (h1, h2, h3, h4, h5, h6, p, span, div, etc.)
   * @default "p"
   */
  as?: keyof JSX.IntrinsicElements
  /**
   * Children content
   */
  children?: React.ReactNode
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, color, as: Component = "p", children, ...props }, ref) => {
    return React.createElement(
      Component,
      {
        className: cn(typographyVariants({ variant, color }), className),
        ref,
        ...props,
      },
      children
    )
  }
)

Typography.displayName = "Typography"

export { Typography, typographyVariants }
