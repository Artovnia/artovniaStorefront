"use client"

import { useState, useRef, useEffect } from "react"

interface SellerShareButtonProps {
  sellerName: string
  sellerUrl?: string
  className?: string
}

const ShareIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M18 16.08C17.24 16.08 16.56 16.38 16.04 16.85L8.91 12.7C8.96 12.47 9 12.24 9 12C9 11.76 8.96 11.53 8.91 11.3L15.96 7.19C16.5 7.69 17.21 8 18 8C19.66 8 21 6.66 21 5C21 3.34 19.66 2 18 2C16.34 2 15 3.34 15 5C15 5.24 15.04 5.47 15.09 5.7L8.04 9.81C7.5 9.31 6.79 9 6 9C4.34 9 3 10.34 3 12C3 13.66 4.34 15 6 15C6.79 15 7.5 14.69 8.04 14.19L15.16 18.35C15.11 18.56 15.08 18.78 15.08 19C15.08 20.61 16.39 21.92 18 21.92C19.61 21.92 20.92 20.61 20.92 19C20.92 17.39 19.61 16.08 18 16.08Z"
      fill="currentColor"
    />
  </svg>
)

const CopyIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"
      fill="currentColor"
    />
  </svg>
)

const CheckIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
      fill="currentColor"
    />
  </svg>
)

export const SellerShareButton = ({
  sellerName,
  sellerUrl,
  className = "",
}: SellerShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const shareUrl = sellerUrl || (typeof window !== 'undefined' ? window.location.href : '')

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'share' in navigator) {
      setCanShare(true)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  const shareOnPinterest = () => {
    const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(`Sprawdź profil sprzedawcy: ${sellerName}`)}`
    window.open(pinterestUrl, '_blank', 'width=750,height=550')
    setIsOpen(false)
  }

  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Sprawdź profil sprzedawcy: ${sellerName} - ${shareUrl}`)}`
    window.open(whatsappUrl, '_blank')
    setIsOpen(false)
  }

  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Sprawdź profil sprzedawcy: ${sellerName}`)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: `Sprzedawca: ${sellerName}`,
          text: `Sprawdź profil sprzedawcy: ${sellerName}`,
          url: shareUrl,
        })
        setIsOpen(false)
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    }
  }

  const handleShareClick = () => {
    if (canShare) {
      handleNativeShare()
    } else {
      setIsOpen(!isOpen)
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={handleShareClick}
        className="p-2 rounded-full hover:bg-ui-bg-subtle transition-colors duration-200"
        aria-label="Udostępnij profil sprzedawcy"
        title={canShare ? "Udostępnij" : "Opcje udostępniania"}
      >
        <ShareIcon size={20} className="text-[#3b3634]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-primary border border-[#3b3634] rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-ui-border-base">
            <p className="text-sm font-semibold text-[#3b3634]">Udostępnij profil sprzedawcy</p>
          </div>

          <div className="p-2">
            {canShare && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md bg-blue-50 hover:bg-blue-100 transition-colors duration-200 text-left border border-blue-200 mb-2"
              >
                <ShareIcon size={20} className="text-blue-600" />
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-blue-600">Udostępnij</span>
                  <span className="text-xs text-blue-500">Instagram, Messenger, WhatsApp i więcej</span>
                </div>
              </button>
            )}

            <button
              onClick={shareOnPinterest}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors duration-200 text-left"
            >
              <svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 0C5.373 0 0 5.372 0 12C0 17.084 3.163 21.426 7.627 23.174C7.522 22.225 7.427 20.769 7.669 19.733C7.887 18.796 9.076 13.768 9.076 13.768C9.076 13.768 8.717 13.049 8.717 11.986C8.717 10.318 9.684 9.072 10.888 9.072C11.911 9.072 12.406 9.841 12.406 10.762C12.406 11.791 11.751 13.33 11.412 14.757C11.129 15.951 12.011 16.926 13.189 16.926C15.322 16.926 16.961 14.677 16.961 11.431C16.961 8.558 14.897 6.549 11.949 6.549C8.535 6.549 6.531 9.11 6.531 11.756C6.531 12.787 6.928 13.894 7.424 14.494C7.522 14.613 7.536 14.718 7.507 14.837L7.174 16.199C7.121 16.419 7 16.471 6.772 16.363C5.273 15.662 4.336 13.471 4.336 11.711C4.336 7.926 7.086 4.449 12.265 4.449C16.428 4.449 19.663 7.416 19.663 11.38C19.663 15.516 17.056 18.844 13.436 18.844C12.22 18.844 11.077 18.213 10.686 17.466L9.938 20.319C9.667 21.362 8.936 22.669 8.446 23.465C9.57 23.812 10.761 24 12 24C18.627 24 24 18.627 24 12C24 5.372 18.627 0 12 0Z"
                  fill="#E60023"
                />
              </svg>
              <span className="text-sm text-ui-fg-base">Pinterest</span>
            </button>

            <button
              onClick={copyToClipboard}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-ui-bg-subtle transition-colors duration-200 text-left mt-2 border-t border-ui-border-base pt-3"
            >
              {copied ? (
                <CheckIcon size={20} className="text-green-600" />
              ) : (
                <CopyIcon size={20} className="text-ui-fg-subtle" />
              )}
              <span className="text-sm text-ui-fg-base">
                {copied ? 'Skopiowano!' : 'Kopiuj link'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
