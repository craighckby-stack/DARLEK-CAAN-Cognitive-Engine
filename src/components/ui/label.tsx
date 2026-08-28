"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

export type LabelProps = React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & {
  className?: string
}

const DEFAULT_LABEL_CLASSES = "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50" as const

const Label = React.memo(
  React.forwardRef<
    React.ElementRef<typeof LabelPrimitive.Root>,
    LabelProps
  >(({ className, ...props }, ref) => {
    const computedClassName = React.useMemo(() => {
      return cn(DEFAULT_LABEL_CLASSES, className)
    }, [className])

    return (
      <LabelPrimitive.Root
        ref={ref}
        data-slot="label"
        className={computedClassName}
        {...props}
      />
    )
  })
)

Label.displayName = LabelPrimitive.Root.displayName || "Label"

export { Label }