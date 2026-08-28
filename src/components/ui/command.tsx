"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export interface CommandProps extends React.ComponentProps<typeof CommandPrimitive> {}

const Command = React.memo(
  React.forwardRef<HTMLDivElement, CommandProps>(function Command(
    { className, ...props },
    ref
  ) {
    return (
      <CommandPrimitive
        ref={ref}
        data-slot="command"
        className={cn(
          "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md",
          className
        )}
        {...props}
      />
    )
  })
)
Command.displayName = "Command"

export interface CommandDialogProps extends React.ComponentProps<typeof Dialog> {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
}

const CommandDialog = React.memo(function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = true,
  ...props
}: CommandDialogProps) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent
        className={cn("overflow-hidden p-0", className)}
        showCloseButton={showCloseButton}
      >
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
})
CommandDialog.displayName = "CommandDialog"

export interface CommandInputProps extends React.ComponentProps<typeof CommandPrimitive.Input> {}

const CommandInput = React.memo(
  React.forwardRef<HTMLInputElement, CommandInputProps>(function CommandInput(
    { className, ...props },
    ref
  ) {
    return (
      <div
        data-slot="command-input-wrapper"
        className="flex h-9 items-center gap-2 border-b px-3"
      >
        <SearchIcon className="size-4 shrink-0 opacity-50" aria-hidden="true" />
        <CommandPrimitive.Input
          ref={ref}
          data-slot="command-input"
          className={cn(
            "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      </div>
    )
  })
)
CommandInput.displayName = "CommandInput"

export interface CommandListProps extends React.ComponentProps<typeof CommandPrimitive.List> {}

const CommandList = React.memo(
  React.forwardRef<HTMLDivElement, CommandListProps>(function CommandList(
    { className, ...props },
    ref
  ) {
    return (
      <CommandPrimitive.List
        ref={ref}
        data-slot="command-list"
        className={cn(
          "max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto",
          className
        )}
        {...props}
      />
    )
  })
)
CommandList.displayName = "CommandList"

export interface CommandEmptyProps extends React.ComponentProps<typeof CommandPrimitive.Empty> {}

const CommandEmpty = React.memo(
  React.forwardRef<HTMLDivElement, CommandEmptyProps>(function CommandEmpty(
    props,
    ref
  ) {
    return (
      <CommandPrimitive.Empty
        ref={ref}
        data-slot="command-empty"
        className="py-6 text-center text-sm"
        {...props}
      />
    )
  })
)
CommandEmpty.displayName = "CommandEmpty"

export interface CommandGroupProps extends React.ComponentProps<typeof CommandPrimitive.Group> {}

const CommandGroup = React.memo(
  React.forwardRef<HTMLDivElement, CommandGroupProps>(function CommandGroup(
    { className, ...props },
    ref
  ) {
    return (
      <CommandPrimitive.Group
        ref={ref}
        data-slot="command-group"
        className={cn(
          "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
          className
        )}
        {...props}
      />
    )
  })
)
CommandGroup.displayName = "CommandGroup"

export interface CommandSeparatorProps extends React.ComponentProps<typeof CommandPrimitive.Separator> {}

const CommandSeparator = React.memo(
  React.forwardRef<HTMLDivElement, CommandSeparatorProps>(function CommandSeparator(
    { className, ...props },
    ref
  ) {
    return (
      <CommandPrimitive.Separator
        ref={ref}
        data-slot="command-separator"
        className={cn("bg-border -mx-1 h-px", className)}
        {...props}
      />
    )
  })
)
CommandSeparator.displayName = "CommandSeparator"

export interface CommandItemProps extends React.ComponentProps<typeof CommandPrimitive.Item> {}

const CommandItem = React.memo(
  React.forwardRef<HTMLDivElement, CommandItemProps>(function CommandItem(
    { className, ...props },
    ref
  ) {
    return (
      <CommandPrimitive.Item
        ref={ref}
        data-slot="command-item"
        className={cn(
          "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
        {...props}
      />
    )
  })
)
CommandItem.displayName = "CommandItem"

export interface CommandShortcutProps extends React.ComponentProps<"span"> {}

const CommandShortcut = React.memo(
  React.forwardRef<HTMLSpanElement, CommandShortcutProps>(function CommandShortcut(
    { className, ...props },
    ref
  ) {
    return (
      <span
        ref={ref}
        data-slot="command-shortcut"
        className={cn(
          "text-muted-foreground ml-auto text-xs tracking-widest",
          className
        )}
        {...props}
      />
    )
  })
)
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}