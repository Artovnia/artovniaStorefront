'use client'

import { useState, useEffect } from 'react'
import { subscribeToNewsletter } from '@/lib/data/newsletter'

// Success checkmark icon
const CheckIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

// Arrow icon
const ArrowRightIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
)

interface NewsletterFormProps {
  onSubmit?: (email: string) => Promise<void>
  className?: string
}

export default function NewsletterForm({ onSubmit, className = '' }: NewsletterFormProps) {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  // Auto-reset success state after 5 seconds
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        setIsSuccess(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isSuccess])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setError('Podaj adres e-mail')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Podaj prawidłowy adres e-mail')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      if (onSubmit) {
        await onSubmit(email)
      } else {
        await subscribeToNewsletter({
          email,
          agreedToTerms: true
        })
      }

      setIsSuccess(true)
      setEmail('')
    } catch (err: any) {
      setError(err.message || 'Wystąpił błąd. Spróbuj ponownie.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className={`w-full ${className}`}>
        <div className="relative w-full max-w-[540px] mx-auto">
          {/* Success state with modern styling */}
          <div className="bg-[#3B3634] border-2 border-[#3B3634] rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-center space-x-3">
              {/* Animated checkmark */}
              <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckIcon />
              </div>
              
              <div className="text-center">
                <h3 className="text-white font-instrument-serif text-lg font-medium mb-1">
                  Dziękujemy!
                </h3>
                <p className="text-white font-instrument-sans text-sm">
                  za zapisanie się na newslettera!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="relative w-full max-w-[540px] mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="PODAJ ADRES E-MAIL"
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-none text-[#3B3634] font-instrument-sans text-sm placeholder-gray-500 focus:outline-none focus:border-[#3B3634] transition-colors mx-auto"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-0 top-0 h-full px-4 text-[#3B3634] font-instrument-sans text-sm transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center hover:text-white hover:bg-[#3B3634]"
          aria-label="Zapisz się do newslettera"
        >
          {isLoading ? (
            <span>...</span>
          ) : (
            <ArrowRightIcon />
          )}
        </button>
      </div>
      
      {error && (
        <p className="text-red-600 text-sm font-instrument-sans mt-2 text-center">
          {error}
        </p>
      )}
    </form>
  )
}