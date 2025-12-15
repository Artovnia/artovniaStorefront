"use client"

import { Input } from "@/components/atoms"
import { SearchIcon } from "@/icons"
import { useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { useState } from "react"

export const MobileProductSearch = () => {
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

  return (
    <div className="md:hidden w-full px-4 mb-1">
      <form className="flex items-center w-full" method="POST" onSubmit={submitHandler}>
        <div className="w-full">
          <Input
            icon={<SearchIcon />}
            placeholder="Wyszukaj produkt"
            value={search}
            changeValue={setSearch}
            clearable={true}
          />
        </div>
        <input type="submit" className="hidden" />
      </form>
    </div>
  )
}
