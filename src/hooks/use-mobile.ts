import * as React from "react"

const MOBILE_BREAKPOINT = 768 as const

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false
    }
    return window.innerWidth < MOBILE_BREAKPOINT
  })

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const mql: MediaQueryList = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)

    const updateMobileState = (): void => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }

    updateMobileState()

    const handleChange = (event: MediaQueryListEvent): void => {
      setIsMobile(event.matches)
    }

    mql.addEventListener("change", handleChange)

    return () => {
      mql.removeEventListener("change", handleChange)
    }
  }, [])

  return isMobile
}