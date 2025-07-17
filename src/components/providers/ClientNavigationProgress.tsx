"use client"

import dynamic from "next/dynamic"

// Dynamically import the NavigationProgress component
const NavigationProgress = dynamic(
  () => import("./NavigationProgress").then(mod => mod.NavigationProgress),
  { ssr: false }
)

export function ClientNavigationProgress() {
  return <NavigationProgress />
}
