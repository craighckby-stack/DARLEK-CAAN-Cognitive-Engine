"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"

import { cn } from "@/lib/utils"

export interface AvatarProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  readonly className?: string
}

export interface AvatarImageProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {
  readonly className?: string
}

export interface AvatarFallbackProps extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  readonly className?: string
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, ...props }, ref) => {
  const computedClassName = React.useMemo(
    () =>
      cn(
        "relative flex size-8 shrink-0 overflow-hidden rounded-full",
        className
      ),
    [className]
  )

  return (
    <AvatarPrimitive.Root
      ref={ref}
      data-slot="avatar"
      className={computedClassName}
      {...props}
    />
  )
})
Avatar.displayName = AvatarPrimitive.Root.displayName || "Avatar"

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  AvatarImageProps
>(({ className, ...props }, ref) => {
  const computedClassName = React.useMemo(
    () => cn("aspect-square size-full", className),
    [className]
  )

  return (
    <AvatarPrimitive.Image
      ref={ref}
      data-slot="avatar-image"
      className={computedClassName}
      {...props}
    />
  )
})
AvatarImage.displayName = AvatarPrimitive.Image.displayName || "AvatarImage"

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, ...props }, ref) => {
  const computedClassName = React.useMemo(
    () =>
      cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      ),
    [className]
  )

  return (
    <AvatarPrimitive.Fallback
      ref={ref}
      data-slot="avatar-fallback"
      className={computedClassName}
      {...props}
    />
  )
})
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName || "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }