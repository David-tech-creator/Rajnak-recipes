import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm font-serif-sc uppercase tracking-[0.18em] text-[12px] ring-offset-background transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-ink text-cream border border-ink hover:bg-lingon-deep hover:border-lingon-deep",
        destructive: "bg-lingon text-cream border border-lingon hover:bg-lingon-deep hover:border-lingon-deep",
        outline: "border border-ink bg-transparent text-ink hover:bg-ink hover:text-cream",
        secondary: "border border-rule bg-cream text-ink hover:border-ink",
        ghost: "text-ink hover:text-lingon-deep",
        link: "text-ink underline-offset-4 hover:underline hover:text-lingon-deep",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-[11px]",
        lg: "h-12 px-8 text-[13px]",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
