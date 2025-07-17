// src/hooks/useUniversalAttributes.ts
"use client"

import { useState, useEffect } from 'react'
import { sdk } from '@/lib/config'
import { getAuthHeaders } from '@/lib/data/cookies'

export interface AttributeValue {
  id: string
  value: string
  rank?: number
}

export interface Attribute {
  id: string
  name: string
  handle: string
  description?: string
  is_filterable: boolean
  ui_component: string
  possible_values?: AttributeValue[]
  metadata?: Record<string, unknown>
}

export interface CategorizedAttributes {
  size: Attribute[]
  dimension: Attribute[]
  color: Attribute[]
  other: Attribute[]
  all_filterable: Attribute[]
}

// Default empty state
const defaultAttributes: CategorizedAttributes = {
  size: [],
  dimension: [],
  color: [],
  other: [],
  all_filterable: []
}

export const useUniversalAttributes = (type?: 'size' | 'dimension' | 'color' | 'all') => {
  const [attributes, setAttributes] = useState<CategorizedAttributes>(defaultAttributes)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const queryParams = new URLSearchParams()
        if (type) {
          queryParams.append('type', type)
        }
        
        const url = `/store/attributes/metadata${queryParams.toString() ? `?${queryParams}` : ''}`
        
        let headers = {}
        try {
          headers = await getAuthHeaders()
        } catch (authError) {
          console.warn('Auth headers failed:', authError)
        }
        
        const response = await sdk.client.fetch<{
          attributes: Partial<CategorizedAttributes>
        }>(url, {
          method: 'GET',
          headers,
          next: {
            revalidate: 300, // 5 minutes
            tags: ['attributes']
          }
        })
        
        console.log('[DEBUG][useUniversalAttributes] Fetched attributes:', response.attributes)
        
        // Merge response with default structure, ensuring all properties exist
        setAttributes(prev => ({
          ...defaultAttributes,
          ...prev,
          ...response.attributes
        }))
        
      } catch (fetchError) {
        console.error('useUniversalAttributes fetch error:', fetchError)
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch attributes')
        // Reset to default on error
        setAttributes(defaultAttributes)
      } finally {
        setLoading(false)
      }
    }

    fetchAttributes()
  }, [type])

  return { attributes, loading, error }
}

// Specific hooks for common use cases
export const useSizeAttributes = () => {
  const { attributes, loading, error } = useUniversalAttributes('size')
  return { 
    attributes: attributes.size, 
    loading, 
    error 
  }
}

export const useDimensionAttributes = () => {
  const { attributes, loading, error } = useUniversalAttributes('dimension')
  return { 
    attributes: attributes.dimension, 
    loading, 
    error 
  }
}

export const useColorAttributes = () => {
  const { attributes, loading, error } = useUniversalAttributes('color')
  return { 
    attributes: attributes.color, 
    loading, 
    error 
  }
}

export const useAllFilterableAttributes = () => {
  const { attributes, loading, error } = useUniversalAttributes('all')
  return { 
    attributes: attributes.all_filterable, 
    loading, 
    error 
  }
}