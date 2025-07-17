"use client"

import React from "react"
import { HttpTypes } from "@medusajs/types"
import { VariantSelectionProvider } from "@/components/context/VariantSelectionContext"
import "@/types/medusa" // Import extended types

// A client component that wraps the content with the VariantSelectionProvider
export const ProductDetailsClient = ({
  children,
  initialVariantId,
}: {
  children: React.ReactNode
  initialVariantId?: string
}) => {
  return (
    <VariantSelectionProvider initialVariantId={initialVariantId}>
      {children}
    </VariantSelectionProvider>
  )
}
