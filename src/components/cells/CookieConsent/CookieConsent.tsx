"use client"

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { CloseIcon, SettingsIcon, InfoIcon, AlertIcon } from '@/icons'

interface CookieCategory {
  id: string
  required: boolean
  enabled: boolean
}

interface CookieConsentProps {
  onAccept?: (preferences: Record<string, boolean>) => void
  onReject?: () => void
}

export const CookieConsent: React.FC<CookieConsentProps> = ({
  onAccept,
  onReject
}) => {
  const t = useTranslations('cookieConsent')
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [categories, setCategories] = useState<Record<string, CookieCategory>>({
    necessary: { id: 'necessary', required: true, enabled: true },
    functional: { id: 'functional', required: false, enabled: true },
    analytics: { id: 'analytics', required: false, enabled: true },
    marketing: { id: 'marketing', required: false, enabled: false },
    performance: { id: 'performance', required: false, enabled: false }
  })

  useEffect(() => {
    // Check if user has already made a choice
    const cookiePreferences = localStorage.getItem('artovnia-cookie-preferences')
    if (!cookiePreferences) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleCategoryToggle = (categoryId: string) => {
    if (categories[categoryId].required) return
    
    setCategories(prev => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        enabled: !prev[categoryId].enabled
      }
    }))
  }

  const handleAcceptAll = () => {
    const allEnabled = Object.keys(categories).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {} as Record<string, boolean>)
    
    localStorage.setItem('artovnia-cookie-preferences', JSON.stringify(allEnabled))
    onAccept?.(allEnabled)
    setIsVisible(false)
  }

  const handleRejectAll = () => {
    const onlyRequired = Object.keys(categories).reduce((acc, key) => {
      acc[key] = categories[key].required
      return acc
    }, {} as Record<string, boolean>)
    
    localStorage.setItem('artovnia-cookie-preferences', JSON.stringify(onlyRequired))
    onReject?.()
    setIsVisible(false)
  }

  const handleSavePreferences = () => {
    const preferences = Object.keys(categories).reduce((acc, key) => {
      acc[key] = categories[key].enabled
      return acc
    }, {} as Record<string, boolean>)
    
    localStorage.setItem('artovnia-cookie-preferences', JSON.stringify(preferences))
    onAccept?.(preferences)
    setIsVisible(false)
  }

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case 'necessary':
        return <AlertIcon size={20} color="#3B3634" className="flex-shrink-0" />
      case 'functional':
        return <SettingsIcon size={20} color="#3B3634" className="flex-shrink-0" />
      case 'analytics':
        return <InfoIcon size={20} color="#3B3634" className="flex-shrink-0" />
      case 'marketing':
        return <AlertIcon size={20} color="#3B3634" className="flex-shrink-0" />
      case 'performance':
        return <SettingsIcon size={20} color="#3B3634" className="flex-shrink-0" />
      default:
        return null
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto" />
      
      {/* Cookie Consent Modal */}
      <div className="relative w-full max-w-2xl bg-primary  shadow-2xl border border-[#3B3634]/10 pointer-events-auto transform transition-all duration-300 ease-out">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3B3634]/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-[#3B3634] font-bold text-sm">A</span>
            </div>
            <h2 className="text-xl font-semibold text-[#3B3634]">
              {t('title')}
            </h2>
          </div>
          <button
            onClick={handleRejectAll}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Zamknij i odrzuć wszystkie opcjonalne pliki cookie"
          >
            <CloseIcon size={20} color="#6B7280" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6 leading-relaxed">
            {t('description')}
          </p>

          {/* Cookie Categories - Always Visible */}
          <div className="space-y-4 mb-6">
            <h3 className="text-md font-semibold text-[#3B3634] mb-4">Zarządzaj swoimi preferencjami:</h3>
            {Object.entries(categories).map(([categoryId, category]) => (
              <div
                key={categoryId}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-100"
              >
                <div className="flex-shrink-0 mt-1">
                  {getCategoryIcon(categoryId)}
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-[#3B3634]">
                      {t(`categories.${categoryId}.title`)}
                    </h3>
                    <div className="flex items-center">
                      {category.required && (
                        <span className="text-xs text-gray-500 mr-3">
                          Wymagane
                        </span>
                      )}
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={category.enabled}
                          onChange={() => handleCategoryToggle(categoryId)}
                          disabled={category.required}
                          className="sr-only peer"
                          aria-label={`${t(`categories.${categoryId}.title`)} - ${category.enabled ? 'włączone' : 'wyłączone'}${category.required ? ' (wymagane)' : ''}`}
                          id={`cookie-${categoryId}`}
                        />
                        <div className={`
                          relative w-11 h-6 rounded-full transition-colors duration-200 ease-in-out
                          ${category.enabled 
                            ? 'bg-[#3B3634]' 
                            : 'bg-gray-300'
                          }
                          ${category.required 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'cursor-pointer'
                          }
                        `}>
                          <div className={`
                            absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 ease-in-out
                            ${category.enabled ? 'translate-x-5' : 'translate-x-0'}
                          `} />
                        </div>
                      </label>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t(`categories.${categoryId}.description`)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleAcceptAll}
              className="flex-1 bg-[#3B3634] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#3B3634]/90 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B3634]/50"
              aria-label="Zaakceptuj wszystkie pliki cookie"
            >
              {t('acceptAll')}
            </button>
            
            <button
              onClick={handleSavePreferences}
              className="flex-1 bg-primary text-[#3B3634] px-6 py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Zapisz wybrane preferencje dotyczące plików cookie"
            >
              {t('savePreferences')}
            </button>
            
            <button
              onClick={handleRejectAll}
              className="flex-1 border-2 border-[#3B3634] text-[#3B3634] px-6 py-3 rounded-xl font-medium hover:bg-[#3B3634]/5 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3B3634]/50"
              aria-label="Odrzuć wszystkie opcjonalne pliki cookie"
            >
              {t('rejectAll')}
            </button>
          </div>

          {/* Privacy Policy Link */}
          <div className="mt-4 text-center">
            <Link
              href="/privacy-policy"
              className="text-sm text-gray-500 hover:text-[#3B3634] transition-colors underline"
              aria-label="Przejdź do polityki prywatności"
            >
              {t('privacyPolicy')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
