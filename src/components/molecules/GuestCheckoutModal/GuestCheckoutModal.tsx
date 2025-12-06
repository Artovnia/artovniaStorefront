"use client"

import { Button } from "@/components/atoms"
import { useState } from "react"
import { LoginForm } from "@/components/molecules/LoginForm/LoginForm"
import { RegisterForm } from "@/components/molecules/RegisterForm/RegisterForm"

interface GuestCheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  onGuestCheckout: () => void
}

type ModalView = 'choice' | 'login' | 'register'

export const GuestCheckoutModal = ({
  isOpen,
  onClose,
  onGuestCheckout
}: GuestCheckoutModalProps) => {
  const [currentView, setCurrentView] = useState<ModalView>('choice')

  if (!isOpen) return null

  const handleClose = () => {
    setCurrentView('choice') // Reset to choice view
    // Clear checkout redirect flag when closing modal
    sessionStorage.removeItem('checkout_redirect')
    onClose()
  }

  const handleShowLogin = () => {
    // Set flag so LoginForm knows to redirect to checkout after login
    sessionStorage.setItem('checkout_redirect', 'true')
    setCurrentView('login')
  }

  const handleShowRegister = () => {
    // Set flag so RegisterForm knows to redirect to checkout after registration
    sessionStorage.setItem('checkout_redirect', 'true')
    setCurrentView('register')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleClose}>
      <div 
        className="relative bg-primary rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Choice View */}
        {currentView === 'choice' && (
          <div className="p-8">
            <h2 className="text-2xl font-instrument-serif font-bold text-[#3B3634] mb-6 text-center">
              Jak chcesz kontynuować?
            </h2>
            <div className="space-y-6">
              
              {/* Sign In / Register Options */}
              <div className="border rounded-lg p-6  transition-colors">
                <h3 className="text-lg font-semibold text-[#3B3634] mb-2">
                  Zaloguj się lub załóż konto
                </h3>
                <p className="text-sm text-[#3B3634] mb-4">
                  Śledź swoje zamówienia, zapisuj adresy i korzystaj z szybszej realizacji zakupów.
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={handleShowLogin}
                    className="w-full"
                  >
                    Zaloguj się
                  </Button>
                  <Button
                    onClick={handleShowRegister}
                    variant="tonal"
                    className="w-full"
                  >
                    Załóż konto
                  </Button>
                </div>
              </div>

              {/* Guest Checkout Option */}
              <div className="border rounded-lg p-6  transition-colors">
                <h3 className="text-lg font-semibold text-[#3B3634] mb-2">
                  Kontynuuj jako gość
                </h3>
                <p className="text-sm text-[#3B3634] mb-4">
                  Szybkie zakupy bez zakładania konta. Możesz utworzyć konto później.
                </p>
                <Button
                  onClick={onGuestCheckout}
                  variant="tonal"
                  className="w-full"
                >
                  Kontynuuj jako gość
                </Button>
              </div>


              {/* Benefits List */}
              <div className="p-4 border-t border-[#3b3634]">
                <h4 className="text-sm font-semibold text-[#3B3634] mb-3">
                  Korzyści z posiadania konta:
                </h4>
                <ul className="space-y-2 text-sm text-[#3b3634]">
                  <li className="flex items-center">
                    <span className="text-[#3b3634] mr-2">✓</span>
                    Szybsze zakupy przy kolejnych zamówieniach
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#3b3634] mr-2">✓</span>
                    Historia zamówień i śledzenie przesyłek
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#3b3634] mr-2">✓</span>
                    Zapisane adresy dostawy
                  </li>
                  <li className="flex items-center">
                    <span className="text-[#3b3634] mr-2">✓</span>
                    Lista życzeń i ulubione produkty
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Login View */}
        {currentView === 'login' && (
          <div className="p-8">
            <button
              onClick={() => setCurrentView('choice')}
              className="mb-4 text-sm text-gray-600 hover:text-[#3B3634] flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Powrót
            </button>
            <LoginForm compact={true} />
          </div>
        )}

        {/* Register View */}
        {currentView === 'register' && (
          <div className="p-8">
            <button
              onClick={() => setCurrentView('choice')}
              className="mb-4 text-sm text-gray-600 hover:text-[#3B3634] flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Powrót
            </button>
            <RegisterForm compact={true} />
          </div>
        )}
      </div>
    </div>
  )
}
