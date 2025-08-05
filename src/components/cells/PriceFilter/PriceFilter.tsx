"use client"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"

import { Input } from "@/components/atoms"
import { Accordion, FilterCheckboxOption } from "@/components/molecules"
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams"
import { DollarIcon } from "@/icons"
import useFilters from "@/hooks/useFilters"

export const PriceFilter = () => {
  const [min, setMin] = useState("")
  const [max, setMax] = useState("")

  const updateSearchParams = useUpdateSearchParams()
  const { updateFilters } = useFilters("sale")
  const searchParams = useSearchParams()

  const selected = searchParams.get("sale")

  useEffect(() => {
    setMin(searchParams.get("min_price") || "")
    setMax(searchParams.get("max_price") || "")
  }, [searchParams])

  const selectHandler = (option: string) => {
    updateFilters(option)
  }

  const priceChangeHandler = (field: string, value: string) => {
    const reg = new RegExp("^[0-9]+$")
    if (reg.test(value)) {
      if (field === "min") setMin(value)
      if (field === "max") setMax(value)
    }
  }

  const updateMinPriceHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Track what we're doing with logs
    console.log("Setting min_price to:", min)
    // Need to make sure we're setting a value Algolia can handle
    if (min && !isNaN(Number(min))) {
      updateSearchParams("min_price", min)
    } else {
      // Clear the parameter if it's not a valid number
      updateSearchParams("min_price", "")
    }
  }

  const updateMaxPriceHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Track what we're doing with logs
    console.log("Setting max_price to:", max)
    // Need to make sure we're setting a value Algolia can handle
    if (max && !isNaN(Number(max))) {
      updateSearchParams("max_price", max)
    } else {
      // Clear the parameter if it's not a valid number
      updateSearchParams("max_price", "")
    }
  }

  return (
    <Accordion heading="Cena">
      <div className="flex gap-2 mb-6">
        <form method="POST" onSubmit={updateMinPriceHandler}>
          <Input
            
            placeholder="Min"
            icon={<DollarIcon size={16} />}
            onChange={(e) => priceChangeHandler("min", e.target.value)}
            value={min}
          />
          <input type="submit" className="hidden" />
        </form>
        <form method="POST" onSubmit={updateMaxPriceHandler}>
          <Input
            placeholder="Max"
            icon={<DollarIcon size={16} />}
            onChange={(e) => priceChangeHandler("max", e.target.value)}
            value={max}
          />
          <input type="submit" className="hidden" />
        </form>
      </div>
      {/* <div className='px-4'>
        <FilterCheckboxOption
          checked={Boolean(selected)}
          onCheck={selectHandler}
          label={'On Sale'}
        />
      </div> */}
    </Accordion>
  )
}
