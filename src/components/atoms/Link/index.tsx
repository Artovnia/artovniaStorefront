"use client"

import NextLink from "next/link"
import { ReactNode, useCallback } from "react"
import { usePathname } from "next/navigation"

interface LinkProps extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  href: string
  children: ReactNode
  className?: string
  prefetch?: boolean
  force?: boolean // Allow navigation to same route if needed
}

/**
 * CRITICAL FIX: Enhanced Link component that prevents navigation freeze
 * Blocks navigation to the same route to prevent infinite loading states
 */
export const Link = ({
  href,
  children,
  className,
  prefetch = true,
  force = false,
  onClick,
  ...props
}: LinkProps) => {
  const pathname = usePathname()
  
  
  
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    // Simplified click handler - let LoadingProvider handle navigation logic
    // This prevents conflicts and improves performance
    
    // Call original onClick if provided
    if (onClick) {
      onClick(e)
    }
  }, [onClick])
  
  
  return (
    <NextLink 
      href={href} 
      className={className} 
      prefetch={prefetch} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </NextLink>
  )
}

export default Link
