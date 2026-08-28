"use client"

import * as React from "react"
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

interface ToggleGroupContextValue extends VariantProps<typeof toggleVariants> {}

const ToggleGroupContext = React.createContext<ToggleGroupContextValue>({
  size: "default",
  variant: "default",
})

export interface ToggleGroupProps
  extends React.ComponentProps<typeof ToggleGroupPrimitive.Root>,
    VariantProps<typeof toggleVariants> {}

const ToggleGroup = React.memo(function ToggleGroup({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: ToggleGroupProps) {
  const contextValue = React.useMemo<ToggleGroupContextValue>(
    () => ({ variant, size }),
    [variant, size]
  )

  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        "group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={contextValue}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
})

export interface ToggleGroupItemProps
  extends React.ComponentProps<typeof ToggleGroupPrimitive.Item>,
    VariantProps<typeof toggleVariants> {}

const ToggleGroupItem = React.memo(function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext)

  const resolvedVariant = context.variant || variant
  const resolvedSize = context.size || size

  const computedClassName = React.useMemo(
    () =>
      cn(
        toggleVariants({
          variant: resolvedVariant,
          size: resolvedSize,
        }),
        "min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
        className
      ),
    [resolvedVariant, resolvedSize, className]
  )

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={resolvedVariant}
      data-size={resolvedSize}
      className={computedClassName}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})

export { ToggleGroup, ToggleGroupItem }