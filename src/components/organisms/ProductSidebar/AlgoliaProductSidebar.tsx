"use client"

import { Chip, Input, StarRating } from "@/components/atoms"
import { Accordion, FilterCheckboxOption } from "@/components/molecules"
import { ColorFilter, SizeFilter, ProductRatingFilter } from "@/components/cells"
import { CombinedDimensionFilter } from "@/components/cells/CombinedDimensionFilter/CombinedDimensionFilter"
import useFilters from "@/hooks/useFilters"
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams"
import { cn } from "@/lib/utils"
import { useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"
import { useRefinementList } from "react-instantsearch"

const filters = [
  { label: "5", amount: 40 },
  { label: "4", amount: 78 },
  { label: "3", amount: 0 },
  { label: "2", amount: 0 },
  { label: "1", amount: 0 },
]

// AttributeDebugFilter has been removed

export const AlgoliaProductSidebar = () => {
  return (
    <div>
      <PriceFilter />
      <ColorFilter />
      <SizeFilter />
      {/* Combined dimension filter */}
      <CombinedDimensionFilter />
      <ProductRatingFilter />
    </div>
  )
}

function ConditionFilter() {
  const { items } = useRefinementList({
    attribute: "variants.condition",
    limit: 100,
    operator: "or",
  })
  const { updateFilters, isFilterActive } = useFilters("condition")

  const selectHandler = (option: string) => {
    updateFilters(option)
  }
  return (
    <Accordion heading="Condition">
      <ul className="px-4">
        {items.map(({ label, count }) => (
          <li key={label} className="mb-4">
            <FilterCheckboxOption
              checked={isFilterActive(label)}
              disabled={Boolean(!count)}
              onCheck={selectHandler}
              label={label}
              amount={count}
            />
          </li>
        ))}
      </ul>
    </Accordion>
  )
}

// Using the imported ColorFilter component from cells directory
// This component handles color taxonomy and renders color swatches

// SizeFilter has been moved to @/components/cells/SizeFilter/SizeFilter.tsx

function PriceFilter() {
  const [min, setMin] = useState("")
  const [max, setMax] = useState("")

  const updateSearchParams = useUpdateSearchParams()
  const searchParams = useSearchParams()

  useEffect(() => {
    setMin(searchParams.get("min_price") || "")
    setMax(searchParams.get("max_price") || "")
  }, [searchParams])

  const priceChangeHandler = (field: string, value: string) => {
    const reg = new RegExp("^[0-9]+$")
    if (reg.test(value)) {
      if (field === "min") setMin(value)
      if (field === "max") setMax(value)
    }
  }

  const updateMinPriceHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    updateSearchParams("min_price", min)
  }

  const updateMaxPriceHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    updateSearchParams("max_price", max)
  }
  return (
    <Accordion heading="Cena">
      <div className="flex gap-2 mb-6 ">
        <form method="POST" onSubmit={updateMinPriceHandler}>
          <Input
            placeholder="Min"
            icon={<span className="text-xs font-medium">zł</span>}
            onChange={(e) => priceChangeHandler("min", e.target.value)}
            value={min}
          />
          <input type="submit" className="hidden" />
        </form>
        <form method="POST" onSubmit={updateMaxPriceHandler}>
          <Input
            placeholder="Max"
            icon={<span className="text-xs font-medium">zł</span>}
            onChange={(e) => priceChangeHandler("max", e.target.value)}
            value={max}
          />
          <input type="submit" className="hidden" />
        </form>
      </div>
    </Accordion>
  )
}

// RatingFilter has been replaced by the ProductRatingFilter component from @/components/cells

function AlgoliaProductSidebarMain() {
  const [search, setSearch] = useState("")

  // Use proper type for filters
  const ratingFilters = [
    { label: "5", amount: 40 },
    { label: "4", amount: 78 },
    { label: "3", amount: 0 },
    { label: "2", amount: 0 },
    { label: "1", amount: 0 },
  ]

  return (
    <div className="py-4 sticky top-8">
      <div className="border-b border-gray-200 pb-4 mb-4">
        <Input
          className="w-full"
          placeholder="Wyszukaj..."
          clearable
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Accordion defaultOpen heading="Kolor">
        <div className="flex flex-wrap gap-4 px-2">
          <ColorFilter />
        </div>
      </Accordion>

      <Accordion defaultOpen heading="Rozmiar">
        <SizeFilter />
      </Accordion>

      <PriceFilter />

      <Accordion defaultOpen heading="Ocena">
        <div className="py-2 space-y-2">
          {ratingFilters.map((filter, index) => (
            <div key={index} className="flex items-center gap-2">
              <FilterCheckboxOption
                amount={filter.amount}
                label={filter.label}
                checked={false}
                onCheck={() => {}}
                disabled={filter.amount === 0}
              />
              <StarRating rate={parseInt(filter.label)} />
            </div>
          ))}
        </div>
      </Accordion>
    </div>
  )
}
