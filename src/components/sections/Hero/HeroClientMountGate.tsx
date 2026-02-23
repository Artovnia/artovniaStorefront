"use client"

import { useEffect, useState } from "react"
import { HeroClient } from "./HeroClient"
import type { HeroBanner } from "./Hero"

type HeroClientMountGateProps = {
  banners: HeroBanner[]
  className?: string
  pauseOnHover?: boolean
}

export const HeroClientMountGate = ({
  banners,
  className,
  pauseOnHover,
}: HeroClientMountGateProps) => {
  const [shouldMount, setShouldMount] = useState(false)

  useEffect(() => {
    const scheduleMount = () => setShouldMount(true)
    const w = globalThis as Window & typeof globalThis

    if ("requestIdleCallback" in w && typeof w.requestIdleCallback === "function") {
      const idleId = w.requestIdleCallback(scheduleMount, { timeout: 1200 })

      return () => {
        w.cancelIdleCallback?.(idleId)
      }
    }

    const timeoutId = globalThis.setTimeout(scheduleMount, 0)
    return () => globalThis.clearTimeout(timeoutId)
  }, [])

  if (!shouldMount) {
    return null
  }

  return (
    <HeroClient banners={banners} className={className} pauseOnHover={pauseOnHover} />
  )
}
