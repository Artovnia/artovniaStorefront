// src/lib/data/attributes.ts
"use server"

import { sdk } from "../config"
import { getAuthHeaders } from "./cookies"
import { Attribute, AttributeValue, PhysicalAttribute, ProductAttributeValue } from "@/types/attributes"

/**
 * Get default physical attributes - async function wrapper to comply with 'use server'
 */
export async function getDefaultPhysicalAttributes(): Promise<Record<string, PhysicalAttribute>> {
  return {
    weight: { min: 0, max: 1000, unit: 'g' },
    length: { min: 0, max: 100, unit: 'cm' },
    height: { min: 0, max: 100, unit: 'cm' },
    width: { min: 0, max: 100, unit: 'cm' }
  }
}

/**
 * Fetches all attributes from the store API with optional filtering
 */
export const fetchAttributes = async (options: {
  handle?: string
  is_filterable?: boolean
} = {}): Promise<Attribute[]> => {
  try {
    // Build query params
    const queryParams: Record<string, string> = {}
    
    if (options.handle) {
      queryParams.handle = options.handle
    }
    
    if (options.is_filterable !== undefined) {
      queryParams.is_filterable = options.is_filterable.toString()
    }
    
    // Get authentication headers
    const headers = {
      ...(await getAuthHeaders()),
    }
    
    // Fetch attributes using SDK client
    const response = await sdk.client.fetch<{
      attributes: Attribute[]
      count: number
    }>(`/store/attributes`, {
      method: "GET",
      query: queryParams,
      headers,
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: ['attributes'],
      }
    })
    
    if (response.attributes && Array.isArray(response.attributes)) {
      return response.attributes
    }
    
    return []
    
  } catch (error) {
    console.error('Error fetching attributes:', error)
    return []
  }
}

/**
 * Fetches a single attribute by ID
 */
export const fetchAttributeById = async (id: string): Promise<Attribute | null> => {
  try {
    // Get authentication headers
    const headers = {
      ...(await getAuthHeaders()),
    }
    
    // Fetch attribute by ID using SDK client
    const response = await sdk.client.fetch<{
      attribute: Attribute
    }>(`/store/attributes/${id}`, {
      method: "GET",
      headers,
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: ['attributes', `attribute-${id}`],
      }
    })
    
    if (response.attribute) {
      return response.attribute
    }
    
    return null
    
  } catch (error) {
    console.error(`Error fetching attribute with ID ${id}:`, error)
    return null
  }
}

/**
 * Fetches attributes for a specific product
 */
export const fetchProductAttributes = async (productId: string): Promise<ProductAttributeValue[]> => {
  try {
    // Get authentication headers
    const headers = {
      ...(await getAuthHeaders()),
    }
    
    // Fetch product attributes using SDK client
    const response = await sdk.client.fetch<{
      attribute_values: ProductAttributeValue[]
    }>(`/store/products/${productId}/attributes`, {
      method: "GET",
      headers,
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: ['product-attributes', `product-${productId}`],
      }
    })
    
    if (response.attribute_values && Array.isArray(response.attribute_values)) {
      return response.attribute_values
    }
    
    return []
    
  } catch (error) {
    console.error(`Error fetching attributes for product ${productId}:`, error)
    return []
  }
}

/**
 * Fetches attributes for a specific product variant
 */
export const fetchVariantAttributes = async (
  productId: string, 
  variantId: string
): Promise<ProductAttributeValue[]> => {
  try {
    // Get authentication headers
    const headers = {
      ...(await getAuthHeaders()),
    }
    
    // Fetch variant attributes using SDK client
    const response = await sdk.client.fetch<{
      attribute_values: ProductAttributeValue[]
    }>(`/store/products/${productId}/variants/${variantId}/attributes`, {
      method: "GET",
      headers,
      next: {
        revalidate: 3600, // Cache for 1 hour
        tags: ['variant-attributes', `variant-${variantId}`],
      }
    })
    
    if (response.attribute_values && Array.isArray(response.attribute_values)) {
      return response.attribute_values
    }
    
    return []
    
  } catch (error) {
    console.error(`Error fetching attributes for variant ${variantId} of product ${productId}:`, error)
    return []
  }
}

/**
 * Fetches all dimension attributes (height, width, length, weight)
 */
export const fetchDimensionAttributes = async (): Promise<Attribute[]> => {
  try {
    const dimensionHandles = ['width', 'height', 'length', 'weight']
    const dimensionPromises = dimensionHandles.map(handle => 
      fetchAttributes({ handle })
    )
    
    const results = await Promise.all(dimensionPromises)
    // Flatten results and filter out empty arrays
    return results.flat().filter(Boolean)
    
  } catch (error) {
    console.error('Error fetching dimension attributes:', error)
    return []
  }
}

/**
 * Fetches size attributes with physical dimensions for filters
 */
export const fetchFilterAttributes = async (): Promise<{
  sizeAttribute: Attribute | null
  dimensionAttributes: Attribute[]
  physicalAttributes: Record<string, PhysicalAttribute>
}> => {
  try {
    // Fetch size and dimension attributes in parallel
    const [sizeAttributes, dimensionAttributes] = await Promise.all([
      fetchAttributes({ handle: 'size', is_filterable: true }),
      fetchDimensionAttributes()
    ])

    const sizeAttribute = sizeAttributes.find(attr => attr.handle === 'size') || null

    // Build physical attributes map
    const physicalAttributes: Record<string, PhysicalAttribute> = {}
    
    // Get default physical attributes
    const defaultPhysicalAttrs = await getDefaultPhysicalAttributes()
    
    dimensionAttributes.forEach(attr => {
      if (attr.possible_values && attr.possible_values.length > 0) {
        // Try to extract numeric ranges from possible values
        const numericValues = attr.possible_values
          .map(pv => parseFloat(pv.value))
          .filter(val => !isNaN(val))
        
        if (numericValues.length > 0) {
          physicalAttributes[attr.handle] = {
            min: Math.min(...numericValues),
            max: Math.max(...numericValues),
            unit: defaultPhysicalAttrs[attr.handle]?.unit || 'unit'
          }
        }
      } else {
        // Use default physical attributes if no values found
        if (defaultPhysicalAttrs[attr.handle]) {
          physicalAttributes[attr.handle] = defaultPhysicalAttrs[attr.handle]
        }
      }
    })

    return {
      sizeAttribute,
      dimensionAttributes,
      physicalAttributes
    }
    
  } catch (error) {
    console.error('Error fetching filter attributes:', error)
    return {
      sizeAttribute: null,
      dimensionAttributes: [],
      physicalAttributes: {}
    }
  }
}