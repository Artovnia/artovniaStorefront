"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Link } from "@/components/atoms"
import { signout } from "@/lib/data/customer"
import { cn } from "@/lib/utils"
import { LoginForm } from "@/components/molecules/LoginForm/LoginForm"
import { RegisterForm } from "@/components/molecules/RegisterForm/RegisterForm"
import { Button } from "@/components/atoms"
import {
  OrdersIcon,
  MessagesIcon,
  WishlistIcon,
  SettingsIcon,
  ReturnsIcon,
  AddressesIcon,
  ReviewsIcon,
  LogoutIcon,
  CloseIcon,
  UserIcon
} from "@/components/atoms/icons/mobile-icons"

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
