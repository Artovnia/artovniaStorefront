"use client"

import { usePathname, useSearchParams } from "next/navigation"
import NProgress from "nprogress"
import { useEffect } from "react"

// Configure NProgress
import "nprogress/nprogress.css"
NProgress.configure({
  minimum: 0.3,
  easing: "ease",
  speed: 500,
  showSpinner: false,
})

export function NavigationProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // When the route changes, complete any in-progress loading
    NProgress.done()
  }, [pathname, searchParams])

  useEffect(() => {
    const handleRouteChangeStart = () => {
      NProgress.start()
    }

    const handleRouteChangeComplete = () => {
      NProgress.done()
    }

    window.addEventListener("beforeunload", handleRouteChangeStart)
    window.addEventListener("routeChangeStart", handleRouteChangeStart)
    window.addEventListener("routeChangeComplete", handleRouteChangeComplete)
    window.addEventListener("routeChangeError", handleRouteChangeComplete)

    return () => {
      window.removeEventListener("beforeunload", handleRouteChangeStart)
      window.removeEventListener("routeChangeStart", handleRouteChangeStart)
      window.removeEventListener("routeChangeComplete", handleRouteChangeComplete)
      window.removeEventListener("routeChangeError", handleRouteChangeComplete)
    }
  }, [])

  return null
}
