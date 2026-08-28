"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface TableProps extends React.ComponentProps<"table"> {
  containerClassName?: string
}

const Table = React.memo(
  React.forwardRef<HTMLTableElement, TableProps>(
    ({ className, containerClassName, ...props }, ref) => (
      <div
        data-slot="table-container"
        className={cn("relative w-full overflow-x-auto", containerClassName)}
      >
        <table
          ref={ref}
          data-slot="table"
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        />
      </div>
    )
  )
)
Table.displayName = "Table"

const TableHeader = React.memo(
  React.forwardRef<HTMLTableSectionElement, React.ComponentProps<"thead">>(
    ({ className, ...props }, ref) => (
      <thead
        ref={ref}
        data-slot="table-header"
        className={cn("[&_tr]:border-b", className)}
        {...props}
      />
    )
  )
)
TableHeader.displayName = "TableHeader"

const TableBody = React.memo(
  React.forwardRef<HTMLTableSectionElement, React.ComponentProps<"tbody">>(
    ({ className, ...props }, ref) => (
      <tbody
        ref={ref}
        data-slot="table-body"
        className={cn("[&_tr:last-child]:border-0", className)}
        {...props}
      />
    )
  )
)
TableBody.displayName = "TableBody"

const TableFooter = React.memo(
  React.forwardRef<HTMLTableSectionElement, React.ComponentProps<"tfoot">>(
    ({ className, ...props }, ref) => (
      <tfoot
        ref={ref}
        data-slot="table-footer"
        className={cn(
          "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
          className
        )}
        {...props}
      />
    )
  )
)
TableFooter.displayName = "TableFooter"

const TableRow = React.memo(
  React.forwardRef<HTMLTableRowElement, React.ComponentProps<"tr">>(
    ({ className, ...props }, ref) => (
      <tr
        ref={ref}
        data-slot="table-row"
        className={cn(
          "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
          className
        )}
        {...props}
      />
    )
  )
)
TableRow.displayName = "TableRow"

const TableHead = React.memo(
  React.forwardRef<HTMLTableCellElement, React.ComponentProps<"th">>(
    ({ className, ...props }, ref) => (
      <th
        ref={ref}
        data-slot="table-head"
        className={cn(
          "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
          className
        )}
        {...props}
      />
    )
  )
)
TableHead.displayName = "TableHead"

const TableCell = React.memo(
  React.forwardRef<HTMLTableCellElement, React.ComponentProps<"td">>(
    ({ className, ...props }, ref) => (
      <td
        ref={ref}
        data-slot="table-cell"
        className={cn(
          "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
          className
        )}
        {...props}
      />
    )
  )
)
TableCell.displayName = "TableCell"

const TableCaption = React.memo(
  React.forwardRef<HTMLTableCaptionElement, React.ComponentProps<"caption">>(
    ({ className, ...props }, ref) => (
      <caption
        ref={ref}
        data-slot="table-caption"
        className={cn("text-muted-foreground mt-4 text-sm", className)}
        {...props}
      />
    )
  )
)
TableCaption.displayName = "TableCaption"

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}