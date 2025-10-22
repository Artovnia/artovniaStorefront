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

const CartIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
)

const MarketplaceIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
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

      {/* Floating Menu with artistic modern design */}
      {isMenuOpen && (
        <div className="fixed bottom-24 left-4 right-4 mx-auto max-w-sm z-50 md:hidden animate-in slide-in-from-bottom-4 duration-300 max-h-[calc(100vh-8rem)] flex flex-col">
          {/* Main Container with gradient background */}
          <div className="relative bg-gradient-to-br from-[#F4F0EB] via-[#F4F0EB] to-[#F4F0EB] backdrop-blur-xl rounded-[32px] shadow-2xl border border-[#3B3634]/40 overflow-hidden flex flex-col max-h-full">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#F4F0EB]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F4F0EB]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            
            {/* Scrollable Content Container */}
            <div className="relative overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-thin scrollbar-thumb-[#3B3634]/20 scrollbar-track-transparent hover:scrollbar-thumb-[#3B3634]/30 p-6" style={{ WebkitOverflowScrolling: 'touch' }}>
              {/* Header with artistic touch */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-[#3B3634] mb-0.5">Twoje Konto</h3>
                  <div className="h-1 w-16 bg-gradient-to-r from-[#F4F0EB] to-[#3B3634]/30 rounded-full" />
                </div>
                <button 
                  onClick={closeMenu}
                  className="w-10 h-10 rounded-2xl bg-[#3B3634]/10 hover:bg-[#3B3634]/20 flex items-center justify-center transition-all duration-200 hover:rotate-90"
                >
                  <CloseIcon className="w-5 h-5 text-[#3B3634]" />
                </button>
              </div>

              {/* Navigation Grid - Main Items */}
              <div className="space-y-3 mb-6">
                {mobileNavigationItems.map((item, index) => {
                  const isActive = pathname === item.href || (item.href === '/user' && pathname === '/user')
                  const showNotification = item.hasNotification && hasUnreadMessages && item.href === '/user/messages'
                  const IconComponent = item.icon
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      style={{
                        animationDelay: `${index * 50}ms`,
                      }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 group relative overflow-hidden animate-in fade-in slide-in-from-left-4",
                        isActive 
                          ? "bg-[#3B3634] text-white shadow-lg shadow-[#3B3634]/20" 
                          : "bg-white/60 backdrop-blur-sm text-[#3B3634] hover:bg-white hover:shadow-md border border-[#3B3634]/5"
                      )}
                    >
                      {/* Decorative gradient on hover */}
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#3B3634]/0 via-[#3B3634]/5 to-[#3B3634]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                      
                      <div className={cn(
                        "relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-white/20" 
                          : "bg-[#3B3634]/5 group-hover:bg-[#3B3634]/10 group-hover:scale-110"
                      )}>
                        <IconComponent className="w-5 h-5 relative z-10" />
                        {showNotification && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                        )}
                      </div>
                      
                      <span className="font-semibold text-[15px] relative z-10">
                        {item.label}
                      </span>

                      {/* Arrow indicator for active */}
                      {isActive && (
                        <div className="ml-auto">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>

              {/* Divider with decorative style */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#3B3634]/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-primary px-4 text-xs font-medium text-[#3B3634]/90">
                    WIĘCEJ
                  </span>
                </div>
              </div>

              {/* Secondary Items */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {mobileSecondaryItems.map((item, index) => {
                  const isActive = pathname === item.href
                  const IconComponent = item.icon
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMenu}
                      style={{
                        animationDelay: `${(mobileNavigationItems.length + index) * 50}ms`,
                      }}
                      className={cn(
                        "flex flex-col items-center justify-center gap-3 p-5 rounded-2xl transition-all duration-200 group relative overflow-hidden animate-in fade-in zoom-in-95",
                        isActive 
                          ? "bg-[#3B3634] text-white shadow-lg shadow-[#3B3634]/20" 
                          : "bg-white/60 backdrop-blur-sm text-[#3B3634] hover:bg-white hover:shadow-md border border-[#3B3634]/5"
                      )}
                    >
                      {!isActive && (
                        <div className="absolute inset-0 bg-gradient-to-br from-[#3B3634]/0 to-[#3B3634]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      )}
                      
                      <div className={cn(
                        "relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200",
                        isActive 
                          ? "bg-white/20" 
                          : "bg-[#3B3634]/5 group-hover:bg-[#3B3634]/10 group-hover:scale-110"
                      )}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      
                      <span className="text-sm font-semibold text-center relative z-10">
                        {item.label}
                      </span>
                    </Link>
                  )
                })}
              </div>
              
              {/* Logout Button with artistic styling */}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center w-full p-4 text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-2xl transition-all duration-200 font-semibold shadow-lg shadow-red-500/30 hover:shadow-red-600/40 hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                <LogoutIcon className="w-5 h-5 mr-2 relative z-10" />
                <span className="relative z-10">Wyloguj się</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden ">
        <div className="bg-transparent">
          <div className="flex items-end justify-center w-full">
            {/* Navigation Dock Container */}
            <div className="relative flex items-center justify-around bg-white px-6 py-3 shadow-lg w-full" style={{ borderTopLeftRadius: '24px', borderTopRightRadius: '24px' }}>
              {/* Home Button */}
              <Link
                href="/"
                className="flex flex-col items-center justify-center gap-1 flex-1 group"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 transition-all duration-200 group-hover:text-[#3B3634]">
                  <HomeIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-gray-600 group-hover:text-[#3B3634]">Home</span>
              </Link>

              {/* Search Button */}
              <button
                onClick={toggleSearch}
                className="flex flex-col items-center justify-center gap-1 flex-1 group"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 transition-all duration-200 group-hover:text-[#3B3634]">
                  <SearchIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-gray-600 group-hover:text-[#3B3634]">Szukaj</span>
              </button>

              {/* Marketplace Button - Elevated Center */}
              <Link
                href="/categories"
                className="flex flex-col items-center justify-center gap-1 -mt-8 flex-1 group"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ring-4 ring-white bg-[#3B3634] group-hover:scale-105">
                    <MarketplaceIcon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <span className="text-[10px] font-medium text-gray-600 mt-1">Sklep</span>
              </Link>

              {/* Cart Button */}
              <Link
                href="/cart"
                className="flex flex-col items-center justify-center gap-1 flex-1 group"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-gray-600 transition-all duration-200 group-hover:text-[#3B3634]">
                  <CartIcon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-medium text-gray-600 group-hover:text-[#3B3634]">Koszyk</span>
              </Link>

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
                    <CloseIcon className="w-5 h-5" />
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
    </>
  )
}