"use client"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { Link } from "@/components/atoms"
import { getUnreadMessagesCount } from "@/lib/data/actions/messages"
import { retrieveCustomer } from "@/lib/data/customer"
import { cn } from "@/lib/utils"
import { MobileRegionModal } from "@/components/cells/MobileRegionModal/MobileRegionModal"
import { listRegions } from "@/lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import { useCart } from "@/components/context/CartContext"
import { ProfileIcon } from "@/icons"
import { GlobeIcon, MarketplaceIcon, MenuIcon } from "@/components/atoms/icons/mobile-icons"

// ✅ LAZY LOAD: UserSettingsModal - Only loads when user opens menu
// Saves ~15-20KB on initial bundle, improves mobile performance
const UserSettingsModal = dynamic(
  () => import('@/components/cells/UserSettingsModal').then(m => ({ default: m.UserSettingsModal })),
  { 
    ssr: false,
    loading: () => null
  }
)

export const MobileUserNavigation = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { cart, refreshCart } = useCart()
  const [hasUnreadMessages, setHasUnreadMessages] = useState<boolean>(false)
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false)
  const [isRegionModalOpen, setIsRegionModalOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [regions, setRegions] = useState<HttpTypes.StoreRegion[]>([])

  // ✅ OPTIMIZED: Defer heavy API calls until after initial render (improves perceived performance)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const customer = await retrieveCustomer()
        setIsAuthenticated(!!customer)
      } catch {
        setIsAuthenticated(false)
      }
    }
    
    const fetchRegions = async () => {
      try {
        const regionsData = await listRegions()
        setRegions(regionsData || [])
      } catch (error) {
        console.error('Error fetching regions:', error)
      }
    }
    
    // Defer API calls until browser is idle (after initial render)
    // This allows the UI to render immediately, then fetch data
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const idleCallbackId = requestIdleCallback(() => {
        checkAuth()
        fetchRegions()
      }, { timeout: 500 }) // Fallback after 500ms if browser never idle
      
      return () => cancelIdleCallback(idleCallbackId)
    } else {
      // Fallback for browsers without requestIdleCallback (Safari)
      const timeoutId = setTimeout(() => {
        checkAuth()
        fetchRegions()
      }, 100) // Small delay to allow render
      
      return () => clearTimeout(timeoutId)
    }
  }, [])

  // ✅ OPTIMIZED: Defer unread messages check - only for authenticated users
  useEffect(() => {
    if (!isAuthenticated) {
      setHasUnreadMessages(false)
      return
    }

    const checkUnreadMessages = async () => {
      try {
        const unreadCount = await getUnreadMessagesCount()
        setHasUnreadMessages(unreadCount > 0)
      } catch (error) {
        // Silent fail - authentication check already handled in getUnreadMessagesCount
        setHasUnreadMessages(false)
      }
    }
    
    const handleMarkedAsRead = () => {
      checkUnreadMessages()
    }
    
    // Defer initial check until browser is idle
    let idleCallbackId: number | undefined
    let timeoutId: NodeJS.Timeout | undefined
    const intervalId = setInterval(checkUnreadMessages, 120000)
    
    if (typeof window !== 'undefined') {
      window.addEventListener('messages:marked-as-read', handleMarkedAsRead)
      
      if ('requestIdleCallback' in window) {
        idleCallbackId = requestIdleCallback(() => {
          checkUnreadMessages()
        }, { timeout: 1000 }) // Check after 1s if browser never idle
      } else {
        // Fallback for browsers without requestIdleCallback (Safari)
        timeoutId = setTimeout(checkUnreadMessages, 200)
      }
    }
    
    return () => {
      if (idleCallbackId !== undefined) {
        cancelIdleCallback(idleCallbackId)
      }
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }
      clearInterval(intervalId)
      if (typeof window !== 'undefined') {
        window.removeEventListener('messages:marked-as-read', handleMarkedAsRead)
      }
    }
  }, [isAuthenticated])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  // Re-check authentication when menu opens to detect login/logout changes
  useEffect(() => {
    if (isMenuOpen) {
      recheckAuthentication()
    }
  }, [isMenuOpen])

  // Function to re-check authentication (can be called from child components)
  const recheckAuthentication = async () => {
    try {
      const customer = await retrieveCustomer()
      setIsAuthenticated(!!customer)
    } catch {
      setIsAuthenticated(false)
    }
  }

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
  }

  const closeSearch = () => {
    setIsSearchOpen(false)
    setSearchQuery("")
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/categories?query=${encodeURIComponent(searchQuery.trim())}`)
      closeSearch()
    } else {
      router.push(`/categories`)
      closeSearch()
    }
  }

  return (
    <>
      {/* User Settings Modal - Only render when open for better performance */}
      {isMenuOpen && (
        <UserSettingsModal 
          isOpen={isMenuOpen}
          onClose={closeMenu}
          hasUnreadMessages={hasUnreadMessages}
          isAuthenticated={isAuthenticated}
          onAuthStateChange={recheckAuthentication}
        />
      )}

      {/* Bottom Navigation Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden ">
        <div className="bg-transparent">
          <div className="flex items-end justify-center w-full">
            {/* Navigation Dock Container - 3 items only */}
            <div className="relative flex items-center justify-around bg-white px-6  shadow-lg w-full" style={{ borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
{/* Region Selector Button */}
              <button
                onClick={() => setIsRegionModalOpen(true)}
                className="flex flex-col items-center justify-center mb-1 flex-1 group"
              >
                <div className="w-10 h-6 rounded-full flex items-center justify-center text-gray-600 transition-all duration-200 group-hover:text-[#3B3634]">
                  <GlobeIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-gray-600 group-hover:text-[#3B3634]">Region</span>
              </button>

              {/* Marketplace Button - Elevated Center */}
              <a
                href="https://artovniapanel.netlify.app/login" 
                className="flex flex-col items-center justify-center gap-1 -mt-8 flex-1 group"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ring-4 ring-white bg-[#3B3634] group-hover:scale-105">
                    <MarketplaceIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <span className="text-[10px] font-medium text-gray-600 mt-1">Twój sklep</span>
              </a>

              

              {/* Profile Button */}
              <button
                onClick={toggleMenu}
                className="flex flex-col items-center justify-center mb-1 flex-1 group relative"
              >
                <div className={cn(
                  "w-10 h-6 rounded-full flex items-center justify-center transition-all duration-200",
                  isMenuOpen
                    ? "text-[#3B3634]"
                    : "text-gray-600 group-hover:text-[#3B3634]"
                )}>
                  {isMenuOpen ? (
                    <ProfileIcon  className="w-5 h-5" />
                  ) : (
                    <MenuIcon className="w-5 h-5" />
                  )}
                  {hasUnreadMessages && !isMenuOpen && (
                    <div className="absolute top-0 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-medium",
                  isMenuOpen ? "text-[#3B3634]" : "text-gray-600 group-hover:text-[#3B3634]"
                )}>Profil</span>
              </button>
            </div>
          </div>
          
          {/* Safe area padding for devices with home indicator */}
          <div className="h-safe-area-inset-bottom bg-white" />
        </div>
      </div>

      {/* Region Selection Modal */}
      <MobileRegionModal 
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        regions={regions}
        currentRegionId={cart?.region_id}
        onRegionChanged={refreshCart}
      />
    </>
  )
}