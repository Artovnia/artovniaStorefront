"use client"

import NextLink from "next/link"
import { ReactNode } from "react"

interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string
  children: ReactNode
  className?: string
  prefetch?: boolean
}

/**
 * Enhanced Link component that enables prefetching by default
 * This improves navigation performance by preloading page data
 */
export const Link = ({
  href,
  children,
  className,
  prefetch = true, // Enable prefetching by default
  ...props
}: LinkProps) => {
  return (
    <NextLink href={href} className={className} prefetch={prefetch} {...props}>
      {children}
    </NextLink>
  )
}

export default Link
