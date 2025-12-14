"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Link } from "@/components/atoms"
import { signout } from "@/lib/data/customer"
import { cn } from "@/lib/utils"
import { LoginForm } from "@/components/molecules/LoginForm/LoginForm"
import { RegisterForm } from "@/components/molecules/RegisterForm/RegisterForm"
import { Button } from "@/components/atoms"

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

const CloseIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
)

const UserIcon = ({ className = "" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
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

type ModalView = 'settings' | 'login' | 'register'

interface UserSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  hasUnreadMessages: boolean
  isAuthenticated: boolean
  onAuthStateChange: () => void | Promise<void> // Callback to refresh auth state
}

export const UserSettingsModal = ({ isOpen, onClose, hasUnreadMessages, isAuthenticated, onAuthStateChange }: UserSettingsModalProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const [currentView, setCurrentView] = useState<ModalView>('settings')

  // Reset view when modal closes
  const handleClose = () => {
    setCurrentView('settings')
    onClose()
  }

  const handleLogout = async () => {
    try {
      // Close modal FIRST before signout (signout will redirect and interrupt execution)
      handleClose()
      // signout() will handle redirect to homepage
      await signout()
    } catch (error) {
      console.error('[UserSettingsModal] Logout error:', error)
    }
  }

  const handleShowLogin = () => {
    setCurrentView('login')
  }

  const handleShowRegister = () => {
    setCurrentView('register')
  }

  const handleBackToSettings = () => {
    setCurrentView('settings')
  }

  const handleAuthSuccess = async () => {
    // Refresh auth state after successful login/register
    await onAuthStateChange()
    // Switch back to settings view to show user menu
    setCurrentView('settings')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-all duration-300"
        onClick={handleClose}
      />

      {/* Floating Menu - Centered */}
      <div className="fixed inset-0 z-50 md:hidden flex items-center justify-center p-4">
        <div className="w-full max-w-sm max-h-[calc(100vh-7rem)] animate-in slide-in-from-bottom-4 duration-300 flex flex-col">
          {/* Main Container */}
          <div className="relative bg-gradient-to-br from-[#F4F0EB] via-[#F4F0EB] to-[#F4F0EB] backdrop-blur-xl rounded-sm shadow-2xl border border-[#3B3634]/40 overflow-hidden flex flex-col h-full">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#F4F0EB]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#F4F0EB]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            
            {/* Scrollable Content Container */}
            <div className="relative overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-thin scrollbar-thumb-[#3B3634]/20 scrollbar-track-transparent hover:scrollbar-thumb-[#3B3634]/30 p-4" style={{ WebkitOverflowScrolling: 'touch' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  {currentView === 'login' && (
                    <button
                      onClick={handleBackToSettings}
                      className="mb-2 text-sm text-[#3B3634]/70 hover:text-[#3B3634] flex items-center transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Powrót
                    </button>
                  )}
                  {currentView === 'register' && (
                    <button
                      onClick={handleBackToSettings}
                      className="mb-2 text-sm text-[#3B3634]/70 hover:text-[#3B3634] flex items-center transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Powrót
                    </button>
                  )}
                  <h3 className="text-xl font-bold text-[#3B3634] mb-0.5">
                    {currentView === 'login' ? 'Logowanie' : currentView === 'register' ? 'Rejestracja' : isAuthenticated ? "Twoje Konto" : "Witaj"}
                  </h3>
                  <div className="h-1 w-16 bg-gradient-to-r from-[#F4F0EB] to-[#3B3634]/30 rounded-full" />
                </div>
                <button 
                  onClick={handleClose}
                  className="w-10 h-10 rounded-2xl bg-[#3B3634]/10 hover:bg-[#3B3634]/20 flex items-center justify-center transition-all duration-200 hover:rotate-90"
                >
                  <CloseIcon className="w-5 h-5 text-[#3B3634]" />
                </button>
              </div>

              {/* Login View */}
              {currentView === 'login' && (
                <div>
                  <LoginForm compact={true} onSuccess={handleAuthSuccess} />
                </div>
              )}

              {/* Register View */}
              {currentView === 'register' && (
                <div>
                  <RegisterForm compact={true} onSuccess={handleAuthSuccess} />
                </div>
              )}

              {/* Settings View - Not Authenticated */}
              {currentView === 'settings' && !isAuthenticated && (
                <div className="space-y-4">
                  <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center border border-[#3B3634]/5">
                    <div className="w-16 h-16 mx-auto mb-4 bg-[#3B3634]/10 rounded-full flex items-center justify-center">
                      <UserIcon className="w-8 h-8 text-[#3B3634]" />
                    </div>
                    <h4 className="text-lg font-semibold text-[#3B3634] mb-2">
                      Zaloguj się do swojego konta
                    </h4>
                    <p className="text-sm text-[#3B3634]/70 mb-4">
                      Aby uzyskać dostęp do zamówień, wiadomości i ustawień konta
                    </p>
                    <div className="space-y-3">
                      <Button
                        onClick={handleShowLogin}
                        className="w-full py-3 bg-[#3B3634] text-white hover:bg-[#2d2a28] transition-all duration-200"
                      >
                        Zaloguj się
                      </Button>
                      <Button
                        onClick={handleShowRegister}
                        variant="tonal"
                        className="w-full py-3 border border-[#3B3634] text-[#3B3634] hover:bg-[#3B3634]/5 transition-all duration-200"
                      >
                        Załóż konto
                      </Button>
                    </div>
                  </div>
                  
                  {/* Benefits List */}
                  <div className="p-4 bg-white/40 rounded-lg border border-[#3B3634]/10">
                    <h4 className="text-sm font-semibold text-[#3B3634] mb-3">
                      Korzyści z posiadania konta:
                    </h4>
                    <ul className="space-y-2 text-sm text-[#3B3634]/80">
                      <li className="flex items-center">
                        <span className="text-[#3B3634] mr-2">✓</span>
                        Historia zamówień i śledzenie przesyłek
                      </li>
                      <li className="flex items-center">
                        <span className="text-[#3B3634] mr-2">✓</span>
                        Zapisane adresy dostawy
                      </li>
                      <li className="flex items-center">
                        <span className="text-[#3B3634] mr-2">✓</span>
                        Lista życzeń i ulubione produkty
                      </li>
                      <li className="flex items-center">
                        <span className="text-[#3B3634] mr-2">✓</span>
                        Szybsze zakupy
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Settings View - Authenticated */}
              {currentView === 'settings' && isAuthenticated && (
                /* User Settings for Authenticated Users */
                <>
                  {/* Navigation Grid - Main Items */}
                  <div className="space-y-2 mb-4">
                    {mobileNavigationItems.map((item, index) => {
                      const isActive = pathname === item.href || (item.href === '/user' && pathname === '/user')
                      const showNotification = item.hasNotification && hasUnreadMessages && item.href === '/user/messages'
                      const IconComponent = item.icon
                      
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={onClose}
                          style={{
                            animationDelay: `${index * 50}ms`,
                          }}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-sm transition-all duration-200 group relative overflow-hidden animate-in fade-in slide-in-from-left-4",
                            isActive 
                              ? "bg-[#3B3634] text-white shadow-lg shadow-[#3B3634]/20" 
                              : "bg-white/60 backdrop-blur-sm text-[#3B3634] hover:bg-white hover:shadow-md border border-[#3B3634]/5"
                          )}
                        >
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

                  {/* Divider */}
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
                          onClick={onClose}
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
                  
                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full p-3 text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold shadow-red-500/30 hover:shadow-red-600/40 hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    <LogoutIcon className="w-5 h-5 mr-2 relative z-10" />
                    <span className="relative z-10">Wyloguj się</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
