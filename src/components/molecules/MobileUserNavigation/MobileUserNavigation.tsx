"use client"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Link } from "@/components/atoms"
import { getUnreadMessagesCount } from "@/lib/data/actions/messages"
import { signout, retrieveCustomer } from "@/lib/data/customer"
import { cn } from "@/lib/utils"

// Icons for mobile navigation
const OrdersIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
  </svg>
)

const MessagesIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
)

const WishlistIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
)

const SettingsIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3"></circle>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
  </svg>
)

const ReturnsIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 14l-5-5 5-5"></path>
    <path d="M20 20v-7a4 4 0 0 0-4-4H4"></path>
  </svg>
)

const AddressesIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
)

const ReviewsIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
  </svg>
)

const LogoutIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
    <polyline points="16,17 21,12 16,7"></polyline>
    <line x1="21" y1="12" x2="9" y2="12"></line>
  </svg>
)

const HomeIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9,22 9,12 15,12 15,22"></polyline>
  </svg>
)

//actually it is user icon
const MenuIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
)

const CloseIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

const SearchIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
)

interface NavigationItem {
  label: string
  href: string
  icon: ({ className }: { className?: string }) => JSX.Element
  hasNotification?: boolean
}

const mobileNavigationItems: NavigationItem[] = [
  {
    label: "Zamówienia",
    href: "/user/orders",
    icon: OrdersIcon,
  },
  {
    label: "Zwroty",
    href: "/user/returns",
    icon: ReturnsIcon,
  },
  {
    label: "Wiadomości",
    href: "/user/messages",
    icon: MessagesIcon,
    hasNotification: true,
  },
  {
    label: "Adresy",
    href: "/user/addresses",
    icon: AddressesIcon,
  },
  {
    label: "Recenzje",
    href: "/user/reviews",
    icon: ReviewsIcon,
  },
]

const mobileSecondaryItems: NavigationItem[] = [
  {
    label: "Lista życzeń",
    href: "/user/wishlist",
    icon: WishlistIcon,
  },
  {
    label: "Ustawienia",
    href: "/user/settings",
    icon: SettingsIcon,
  },
]

export const MobileUserNavigation = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [hasUnreadMessages, setHasUnreadMessages] = useState<boolean>(false)
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false)
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const customer = await retrieveCustomer()
        setIsAuthenticated(!!customer)
      } catch {
        setIsAuthenticated(false)
      }
    }
    
    checkAuth()
  }, [])

  // Fetch unread messages count - only for authenticated users
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
    
    // Initial check
    checkUnreadMessages()
    
    // Poll every 2 minutes instead of 30 seconds to reduce server load
    const intervalId = setInterval(checkUnreadMessages, 120000)
    window.addEventListener('messages:marked-as-read', handleMarkedAsRead)
    
    return () => {
      clearInterval(intervalId)
      window.removeEventListener('messages:marked-as-read', handleMarkedAsRead)
    }
  }, [isAuthenticated])

  const handleLogout = async () => {
    try {
      await signout()
      setIsMenuOpen(false)
    } catch (error) {
    }
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
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

  const allItems = [...mobileNavigationItems, ...mobileSecondaryItems]

  return (
    <>
      {/* Backdrop with blur effect for menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={closeMenu}
        />
      )}

      {/* Backdrop with blur effect for search */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
          onClick={closeSearch}
        />
      )}

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed bottom-4 left-4 right-4 mx-auto max-w-sm bg-primary backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 z-50 md:hidden overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
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
                  className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#3B3634] focus:border-transparent text-gray-900 placeholder-gray-500"
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

      {/* Floating Menu with improved design */}
      {isMenuOpen && (
        <div className="fixed bottom-24 left-4 right-4 mx-auto max-w-sm bg-primary backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 z-50 md:hidden overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-[#3B3634]">Menu użytkownika</h3>
              <button 
                onClick={closeMenu}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <CloseIcon className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {allItems.map((item) => {
                const isActive = pathname === item.href || (item.href === '/user' && pathname === '/user')
                const showNotification = item.hasNotification && hasUnreadMessages && item.href === '/user/messages'
                const IconComponent = item.icon
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className={cn(
                      "flex flex-col items-center p-4 rounded-2xl transition-all duration-200 relative group hover:scale-105",
                      isActive 
                        ? "bg-[#3B3634] text-white shadow-lg" 
                        : "bg-white text-[#3B3634] hover:bg-gray-100"
                    )}
                  >
                    <div className="relative mb-2">
                      <IconComponent className="w-6 h-6" />
                      {showNotification && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                      )}
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">
                      {item.label}
                    </span>
                    {showNotification && (
                      <div className="absolute top-2 right-2">
                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-full p-4 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-all duration-200 font-medium"
            >
              <LogoutIcon className="w-5 h-5 mr-2" />
              <span>Wyloguj się</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden">
        <div className="bg-primary border-t border-gray-200/50">
          <div className="flex items-center justify-center py-2">
            {/* Navigation Dock Container */}
            <div className="flex items-center space-x-2 bg-[#3B3634]/90 backdrop-blur-xl rounded-full px-6 py-2 shadow-2xl">
              {/* Home Button */}
              <Link
                href="/"
                className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
              >
                <HomeIcon className="w-5 h-5" />
              </Link>

              {/* Search Button */}
              <button
                onClick={toggleSearch}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 relative",
                  isSearchOpen
                    ? "bg-[#3B3634] text-white shadow-lg scale-110"
                    : "bg-white/10 hover:bg-white/20 text-white"
                )}
              >
                <SearchIcon className="w-5 h-5" />
              </button>

              {/* User Menu Toggle */}
              <button
                onClick={toggleMenu}
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 relative",
                  isMenuOpen
                    ? "bg-[#3B3634] text-white scale-110 rotate-180"
                    : "bg-white/10 hover:bg-white/20 text-white hover:scale-110"
                )}
              >
                {isMenuOpen ? (
                  <CloseIcon className="w-5 h-5" />
                ) : (
                  <MenuIcon className="w-5 h-5" />
                )}
                {hasUnreadMessages && !isMenuOpen && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-gray-900" />
                )}
              </button>
            </div>
          </div>
          
          {/* Safe area padding for devices with home indicator */}
          <div className="h-safe-area-inset-bottom" />
        </div>
      </div>
    </>
  )
}