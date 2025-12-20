"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { retrieveReturnReasons } from '@/lib/data/orders'

interface ReturnReason {
  id: string
  value?: string
  label: string
  description?: string | null
}

interface ReturnReasonsContextType {
  returnReasons: ReturnReason[]
  isLoading: boolean
  error: Error | null
}

const ReturnReasonsContext = createContext<ReturnReasonsContextType>({
  returnReasons: [],
  isLoading: true,
  error: null,
})

export const useReturnReasons = () => useContext(ReturnReasonsContext)

export const ReturnReasonsProvider = ({ children }: { children: ReactNode }) => {
  const [returnReasons, setReturnReasons] = useState<ReturnReason[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchReasons = async () => {
      try {
        setIsLoading(true)
        const reasons = await retrieveReturnReasons()
        
        const formattedReasons: ReturnReason[] = reasons.map((reason: any) => ({
          id: reason.id,
          value: reason.value || reason.id,
          label: reason.label || reason.id,
          description: reason.description
        }))
        
        setReturnReasons(formattedReasons)
        setError(null)
      } catch (err) {
        console.error('Error fetching return reasons:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch return reasons'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchReasons()
  }, [])

  return (
    <ReturnReasonsContext.Provider value={{ returnReasons, isLoading, error }}>
      {children}
    </ReturnReasonsContext.Provider>
  )
}
