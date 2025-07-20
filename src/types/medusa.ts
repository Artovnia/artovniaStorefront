/**
 * Extended Medusa Types
 * This file extends the types from @medusajs/types to add custom fields
 */

import { HttpTypes } from "@medusajs/types"
import { AdditionalAttributeProps } from "./product"
import { SellerProps } from "./seller"

/**
 * Extension of the Medusa StoreProduct type
 */
declare module "@medusajs/types" {
  namespace HttpTypes {
    interface StoreProduct {
      // Custom fields added in our implementation
      attribute_values?: AdditionalAttributeProps[]
      seller?: SellerProps
      
      // Standard properties that should be in the original type but need to be explicitly declared
      id: string
      handle: string
      thumbnail?: string
      title: string
      images?: any[]
      variants: {
        id: string
        title: string | null
        inventory_quantity?: number
        allow_backorder?: boolean
        manage_inventory?: boolean
        hs_code?: string
        origin_country?: string
        mid_code?: string
        material?: string
        weight?: number
        length?: number
        height?: number
        width?: number
        options?: any[]
        prices?: any[]
        attribute_values?: AdditionalAttributeProps[] // Variant-specific attributes
        [key: string]: any // For other properties that might exist
      }[]
      description?: string
      tags?: { 
        id: string
        value: string
        created_at: string
        updated_at: string
      }[]
      created_at?: string
    }
  }
}
