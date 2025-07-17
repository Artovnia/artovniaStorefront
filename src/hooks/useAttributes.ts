// src/hooks/useAttributes.ts
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
}

export const useAttributes = (options: {
  handle?: string
  is_filterable?: boolean
  searchPattern?: string
} = {}) => {
  const [attributes, setAttributes] = useState<Attribute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const queryParams = new URLSearchParams()
        
        if (options.handle && !options.searchPattern) {
          queryParams.append('handle', options.handle)
        }
        
        if (options.is_filterable !== undefined) {
          queryParams.append('is_filterable', options.is_filterable.toString())
        }
        
        const queryString = queryParams.toString()
        const url = `/store/attributes${queryString ? `?${queryString}` : ''}`
        
        let headers = {}
        try {
          headers = await getAuthHeaders()
        } catch (authError) {
          console.warn('Auth headers failed:', authError)
        }
        
        const response = await sdk.client.fetch<{
          attributes: Attribute[]
          count: number
        }>(url, {
          method: 'GET',
          headers,
        })
        
        let filteredAttributes = response.attributes || []
        
        if (options.searchPattern && filteredAttributes.length > 0) {
          const pattern = options.searchPattern.toLowerCase()
          filteredAttributes = filteredAttributes.filter(attr => 
            attr.name.toLowerCase().includes(pattern) || 
            attr.handle.toLowerCase().includes(pattern)
          )
        }
        
        setAttributes(filteredAttributes)
        
      } catch (fetchError) {
        console.error('useAttributes fetch error:', fetchError)
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to fetch attributes')
        setAttributes([])
      } finally {
        setLoading(false)
      }
    }

    fetchAttributes()
  }, [options.handle, options.is_filterable, options.searchPattern])

  return { attributes, loading, error }
}

// Specific hook for size attributes
export const useSizeAttributes = () => {
  return useAttributes({ 
    is_filterable: true,
    searchPattern: 'rozmiar'
  })
}