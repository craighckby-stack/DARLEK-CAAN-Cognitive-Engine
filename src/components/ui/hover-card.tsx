"use client"

import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

export type HoverCardProps = React.ComponentProps<typeof HoverCardPrimitive.Root>
export type HoverCardTriggerProps = React.ComponentProps<typeof HoverCardPrimitive.Trigger>
export type HoverCardContentProps = React.ComponentProps<typeof HoverCardPrimitive.Content>

const HoverCard = React.memo(function HoverCard(
  props: HoverCardProps
): React.JSX.Element {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />
})
HoverCard.displayName = "HoverCard"

const HoverCardTrigger = React.memo(function HoverCardTrigger(
  props: HoverCardTriggerProps
): React.JSX.Element {
  return (
    <HoverCardPrimitive.Trigger data-slot="hover-card-trigger" {...props} />
  )
})
HoverCardTrigger.displayName = "HoverCardTrigger"

const HoverCardContent = React.memo(function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: HoverCardContentProps): React.JSX.Element {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Content
        data-slot="hover-card-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-64 origin-(--radix-hover-card-content-transform-origin) rounded-md border p-4 shadow-md outline-hidden",
          className
        )}
        {...props}
      />
    </HoverCardPrimitive.Portal>
  )
})
HoverCardContent.displayName = "HoverCardContent"

export { HoverCard, HoverCardTrigger, HoverCardContent }