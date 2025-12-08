"use client"

import { useState, useRef, useEffect } from "react"
import { FacebookIcon, InstagramIcon, LinkedInIcon } from "@/icons/social"

interface ProductShareButtonProps {
  productTitle: string
  productUrl?: string
  className?: string
}

// Share icon component
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

// Copy icon component
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

// Check icon for copied state
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

export const ProductShareButton = ({
  productTitle,
  productUrl,
  className = "",
}: ProductShareButtonProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get the current page URL if not provided
  const shareUrl = productUrl || (typeof window !== 'undefined' ? window.location.href : '')

  // Close dropdown when clicking outside
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

  // Copy link to clipboard
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

  // Share on Facebook
  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(facebookUrl, '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  // Share on Facebook Messenger
  const shareOnMessenger = () => {
    const messengerUrl = `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(shareUrl)}`
    window.open(messengerUrl, '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  // Share on Pinterest
  const shareOnPinterest = () => {
    const pinterestUrl = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent(productTitle)}`
    window.open(pinterestUrl, '_blank', 'width=750,height=550')
    setIsOpen(false)
  }

  // Share on Instagram (opens Instagram in new tab - direct sharing not available via web)
  const shareOnInstagram = () => {
    // Instagram doesn't have a web share API, so we'll copy the link and open Instagram
    navigator.clipboard.writeText(shareUrl)
    window.open('https://www.instagram.com/', '_blank')
    setIsOpen(false)
  }

  // Share on WhatsApp
  const shareOnWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${productTitle} - ${shareUrl}`)}`
    window.open(whatsappUrl, '_blank')
    setIsOpen(false)
  }

  // Share on Twitter/X
  const shareOnTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(productTitle)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  // Share on LinkedIn
  const shareOnLinkedIn = () => {
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    window.open(linkedInUrl, '_blank', 'width=600,height=400')
    setIsOpen(false)
  }

  // Native share (mobile)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productTitle,
          url: shareUrl,
        })
        setIsOpen(false)
      } catch (err) {
        console.error('Error sharing:', err)
      }
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-ui-bg-subtle transition-colors duration-200"
        aria-label="Udostępnij produkt"
        title="Udostępnij"
      >
        <ShareIcon size={24} className="text-[#3b3634]" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-primary border border-[#3b3634] rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-ui-border-base">
            <p className="text-sm font-semibold text-[#3b3634]">Udostępnij produkt</p>
          </div>

          <div className="p-2">
            {/* Copy Link */}
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-ui-bg-subtle transition-colors duration-200 text-left"
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

            {/* Facebook */}
            <button
              onClick={shareOnFacebook}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors duration-200 text-left"
            >
              <FacebookIcon size={20} color="#1877F2" />
              <span className="text-sm text-ui-fg-base">Facebook</span>
            </button>

            {/* Facebook Messenger */}
            <button
              onClick={shareOnMessenger}
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
                  d="M12 2C6.477 2 2 6.145 2 11.243C2 14.041 3.281 16.551 5.344 18.243V22L8.958 20.031C9.932 20.309 10.95 20.486 12 20.486C17.523 20.486 22 16.341 22 11.243C22 6.145 17.523 2 12 2ZM13.2 14.4L10.8 11.8L6 14.4L11.4 8.6L13.8 11.2L18.6 8.6L13.2 14.4Z"
                  fill="#0084FF"
                />
              </svg>
              <span className="text-sm text-ui-fg-base">Messenger</span>
            </button>

            {/* Pinterest */}
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

            {/* Instagram */}
            <button
              onClick={shareOnInstagram}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors duration-200 text-left"
            >
              <InstagramIcon size={20} color="#E4405F" />
              <span className="text-sm text-ui-fg-base">Instagram</span>
            </button>

            {/* WhatsApp */}
            <button
              onClick={shareOnWhatsApp}
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
                  d="M17.472 14.382C17.015 14.154 14.784 13.058 14.362 12.906C13.94 12.754 13.627 12.678 13.314 13.135C13.001 13.592 12.121 14.614 11.843 14.927C11.565 15.24 11.287 15.276 10.83 15.048C10.373 14.82 8.874 14.333 7.104 12.756C5.719 11.52 4.787 9.992 4.509 9.535C4.231 9.078 4.478 8.822 4.706 8.594C4.911 8.389 5.163 8.062 5.391 7.784C5.619 7.506 5.695 7.3 5.847 6.987C5.999 6.674 5.923 6.396 5.809 6.168C5.695 5.94 4.787 3.709 4.401 2.795C4.027 1.905 3.647 2.023 3.362 2.009C3.089 1.995 2.776 1.992 2.463 1.992C2.15 1.992 1.657 2.106 1.235 2.563C0.813 3.02 -0.5 4.116 -0.5 6.347C-0.5 8.578 1.271 10.736 1.499 11.049C1.727 11.362 4.787 15.837 9.314 17.791C10.38 18.265 11.214 18.542 11.863 18.749C12.933 19.084 13.905 19.037 14.673 18.921C15.527 18.793 17.328 17.827 17.714 16.764C18.1 15.701 18.1 14.782 17.986 14.59C17.872 14.398 17.559 14.284 17.102 14.056L17.472 14.382ZM12.002 21.785H11.998C10.158 21.784 8.353 21.281 6.772 20.329L6.398 20.107L2.77 21.089L3.768 17.558L3.524 17.169C2.486 15.533 1.938 13.639 1.939 11.699C1.941 6.257 6.426 1.785 12.006 1.785C14.701 1.786 17.229 2.838 19.106 4.719C20.983 6.6 22.032 9.133 22.031 11.833C22.029 17.275 17.544 21.785 12.002 21.785Z"
                  fill="#25D366"
                />
              </svg>
              <span className="text-sm text-ui-fg-base">WhatsApp</span>
            </button>

            {/* Twitter/X */}
            <button
              onClick={shareOnTwitter}
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
                  d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  fill="#000000"
                />
              </svg>
              <span className="text-sm text-ui-fg-base">X (Twitter)</span>
            </button>

            {/* LinkedIn */}
            <button
              onClick={shareOnLinkedIn}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors duration-200 text-left"
            >
              <LinkedInIcon size={20} color="#0A66C2" />
              <span className="text-sm text-ui-fg-base">LinkedIn</span>
            </button>

            {/* Native Share (Mobile) */}
            {typeof window !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors duration-200 text-left"
              >
                <ShareIcon size={20} className="text-[#3b3634]" />
                <span className="text-sm text-[#3b3634]">Więcej opcji...</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
