"use client"

import React from 'react'
import { Link as I18nLink } from '@/i18n/routing'
import { ComponentProps } from 'react'

interface SafeI18nLinkProps extends ComponentProps<typeof I18nLink> {}

/**
 * Optimized i18n Link component that works seamlessly with LoadingProvider
 * Removed complex click handling to prevent conflicts and improve performance
 */
export const SafeI18nLink = ({
  href,
  children,
  onClick,
  ...props
}: SafeI18nLinkProps) => {
  return (
    <I18nLink 
      href={href}
      onClick={onClick}
      {...props}
    >
      {children}
    </I18nLink>
  )
}

export default SafeI18nLink
