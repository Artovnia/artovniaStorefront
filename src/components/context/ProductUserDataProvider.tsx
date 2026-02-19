"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { HttpTypes } from "@medusajs/types"
import { SerializableWishlist } from "@/types/wishlist"

interface ProductUserData {
  customer: HttpTypes.StoreCustomer | null
  wishlist: SerializableWishlist[]
  isAuthenticated: boolean
  isEligibleForReview: boolean
  hasPurchased: boolean
  isLoading: boolean
}

const defaultUserData: ProductUserData = {
  customer: null,
  wishlist: [],
  isAuthenticated: false,
  isEligibleForReview: false,
  hasPurchased: false,
  isLoading: true,
}

const ProductUserDataContext = createContext<ProductUserData>(defaultUserData)

export function useProductUserData() {
  return useContext(ProductUserDataContext)
}

interface ProductUserDataProviderProps {
  productId: string
  children: ReactNode
}

/**
 * Client-side provider for user-specific data on product pages.
 * 
 * This component fetches user data (customer, wishlist, review eligibility)
 * on the client side, which allows the product page to be statically cached
 * via ISR while still showing personalized content after hydration.
 * 
 * Benefits:
 * - Product page can use ISR caching (revalidate = 300)
 * - User data loads after initial render (~200ms)
 * - No `noStore()` needed, which was killing ISR
 */
export function ProductUserDataProvider({ 
  productId, 
  children 
}: ProductUserDataProviderProps) {
  const [userData, setUserData] = useState<ProductUserData>(defaultUserData)

  useEffect(() => {
    let isMounted = true

    const fetchUserData = async () => {
      try {
        // Step 1: Check authentication first — skip all other calls for guests
        const customerResult = await fetch("/api/customer", {
          credentials: "include",
          cache: "no-store",
        }).then(r => r.ok ? r.json() : null).catch(() => null)

        if (!isMounted) return

        const customer = customerResult || null

        if (!customer) {
          // Guest user — no need to fetch wishlist or review eligibility
          setUserData({
            customer: null,
            wishlist: [],
            isAuthenticated: false,
            isEligibleForReview: false,
            hasPurchased: false,
            isLoading: false,
          })
          return
        }

        // Step 2: Authenticated user — fetch wishlist and eligibility in parallel
        const [wishlistResponse, eligibilityResponse] = await Promise.allSettled([
          fetch("/api/wishlists", {
            credentials: "include",
            cache: "no-store",
          }).then(r => r.ok ? r.json() : { wishlists: [] }),

          fetch(`/api/review-eligibility/${productId}`, {
            credentials: "include",
            cache: "no-store",
          }).then(r => r.ok ? r.json() : { isEligible: false, hasPurchased: false }),
        ])

        if (!isMounted) return

        const wishlistData = wishlistResponse.status === "fulfilled" ? wishlistResponse.value : { wishlists: [] }
        const eligibility = eligibilityResponse.status === "fulfilled"
          ? eligibilityResponse.value
          : { isEligible: false, hasPurchased: false }

        setUserData({
          customer,
          wishlist: wishlistData?.wishlists || [],
          isAuthenticated: true,
          isEligibleForReview: eligibility?.isEligible || false,
          hasPurchased: eligibility?.hasPurchased || false,
          isLoading: false,
        })
      } catch (error) {
        console.error("Failed to fetch user data:", error)
        if (isMounted) {
          setUserData(prev => ({ ...prev, isLoading: false }))
        }
      }
    }

    fetchUserData()

    return () => {
      isMounted = false
    }
  }, [productId])

  return (
    <ProductUserDataContext.Provider value={userData}>
      {children}
    </ProductUserDataContext.Provider>
  )
}
