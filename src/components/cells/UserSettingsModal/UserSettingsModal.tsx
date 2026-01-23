"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
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
  UserIcon,
} from "@/components/atoms/icons/mobile-icons"

interface NavigationItem {
  label: string
  href: string
  icon: ({ className }: { className?: string }) => JSX.Element
  hasNotification?: boolean
}

// Top bar quick actions (secondary)
const quickActionItems: NavigationItem[] = [
  {
    label: "Adresy",
    href: "/user/addresses",
    icon: AddressesIcon,
  },
  {
    label: "Zwroty",
    href: "/user/returns",
    icon: ReturnsIcon,
  },
  {
    label: "Recenzje",
    href: "/user/reviews",
    icon: ReviewsIcon,
  },
]

// Main menu items (primary)
const menuItems: NavigationItem[] = [
  {
    label: "Zamówienia",
    href: "/user/orders",
    icon: OrdersIcon,
  },
  {
    label: "Wiadomości",
    href: "/user/messages",
    icon: MessagesIcon,
    hasNotification: true,
  },
  {
    label: "Ulubione",
    href: "/user/wishlist",
    icon: WishlistIcon,
  },
  {
    label: "Ustawienia konta",
    href: "/user/settings",
    icon: SettingsIcon,
  },
]

type ModalView = "settings" | "login" | "register"

interface UserSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  hasUnreadMessages: boolean
  isAuthenticated: boolean
  onAuthStateChange: () => void | Promise<void>
}

