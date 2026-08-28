"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

/**
 * Enhanced Toaster component leveraging next-themes and Sonner.
 * Optimized with memoization, strict type safety, and robust runtime fallbacks.
 */
const Toaster = React.memo(({ theme: propTheme, ...props }: ToasterProps): React.JSX.Element => {
  const { theme = "system" } = useTheme()

  const resolvedTheme = React.useMemo(() => {
    if (propTheme) return propTheme
    if (theme === "light" || theme === "dark" || theme === "system") {
      return theme as ToasterProps["theme"]
    }
    return "system"
  }, [propTheme, theme])

  const toasterStyles = React.useMemo(
    () =>
      ({
        "--normal-bg": "var(--popover)",
        "--normal-text": "var(--popover-foreground)",
        "--normal-border": "var(--border)",
      } as React.CSSProperties),
    []
  )

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      style={toasterStyles}
      {...props}
    />
  )
})

Toaster.displayName = "Toaster"

export { Toaster }