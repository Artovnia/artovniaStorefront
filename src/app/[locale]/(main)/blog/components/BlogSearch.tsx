'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface BlogSearchProps {
  onSearch?: (searchTerm: string) => void
  placeholder?: string
  className?: string
}

export default function BlogSearch({ 
  onSearch, 
  placeholder = "Wyszukaj posty...", 
  className = "" 
}: BlogSearchProps) {
  const router = useRouter()
  // ✅ Don't use useSearchParams() directly - it causes SSG bailout on Vercel
  // Instead, read from window.location on client-side only
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // ✅ Read search params only on client-side to avoid SSG bailout
  useEffect(() => {
    setIsClient(true)
    // Read query param from URL on client-side
    const urlParams = new URLSearchParams(window.location.search)
    const query = urlParams.get('q')
    if (query) {
      setSearchTerm(query)
      setIsOpen(true)
    }
  }, [])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (onSearch) {
      onSearch(searchTerm)
    } else {
      // Only navigate if there's an actual search term
      if (searchTerm.trim()) {
        router.push(`/blog/search?q=${encodeURIComponent(searchTerm.trim())}`)
      }
      // If empty, just close the search bar without navigation
    }
  }

  const handleClear = () => {
    setSearchTerm('')
    if (onSearch) {
      onSearch('')
    }
    // Don't navigate - just close the search bar
    setIsOpen(false)
  }

  const handleClickOutside = (e: MouseEvent) => {
    if (inputRef.current && !inputRef.current.closest('form')?.contains(e.target as Node)) {
      if (!searchTerm) {
        setIsOpen(false)
      }
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, searchTerm])

  if (!isOpen) {
    return (
      <div className={`flex justify-end ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="group relative bg-[#3B3634] text-white px-6 py-2 rounded-sm overflow-hidden transition-all duration-300 hover:bg-[#2d2a28] font-instrument-sans font-medium"
          aria-label="Otwórz wyszukiwarkę"
        >
          <span className="flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            
          </span>
        </button>
      </div>
    )
  }

  return (
    <form 
      onSubmit={handleSubmit} 
      className={`relative animate-in fade-in slide-in-from-top-2 duration-300 ${className}`}
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B3634] focus:border-[#3B3634] bg-white font-instrument-sans transition-all duration-200"
        />
        
        <button
          type="submit"
          className="absolute inset-y-0 left-2 flex items-center pr-3 text-gray-400 hover:text-[#3B3634] font-instrument-sans transition-colors duration-200"
          aria-label="Szukaj"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={handleClear}
          className="absolute inset-y-0 right-2 flex items-center text-gray-400 hover:text-[#3B3634] font-instrument-sans transition-colors duration-200"
          aria-label="Zamknij wyszukiwarkę"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </form>
  )
}