import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.ComponentProps<"div"> {
  asChild?: boolean
}

export type CardHeaderProps = React.ComponentProps<"div">
export type CardTitleProps = React.ComponentProps<"div">
export type CardDescriptionProps = React.ComponentProps<"div">
export type CardActionProps = React.ComponentProps<"div">
export type CardContentProps = React.ComponentProps<"div">
export type CardFooterProps = React.ComponentProps<"div">

const Card = React.memo(
  React.forwardRef<HTMLDivElement, CardProps>(
    function Card({ className, ...props }, ref) {
      return (
        <div
          ref={ref}
          data-slot="card"
          className={cn(
            "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
            className
          )}
          {...props}
        />
      )
    }
  )
)

const CardHeader = React.memo(
  React.forwardRef<HTMLDivElement, CardHeaderProps>(
    function CardHeader({ className, ...props }, ref) {
      return (
        <div
          ref={ref}
          data-slot="card-header"
          className={cn(
            "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
            className
          )}
          {...props}
        />
      )
    }
  )
)

const CardTitle = React.memo(
  React.forwardRef<HTMLDivElement, CardTitleProps>(
    function CardTitle({ className, ...props }, ref) {
      return (
        <div
          ref={ref}
          data-slot="card-title"
          className={cn("leading-none font-semibold", className)}
          {...props}
        />
      )
    }
  )
)

const CardDescription = React.memo(
  React.forwardRef<HTMLDivElement, CardDescriptionProps>(
    function CardDescription({ className, ...props }, ref) {
      return (
        <div
          ref={ref}
          data-slot="card-description"
          className={cn("text-muted-foreground text-sm", className)}
          {...props}
        />
      )
    }
  )
)

const CardAction = React.memo(
  React.forwardRef<HTMLDivElement, CardActionProps>(
    function CardAction({ className, ...props }, ref) {
      return (
        <div
          ref={ref}
          data-slot="card-action"
          className={cn(
            "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
            className
          )}
          {...props}
        />
      )
    }
  )
)

const CardContent = React.memo(
  React.forwardRef<HTMLDivElement, CardContentProps>(
    function CardContent({ className, ...props }, ref) {
      return (
        <div
          ref={ref}
          data-slot="card-content"
          className={cn("px-6", className)}
          {...props}
        />
      )
    }
  )
)

const CardFooter = React.memo(
  React.forwardRef<HTMLDivElement, CardFooterProps>(
    function CardFooter({ className, ...props }, ref) {
      return (
        <div
          ref={ref}
          data-slot="card-footer"
          className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
          {...props}
        />
      )
    }
  )
)

Card.displayName = "Card"
CardHeader.displayName = "CardHeader"
CardTitle.displayName = "CardTitle"
CardDescription.displayName = "CardDescription"
CardAction.displayName = "CardAction"
CardContent.displayName = "CardContent"
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}