"use client"

import { Input } from "@/components/atoms"
import { SearchIcon } from "@/icons"
import { useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { useState } from "react"

export const NavbarSearch = () => {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [search, setSearch] = useState(searchParams.get("query") || "")

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