"use client"

import * as React from "react"
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

export type CollapsibleProps = React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root>

export type CollapsibleTriggerProps = React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger>

export type CollapsibleContentProps = React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content>

const Collapsible = React.memo(
  React.forwardRef<
    React.ElementRef<typeof CollapsiblePrimitive.Root>,
    CollapsibleProps
  >(function Collapsible(props, ref) {
    return <CollapsiblePrimitive.Root ref={ref} data-slot="collapsible" {...props} />
  })
)
Collapsible.displayName = "Collapsible"

const CollapsibleTrigger = React.memo(
  React.forwardRef<
    React.ElementRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
    CollapsibleTriggerProps
  >(function CollapsibleTrigger(props, ref) {
    return (
      <CollapsiblePrimitive.CollapsibleTrigger
        ref={ref}
        data-slot="collapsible-trigger"
        {...props}
      />
    )
  })
)
CollapsibleTrigger.displayName = "CollapsibleTrigger"

const CollapsibleContent = React.memo(
  React.forwardRef<
    React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
    CollapsibleContentProps
  >(function CollapsibleContent(props, ref) {
    return (
      <CollapsiblePrimitive.CollapsibleContent
        ref={ref}
        data-slot="collapsible-content"
        {...props}
      />
    )
  })
)
CollapsibleContent.displayName = "CollapsibleContent"

export { Collapsible, CollapsibleTrigger, CollapsibleContent }