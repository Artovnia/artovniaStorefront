"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { CloseIcon, SettingsIcon, InfoIcon, AlertIcon } from "@/icons"

interface CookieCategory {
  id: string
  required: boolean
  enabled: boolean
}

interface CookieConsentProps {
  onAccept?: (preferences: Record<string, boolean>) => void
  onReject?: () => void
}

const FOCUSABLE_SELECTORS =
  'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'

export const CookieConsent: React.FC<CookieConsentProps> = ({
  onAccept,
  onReject,
}) => {
  const t = useTranslations("cookieConsent")
  const [isVisible, setIsVisible] = useState(false)
  const [categories, setCategories] = useState<
    Record<string, CookieCategory>
  >({
    necessary: { id: "necessary", required: true, enabled: true },
    functional: { id: "functional", required: false, enabled: true },
    analytics: { id: "analytics", required: false, enabled: true },
    marketing: { id: "marketing", required: false, enabled: false },
    performance: { id: "performance", required: false, enabled: false },
  })

  const dialogRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const acceptBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const cookiePreferences = localStorage.getItem(
      "artovnia-cookie-preferences"
    )
    if (!cookiePreferences) {
      setIsVisible(true)
    }
  }, [])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = ""
      }
    }
  }, [isVisible])

  // Focus management: save previous focus, auto-focus accept button on open
  useEffect(() => {
    if (isVisible) {
      previousFocusRef.current = document.activeElement as HTMLElement
      // Small delay to ensure DOM is painted
      const timer = setTimeout(() => {
        acceptBtnRef.current?.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  // Restore focus when modal closes
  const restoreFocus = useCallback(() => {
    previousFocusRef.current?.focus()
  }, [])

  // Focus trap
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        e.preventDefault()
        handleRejectAll()
        return
      }

      if (e.key !== "Tab") return

      const dialog = dialogRef.current
      if (!dialog) return

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
      )

      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]
      const lastElement =
        focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const handleCategoryToggle = (categoryId: string) => {
    if (categories[categoryId].required) return

    setCategories((prev) => ({
      ...prev,
      [categoryId]: {
        ...prev[categoryId],
        enabled: !prev[categoryId].enabled,
      },
    }))
  }

  const handleAcceptAll = () => {
    const allEnabled = Object.keys(categories).reduce(
      (acc, key) => {
        acc[key] = true
        return acc
      },
      {} as Record<string, boolean>
    )

    localStorage.setItem(
      "artovnia-cookie-preferences",
      JSON.stringify(allEnabled)
    )
    window.dispatchEvent(new Event("cookie-consent-updated"))
    onAccept?.(allEnabled)
    setIsVisible(false)
    restoreFocus()
  }

  const handleRejectAll = () => {
    const onlyRequired = Object.keys(categories).reduce(
      (acc, key) => {
        acc[key] = categories[key].required
        return acc
      },
      {} as Record<string, boolean>
    )

    localStorage.setItem(
      "artovnia-cookie-preferences",
      JSON.stringify(onlyRequired)
    )
    window.dispatchEvent(new Event("cookie-consent-updated"))
    onReject?.()
    setIsVisible(false)
    restoreFocus()
  }

  const handleSavePreferences = () => {
    const preferences = Object.keys(categories).reduce(
      (acc, key) => {
        acc[key] = categories[key].enabled
        return acc
      },
      {} as Record<string, boolean>
    )

    localStorage.setItem(
      "artovnia-cookie-preferences",
      JSON.stringify(preferences)
    )
    window.dispatchEvent(new Event("cookie-consent-updated"))
    onAccept?.(preferences)
    setIsVisible(false)
    restoreFocus()
  }

  const getCategoryIcon = (categoryId: string) => {
    switch (categoryId) {
      case "necessary":
        return (
          <AlertIcon
            size={20}
            color="#3B3634"
            className="flex-shrink-0"
            aria-hidden="true"
          />
        )
      case "functional":
        return (
          <SettingsIcon
            size={20}
            color="#3B3634"
            className="flex-shrink-0"
            aria-hidden="true"
          />
        )
      case "analytics":
        return (
          <InfoIcon
            size={20}
            color="#3B3634"
            className="flex-shrink-0"
            aria-hidden="true"
          />
        )
      case "marketing":
        return (
          <AlertIcon
            size={20}
            color="#3B3634"
            className="flex-shrink-0"
            aria-hidden="true"
          />
        )
      case "performance":
        return (
          <SettingsIcon
            size={20}
            color="#3B3634"
            className="flex-shrink-0"
            aria-hidden="true"
          />
        )
      default:
        return null
    }
  }

  if (!isVisible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none animate-in fade-in duration-300"
      role="presentation"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#3B3634]/20 backdrop-blur-sm pointer-events-auto"
        onClick={handleRejectAll}
        aria-hidden="true"
      />

      {/* Cookie Consent Modal */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-description"
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-2xl max-h-[calc(100dvh-2rem)] flex flex-col bg-[#F4F0EB] shadow-2xl border border-[#3B3634]/10 pointer-events-auto transform transition-all duration-300 ease-out animate-in slide-in-from-bottom-4"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 sm:p-6 border-b border-[#3B3634]/10">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 bg-white/50 rounded-full border-2 border-[#3B3634]/20 flex items-center justify-center"
              aria-hidden="true"
            >
              <span className="text-[#3B3634] font-bold font-instrument-serif text-lg">
                A
              </span>
            </div>
            <h2
              id="cookie-consent-title"
              className="text-xl font-instrument-serif text-[#3B3634] tracking-tight"
            >
              {t("title")}
            </h2>
          </div>
          <button
            onClick={handleRejectAll}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-[#3B3634]/5 hover:bg-[#3B3634]/10 transition-all duration-200 active:scale-95"
            aria-label="Zamknij i odrzuć wszystkie opcjonalne pliki cookie"
            type="button"
          >
            <CloseIcon size={20} color="#3B3634" aria-hidden="true" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div
          className="p-4 sm:p-6 overflow-y-auto overscroll-contain"
          tabIndex={-1}
        >
          <p
            id="cookie-consent-description"
            className="text-[#3B3634]/70 mb-6 leading-relaxed font-instrument-sans"
          >
            {t("description")}
          </p>

          {/* Cookie Categories */}
          <fieldset className="space-y-3 mb-6 border-none p-0 m-0">
            <legend className="text-md font-medium font-instrument-sans text-[#3B3634] mb-4">
              Zarządzaj swoimi preferencjami:
            </legend>
            {Object.entries(categories).map(
              ([categoryId, category]) => (
                <div
                  key={categoryId}
                  className="flex items-start space-x-4 p-3 bg-white/60 border border-[#3B3634]/10 hover:bg-white/80 transition-all duration-200"
                >
                  <div className="flex-shrink-0 mt-1">
                    {getCategoryIcon(categoryId)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <label
                        htmlFor={`cookie-${categoryId}`}
                        className="font-medium font-instrument-sans text-[#3B3634] cursor-pointer"
                      >
                        {t(`categories.${categoryId}.title`)}
                      </label>
                      <div className="flex items-center flex-shrink-0">
                        {category.required && (
                          <span
                            className="text-xs text-[#3B3634]/60 mr-3 font-instrument-sans"
                            id={`cookie-${categoryId}-required`}
                          >
                            Wymagane
                          </span>
                        )}
                        <button
                          type="button"
                          role="switch"
                          id={`cookie-${categoryId}`}
                          aria-checked={category.enabled}
                          aria-label={t(
                            `categories.${categoryId}.title`
                          )}
                          aria-describedby={
                            [
                              `cookie-${categoryId}-desc`,
                              category.required
                                ? `cookie-${categoryId}-required`
                                : null,
                            ]
                              .filter(Boolean)
                              .join(" ") || undefined
                          }
                          disabled={category.required}
                          onClick={() =>
                            handleCategoryToggle(categoryId)
                          }
                          onKeyDown={(e) => {
                            if (
                              e.key === "Enter" ||
                              e.key === " "
                            ) {
                              e.preventDefault()
                              handleCategoryToggle(categoryId)
                            }
                          }}
                          className={`
                            relative w-11 h-6 rounded-full transition-all duration-200 ease-in-out
                            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B3634]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4F0EB]
                            ${
                              category.enabled
                                ? "bg-[#3B3634]"
                                : "bg-[#3B3634]/20"
                            }
                            ${
                              category.required
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer hover:shadow-sm"
                            }
                          `}
                        >
                          <span
                            className={`
                              absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ease-in-out pointer-events-none
                              ${category.enabled ? "translate-x-5" : "translate-x-0"}
                            `}
                          />
                          <span className="sr-only">
                            {category.enabled
                              ? "Włączone"
                              : "Wyłączone"}
                          </span>
                        </button>
                      </div>
                    </div>
                    <p
                      id={`cookie-${categoryId}-desc`}
                      className="text-sm text-[#3B3634]/70 font-instrument-sans leading-relaxed"
                    >
                      {t(
                        `categories.${categoryId}.description`
                      )}
                    </p>
                  </div>
                </div>
              )
            )}
          </fieldset>

          {/* Action Buttons */}
          <div
            className="flex flex-col sm:flex-row gap-3"
            role="group"
            aria-label="Akcje dotyczące plików cookie"
          >
            <button
              ref={acceptBtnRef}
              onClick={handleAcceptAll}
              type="button"
              className="flex-1 bg-[#3B3634] text-[#F4F0EB] px-4 py-2 font-medium font-instrument-sans hover:bg-[#2d2a28] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B3634]/50 active:scale-[0.99]"
            >
              {t("acceptAll")}
            </button>

            <button
              onClick={handleSavePreferences}
              type="button"
              className="flex-1 bg-white/60 text-[#3B3634] px-4 py-2 font-medium font-instrument-sans border border-[#3B3634]/20 hover:bg-white/80 hover:border-[#3B3634]/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B3634]/50 active:scale-[0.99]"
            >
              {t("savePreferences")}
            </button>

            <button
              onClick={handleRejectAll}
              type="button"
              className="flex-1 border-2 border-[#3B3634]/30 text-[#3B3634] px-4 py-2 font-medium font-instrument-sans hover:border-[#3B3634]/50 hover:bg-[#3B3634]/5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B3634]/50 active:scale-[0.99]"
            >
              {t("rejectAll")}
            </button>
          </div>

          {/* Privacy Policy Link */}
          <div className="mt-4 text-center">
            <Link
              href="/polityka-prywatnosci"
              className="text-sm text-[#3B3634]/70 hover:text-[#3B3634] font-instrument-sans transition-colors underline underline-offset-2"
            >
              {t("privacyPolicy")}
            </Link>
          </div>
        </div>
      </div>

      {/* Live region for screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        Wyświetlono okno zgody na pliki cookie. Użyj klawisza Tab,
        aby nawigować między opcjami.
      </div>
    </div>
  )
}