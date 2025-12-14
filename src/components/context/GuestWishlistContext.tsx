"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

const GUEST_WISHLIST_KEY = '_medusa_guest_wishlist'

interface GuestWishlistContextType {
  guestWishlist: string[]
  addToGuestWishlist: (productId: string) => void
  removeFromGuestWishlist: (productId: string) => void
  isInGuestWishlist: (productId: string) => boolean
  clearGuestWishlist: () => void
  getGuestWishlistCount: () => number
}

const GuestWishlistContext = createContext<GuestWishlistContextType | null>(null)

export const useGuestWishlist = () => {
  const context = useContext(GuestWishlistContext)
  if (!context) {
    throw new Error('useGuestWishlist must be used within GuestWishlistProvider')
  }
  return context
}

export const GuestWishlistProvider = ({ children }: { children: ReactNode }) => {
  const [guestWishlist, setGuestWishlist] = useState<string[]>([])
  const [isClient, setIsClient] = useState(false)

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    setIsClient(true)
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(GUEST_WISHLIST_KEY)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setGuestWishlist(Array.isArray(parsed) ? parsed : [])
        } catch (error) {
          console.error('Failed to parse guest wishlist:', error)
          localStorage.removeItem(GUEST_WISHLIST_KEY)
        }
      }
    }
  }, [])

  // Save to localStorage whenever wishlist changes
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(guestWishlist))
    }
  }, [guestWishlist, isClient])

  const addToGuestWishlist = (productId: string) => {
    setGuestWishlist(prev => {
      if (prev.includes(productId)) return prev
      return [...prev, productId]
    })
  }

  const removeFromGuestWishlist = (productId: string) => {
    setGuestWishlist(prev => prev.filter(id => id !== productId))
  }

  const isInGuestWishlist = (productId: string) => {
    return guestWishlist.includes(productId)
  }

  const clearGuestWishlist = () => {
    setGuestWishlist([])
    if (isClient && typeof window !== 'undefined') {
      localStorage.removeItem(GUEST_WISHLIST_KEY)
    }
  }

  const getGuestWishlistCount = () => {
    return guestWishlist.length
  }

  return (
    <GuestWishlistContext.Provider
      value={{
        guestWishlist,
        addToGuestWishlist,
        removeFromGuestWishlist,
        isInGuestWishlist,
        clearGuestWishlist,
        getGuestWishlistCount,
      }}
    >
      {children}
    </GuestWishlistContext.Provider>
  )
}
