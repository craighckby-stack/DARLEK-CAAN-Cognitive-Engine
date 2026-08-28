"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

export interface PopoverProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root> {}

const Popover = React.memo(
  React.forwardRef<
    React.ElementRef<typeof PopoverPrimitive.Root>,
    PopoverProps
  >(({ ...props }, ref) => (
    <PopoverPrimitive.Root data-slot="popover" {...props} />
  ))
)
Popover.displayName = "Popover"

export interface PopoverTriggerProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger> {}

const PopoverTrigger = React.memo(
  React.forwardRef<
    React.ElementRef<typeof PopoverPrimitive.Trigger>,
    PopoverTriggerProps
  >(({ ...props }, ref) => (
    <PopoverPrimitive.Trigger ref={ref} data-slot="popover-trigger" {...props} />
  ))
)
PopoverTrigger.displayName = PopoverPrimitive.Trigger.displayName

export interface PopoverContentProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {}

const PopoverContent = React.memo(
  React.forwardRef<
    React.ElementRef<typeof PopoverPrimitive.Content>,
    PopoverContentProps
  >(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-72 origin-(--radix-popover-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  ))
)
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export interface PopoverAnchorProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Anchor> {}

const PopoverAnchor = React.memo(
  React.forwardRef<
    React.ElementRef<typeof PopoverPrimitive.Anchor>,
    PopoverAnchorProps
  >(({ ...props }, ref) => (
    <PopoverPrimitive.Anchor ref={ref} data-slot="popover-anchor" {...props} />
  ))
)
PopoverAnchor.displayName = PopoverPrimitive.Anchor.displayName

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor }