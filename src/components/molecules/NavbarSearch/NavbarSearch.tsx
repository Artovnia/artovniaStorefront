"use client"

import { Input } from "@/components/atoms"
import { SearchIcon } from "@/icons"
import { useRouter } from '@/i18n/routing'
import { useState, useEffect } from "react"

export const NavbarSearch = () => {
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
    <form className="flex items-center" method="POST" onSubmit={submitHandler}>
      <Input
        icon={<SearchIcon />}
        placeholder="Wyszukaj produkt"
        value={search}
        changeValue={setSearch}
        clearable={true}
        onClear={handleClear}
      />
      <input type="submit" className="hidden" />
    </form>
  )
}