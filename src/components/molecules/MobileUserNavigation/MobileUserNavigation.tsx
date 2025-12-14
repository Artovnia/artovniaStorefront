"use client"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Link } from "@/components/atoms"
import { getUnreadMessagesCount } from "@/lib/data/actions/messages"
import { signout, retrieveCustomer } from "@/lib/data/customer"
import { cn } from "@/lib/utils"
import { MobileRegionModal } from "@/components/cells/MobileRegionModal/MobileRegionModal"
import { UserSettingsModal } from "@/components/cells/UserSettingsModal"
import { listRegions } from "@/lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import { useCart } from "@/components/context/CartContext"
import { ProfileIcon } from "@/icons"


// Icons for mobile navigation


const HomeIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9,22 9,12 15,12 15,22"></polyline>
  </svg>
)


const CloseIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

const MenuIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const SearchIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
)


const MarketplaceIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
  </svg>
)

const GlobeIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
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
      {/* Backdrop with blur effect for search */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={closeSearch}
        />
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed bottom-4 left-4 right-4 mx-auto max-w-sm bg-primary backdrop-blur-xl rounded-lg shadow-2xl border border-white/20 z-50 md:hidden overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-6">
            {/* Search Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Wyszukaj produkty</h2>
              <button
                onClick={closeSearch}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <CloseIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Wpisz nazwę produktu..."
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B3634] focus:border-transparent text-gray-900 placeholder-gray-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-[#3B3634] text-white rounded-xl hover:bg-[#2d2a28] transition-colors"
                >
                  <SearchIcon className="w-4 h-4" />
                </button>
              </div>
              
              {/* Quick search suggestions could go here */}
              <div className="text-sm text-gray-500 text-center">
                Naciśnij Enter lub kliknij lupę aby wyszukać
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Settings Modal */}
      <UserSettingsModal 
        isOpen={isMenuOpen}
        onClose={closeMenu}
        hasUnreadMessages={hasUnreadMessages}
        isAuthenticated={isAuthenticated}
        onAuthStateChange={recheckAuthentication}
      />

      {/* Bottom Navigation Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden ">
        <div className="bg-transparent">
          <div className="flex items-end justify-center w-full">
            {/* Navigation Dock Container - 3 items only */}
            <div className="relative flex items-center justify-around bg-white px-6 py-3 shadow-lg w-full" style={{ borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
{/* Region Selector Button */}
              <button
                onClick={() => setIsRegionModalOpen(true)}
                className="flex flex-col items-center justify-center gap-1 flex-1 group"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 transition-all duration-200 group-hover:text-[#3B3634]">
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
                className="flex flex-col items-center justify-center gap-1 flex-1 group relative"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
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