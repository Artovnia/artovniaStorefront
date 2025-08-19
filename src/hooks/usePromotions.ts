"use client"

import { useState, useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { sdk } from "@/lib/config"
import { getAuthHeaders } from "@/lib/data/cookies"
import { getPublishableApiKey } from "@/lib/get-publishable-key"

interface Promotion {
  id: string
  code: string
  type: string
  is_automatic: boolean
  application_method?: {
    type: string
    value: number
    target_type: string
    allocation: string
  }
}

interface UsePromotionsReturn {
  promotions: Promotion[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function usePromotions(): UsePromotionsReturn {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPromotions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const headers = await getAuthHeaders()
      const publishableApiKey = await getPublishableApiKey()
      
      const response = await sdk.client.fetch<{
        promotions: Promotion[]
      }>('/store/promotions', {
        method: 'GET',
        query: {
          fields: '*application_method'
        },
        headers: {
          ...headers,
          'x-publishable-api-key': publishableApiKey,
        },
        cache: 'no-cache'
      })

      setPromotions(response.promotions || [])
      
    } catch (err) {
      console.error('usePromotions: Error fetching promotions:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch promotions')
      setPromotions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPromotions()
  }, [])

  return {
    promotions,
    isLoading,
    error,
    refetch: fetchPromotions
  }
}
