"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { HttpTypes } from "@medusajs/types"
import {
  CartDropdown,
  MobileNavbar,
  Navbar,
} from "@/components/cells"
import { SafeI18nLink as Link } from "@/components/atoms/SafeI18nLink"
import { UserDropdown } from "@/components/cells/UserDropdown/UserDropdown"
import { CountrySelectorWrapper } from "@/components/cells/CountrySelector/CountrySelectorWrapper"
import { WishlistBadge } from "@/components/cells/WishlistBadge"
import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"

/**
 * OPTIMIZED HEADER
 * 
 * Performance Strategy:
 * 1. Receives categories and regions from server-side layout (cached)
 * 2. Fetches only user data in background
 * 3. No duplicate category or region requests
 * 
 * Result: Instant navigation render with proper caching
 */
interface HeaderProps {
  categories?: HttpTypes.StoreProductCategory[]
  regions?: HttpTypes.StoreRegion[]
}

export const Header = ({ 
  categories: initialCategories = [],
  regions: initialRegions = []
}: HeaderProps) => {
  const [categories] = useState(initialCategories)
  const [regions] = useState(initialRegions)
  const [user, setUser] = useState<any>(null)
  const [wishlistCount, setWishlistCount] = useState(0)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    // Load user data in background after initial render
    // Also refresh when auth state changes (login/logout)
    let mounted = true

    const loadData = async () => {
      try {
        // Force no-cache on refresh to get latest auth state
        const useCache = refreshTrigger === 0
        const userData = await retrieveCustomer(useCache).catch((error) => {
          if (error?.status !== 401) {
            console.error("Error retrieving customer:", error)
          }
          return null
        })

        if (!mounted) return

        // Update user
        setUser(userData)

        // Fetch wishlist if user is authenticated
        if (userData) {
          try {
            const response = await getUserWishlists()
            if (mounted) {
              setWishlistCount(response?.wishlists?.[0]?.products?.length || 0)
            }
          } catch (error) {
            console.error("Error retrieving wishlists:", error)
          }
        } else {
          // Clear wishlist count when user is logged out
          if (mounted) {
            setWishlistCount(0)
          }
        }
      } catch (error) {
        console.error("Error loading header data:", error)
      }
    }

    const timer = setTimeout(loadData, 0)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [refreshTrigger])

  // Listen for auth state changes (login/logout)
useEffect(() => {
  const handleAuthChange = () => {
    setRefreshTrigger(prev => prev + 1)
  }

    
    // Listen for custom auth events
    window.addEventListener('auth:login', handleAuthChange)
    window.addEventListener('auth:logout', handleAuthChange)

    return () => {
     
      window.removeEventListener('auth:login', handleAuthChange)
      window.removeEventListener('auth:logout', handleAuthChange)
    }
  }, [])

  const allCategoriesWithTree: HttpTypes.StoreProductCategory[] = categories || []

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-sm">
      <div className="flex  lg:py-2 max-w-[1920px] mx-auto">
        <div className="flex items-center gap-2 lg:gap-4 lg:w-1/3 py-4 ml-4">
          {/* Country Selector - Left side - Hide on mobile, show on xl and up */}
          <div className="hidden xl:block">
            <CountrySelectorWrapper regions={regions} />
          </div>
          
          <MobileNavbar
            categories={allCategoriesWithTree}
          />
        </div>
        <div className="flex lg:justify-center lg:w-1/3 items-center  lg:pl-0">
          <Link href="/" className="text-2xl font-bold">
            <Image
              src="/Logo.svg"
              width={163}
              height={52}
              alt="Logo"
              priority
            />
          </Link>
        </div>
        <div className="flex items-center justify-end gap-3 lg:gap-4 w-full lg:w-1/3 py-2 lg:py-4 mr-4">
          {/* Store link - Icon on mobile, text on desktop */}
          <a 
            href="https://artovniapanel.netlify.app/login" 
            className="hidden xl:inline text-lg font-medium hover:text-action transition-colors hover:underline  items-center"
            aria-label="Załóż sklep"
          >
          
            <span className="mr-4">TWÓJ SKLEP</span>
          </a>
          
          {/* Hide user dropdown and wishlist on mobile - handled by bottom navigation */}
          <div className="flex items-center gap-2 lg:gap-4">
           
            <WishlistBadge user={user} databaseWishlistCount={wishlistCount} />
          </div>

          <CartDropdown />
          <div className="hidden xl:inline items-center gap-2 lg:gap-4">
            <UserDropdown user={user} />
          </div>
        </div>
      </div>
      <Navbar categories={allCategoriesWithTree} />
    </header>
  )
}