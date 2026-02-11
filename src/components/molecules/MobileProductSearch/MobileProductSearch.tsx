"use client"

import { Input } from "@/components/atoms"
import { SearchIcon } from "@/icons"
import { useRouter } from '@/i18n/routing'
import { useState, useEffect } from "react"

export const MobileProductSearch = () => {
  const router = useRouter()
  // ✅ Don't use useSearchParams() - it causes SSG bailout on Vercel
  // Read URL params via window.location in useEffect instead
  const [search, setSearch] = useState("")

  // ✅ Read search params only on client-side to avoid SSG bailout
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const query = urlParams.get("query")
    if (query) {
      setSearch(query)
    }
  }, [])

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/categories?query=${encodeURIComponent(search.trim())}`)
    } else {
      router.push(`/categories`)
    }
  }

  const handleClear = () => {
    // Navigate to categories page without query to show all results
    router.push(`/categories`)
  }

  return (
    <div className="xl:hidden w-full px-4 mb-1">
      <form className="flex items-center w-full" method="POST" onSubmit={submitHandler} role="search" aria-label="Wyszukiwarka produktów">
        <div className="w-full">
          <Input
            icon={<SearchIcon />}
            placeholder="Wyszukaj produkt"
            value={search}
            changeValue={setSearch}
            clearable={true}
            onClear={handleClear}
          />
        </div>
        <input type="submit" className="hidden" aria-label="Szukaj" />
      </form>
    </div>
  )
}
