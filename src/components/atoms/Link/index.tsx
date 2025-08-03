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
 * Optimized Link component that works seamlessly with LoadingProvider
 * Removed complex click handling to prevent conflicts and improve performance
 */
export const Link = ({
  href,
  children,
  className,
  prefetch = true,
  onClick,
  ...props
}: LinkProps) => {
  return (
    <NextLink 
      href={href} 
      className={className} 
      prefetch={prefetch} 
      onClick={onClick}
      {...props}
    >
      {children}
    </NextLink>
  )
}

export default Link
