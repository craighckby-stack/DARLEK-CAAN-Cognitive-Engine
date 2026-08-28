"use client"

import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio"
import type { ComponentPropsWithoutRef, ElementRef, ReactElement } from "react"
import { forwardRef } from "react"

export type AspectRatioProps = ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root>
export type AspectRatioElement = ElementRef<typeof AspectRatioPrimitive.Root>

export const AspectRatio = forwardRef<AspectRatioElement, AspectRatioProps>(
  function AspectRatio({ ...props }, ref): ReactElement {
    return <AspectRatioPrimitive.Root ref={ref} data-slot="aspect-ratio" {...props} />
  }
)

AspectRatio.displayName = "AspectRatio"

export { AspectRatio }