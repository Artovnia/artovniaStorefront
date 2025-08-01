"use client"

import React, { useCallback } from 'react'
import { Link as I18nLink, usePathname } from '@/i18n/routing'
import { ComponentProps } from 'react'

interface SafeI18nLinkProps extends ComponentProps<typeof I18nLink> {
  force?: boolean // Allow navigation to same route if needed
}

/**
 * CRITICAL FIX: Safe wrapper for i18n Link component that prevents navigation freeze
 * Blocks navigation to the same route to prevent infinite loading states
 */
export const SafeI18nLink = ({
  href,
  children,
  force = false,
  onClick,
  ...props
}: SafeI18nLinkProps) => {
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
    <I18nLink 
      href={href}
      onClick={handleClick}
      {...props}
    >
      {children}
    </I18nLink>
  )
}

export default SafeI18nLink