export const UserSettingsModal = ({
  isOpen,
  onClose,
  hasUnreadMessages,
  isAuthenticated,
  onAuthStateChange,
}: UserSettingsModalProps) => {
  const pathname = usePathname()
  const [currentView, setCurrentView] = useState<ModalView>("settings")

  const handleClose = () => {
    setCurrentView("settings")
    onClose()
  }

  const handleLogout = async () => {
    try {
      handleClose()
      await signout()
    } catch (error) {
      console.error("[UserSettingsModal] Logout error:", error)
    }
  }

  const handleShowLogin = () => setCurrentView("login")
  const handleShowRegister = () => setCurrentView("register")
  const handleBackToSettings = () => setCurrentView("settings")

  const handleAuthSuccess = async () => {
    await onAuthStateChange()
    setCurrentView("settings")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Full Screen Container */}
      <div className="relative h-full w-full bg-[#F4F0EB] overflow-hidden">
       

        {/* Scrollable Content */}
        <div
          className="relative h-full overflow-y-auto px-5 pb-8"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {/* Header with Close Button */}
          <div className="sticky top-0 z-10 bg-[#F4F0EB] pt-4 pb-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-instrument serif tracking-tight text-[#3B3634] uppercase">
                {currentView === "login"
                  ? "Logowanie"
                  : currentView === "register"
                    ? "Rejestracja"
                    : "Twój Profil"}
              </h1>
              <button
                onClick={handleClose}
                className="w-10 h-10 flex items-center justify-center rounded-full 
                         bg-[#3B3634]/5 hover:bg-[#3B3634]/10 transition-colors"
              >
                <CloseIcon className="w-5 h-5 text-[#3B3634]" />
              </button>
            </div>

            {/* Back button for auth views */}
            {(currentView === "login" || currentView === "register") && (
              <button
                onClick={handleBackToSettings}
                className="mt-2 text-sm text-[#3B3634]/60 hover:text-[#3B3634] 
                         flex items-center gap-1 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Powrót
              </button>
            )}
          </div>

          {/* Login View */}
          {currentView === "login" && (
            <div className="mt-8">
              <LoginForm compact={true} onSuccess={handleAuthSuccess} />
            </div>
          )}

          {/* Register View */}
          {currentView === "register" && (
            <div className="mt-8">
              <RegisterForm compact={true} onSuccess={handleAuthSuccess} />
            </div>
          )}

          {/* Settings View - Not Authenticated */}
          {currentView === "settings" && !isAuthenticated && (
            <div className="mt-8 space-y-8">
              {/* Logo/Brand Mark - Fixed sizing */}
              <div className="flex justify-center">
                <div
                  className="w-24 h-24 rounded-full border-2 border-[#3B3634]/20 
                              flex items-center justify-center bg-white/50 overflow-hidden"
                >
                  {/* SVG logo that fills the circle */}
                  <Image
                    src="/A.svg"
                    alt="Artovnia"
                    width={190}
                    height={190}
                    className="w-full h-full object-contain scale-[0.85]" 
                  />
                </div>
              </div>

              {/* Welcome Message */}
              <div className="text-center">
                <h2 className="heading-lg tracking-tight text-[#3B3634] mb-2">
                  Witaj w Artovnii
                </h2>
                <p className="text-[#3B3634]/60 text-sm leading-relaxed">
                  Zaloguj się, aby odkrywać unikalne dzieła rzemieślników
                </p>
              </div>

              {/* Auth Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleShowLogin}
                  className="w-full py-4 bg-[#3B3634] text-[#F4F0EB]
                           font-medium hover:bg-[#2d2a28] transition-colors"
                >
                  Zaloguj się
                </Button>
                <Button
                  onClick={handleShowRegister}
                  variant="tonal"
                  className="w-full py-4 border-2 border-[#3B3634]/30 text-[#3B3634] 
                            font-medium hover:border-[#3B3634]/50 
                           hover:bg-[#3B3634]/5 transition-all"
                >
                  Załóż konto
                </Button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-[#3B3634]/10" />
                <span className="text-xs text-[#3B3634]/40 uppercase tracking-wider">
                  Korzyści
                </span>
                <div className="flex-1 h-px bg-[#3B3634]/10" />
              </div>

              {/* Benefits */}
              <div className="space-y-4">
                {[
                  { text: "-Śledź swoje zamówienia i artystów" },
                  { text: "-Zapisuj ulubione dzieła" },
                  { text: "-Szybsze zakupy z zapisanymi adresami" },
                  { text: "-Otrzymuj rekomendacje dopasowane do Ciebie" },
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-sm text-[#3B3634]/70">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Settings View - Authenticated */}
          {currentView === "settings" && isAuthenticated && (
            <div className="mt-6 space-y-6">
              {/* Logo/Avatar Area - Fixed sizing */}
              <div className="flex justify-center">
                <div
                  className="w-20 h-20 rounded-full border-2 border-[#3B3634]/20 
                              flex items-center justify-center bg-white/50 shadow-sm overflow-hidden"
                >
                  <Image
                    src="/A.svg"
                    alt="Artovnia"
                    width={210}
                    height={210}
                    className="w-full h-full object-fill scale-[0.85] "
                  />
                </div>
              </div>

              {/* Quick Actions - Top Bar (Adresy, Zwroty, Recenzje) */}
              <div
                className="flex items-center justify-between w-full p-1 
                            bg-white/60 rounded-full border border-[#3B3634]/10"
              >
                {quickActionItems.map((item) => {
                  const isActive = pathname === item.href
                  const IconComponent = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleClose}
                      className={cn(
                        "relative flex-1 flex items-center justify-center gap-1.5",
                        "px-2 py-2.5 rounded-full",
                        "text-xs font-medium transition-all duration-200",
                        "whitespace-nowrap overflow-hidden",
                        isActive
                          ? "bg-[#3B3634] text-[#F4F0EB]"
                          : "text-[#3B3634]/70 hover:text-[#3B3634] hover:bg-[#3B3634]/5"
                      )}
                    >
                      <IconComponent className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )
                })}
              </div>

              {/* Divider */}
              <div className="h-px bg-[#3B3634]/10" />

              {/* Main Menu Items (Zamówienia, Wiadomości, Ulubione, Ustawienia) */}
              <div className="space-y-2">
                {menuItems.map((item, index) => {
                  const isActive = pathname === item.href
                  const showNotification =
                    item.hasNotification &&
                    hasUnreadMessages &&
                    item.href === "/user/messages"
                  const IconComponent = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleClose}
                      style={{ animationDelay: `${index * 50}ms` }}
                      className={cn(
                        "flex items-center gap-4 px-4 py-3.5 ",
                        "transition-all duration-200 animate-in fade-in slide-in-from-bottom-2",
                        isActive
                          ? "bg-[#3B3634] text-[#F4F0EB]"
                          : " border border-[#3B3634]/10 text-[#3B3634]",
                        "hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                      )}
                    >
                      <div
                          className="relative w-10 h-10  flex items-center justify-center flex-shrink-0"
                      >
                        <IconComponent className="w-5 h-5" />
                        {showNotification && (
                          <span
                            className="absolute -top-1 -right-1 w-3 h-3 
                                       bg-red-500 rounded-full border-2 border-[#F4F0EB]"
                          />
                        )}
                      </div>
                      <span className="font-medium flex-1">{item.label}</span>
                      <svg
                        className="w-5 h-5 opacity-40 flex-shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  )
                })}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full py-3.5 
                         text-red-600  bg-red-50/50
                         border border-red-200 
                         hover:bg-red-100/90 transition-all duration-200
                         font-medium"
              >
                <LogoutIcon className="w-5 h-5" />
                <span>Wyloguj się</span>
              </button>
            </div>
          )}

          {/* Bottom Spacing for Safe Area */}
          <div className="h-8" />
        </div>
      </div>
    </div>
  )
}