"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

export interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number | null
  max?: number
}

const Progress = React.memo(
  React.forwardRef<
    React.ElementRef<typeof ProgressPrimitive.Root>,
    ProgressProps
  >(({ className, value, max = 100, ...props }, ref) => {
    const validValue = typeof value === "number" && !Number.isNaN(value) ? value : 0
    const clampedValue = Math.min(Math.max(validValue, 0), max)
    const percentage = max > 0 ? (clampedValue / max) * 100 : 0
    const transformValue = `translateX(-${100 - percentage}%)`

    return (
      <ProgressPrimitive.Root
        ref={ref}
        data-slot="progress"
        aria-valuenow={clampedValue}
        aria-valuemax={max}
        aria-valuemin={0}
        className={cn(
          "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="bg-primary h-full w-full flex-1 transition-transform duration-300 ease-in-out will-change-transform"
          style={{ transform: transformValue }}
        />
      </ProgressPrimitive.Root>
    )
  })
)

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }