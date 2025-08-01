"use client"

import { HttpTypes } from "@medusajs/types"

import { Chip } from "@/components/atoms"
import useUpdateSearchParams from "@/hooks/useUpdateSearchParams"

// Define proper types for product options and values
type ProductOption = {
  id: string
  title: string
  values?: ProductOptionValue[]
}

type ProductOptionValue = {
  id: string
  value: string
}

type ExtendedStoreProduct = HttpTypes.StoreProduct & {
  options?: ProductOption[]
}

export const ProductVariants = ({
  product,
  selectedVariant,
}: {
  product: ExtendedStoreProduct
  selectedVariant: Record<string, string>
}) => {
  const updateSearchParams = useUpdateSearchParams()

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    if (value) updateSearchParams(optionId, value)
  }

  return (
    <div className="my-4 space-y-2">
      {(product.options || []).map(
        ({ id, title, values }: ProductOption) => (
          <div key={id}>
            <span className="label-md text-secondary">{title}: </span>
            <span className="label-md text-primary">
              {selectedVariant[title.toLowerCase()]}
            </span>
            <div className="flex gap-2 mt-2">
              {(values || []).map(
                ({
                  id,
                  value,
                }: ProductOptionValue) => (
                  <Chip
                    key={id}
                    selected={selectedVariant[title.toLowerCase()] === value}
                    color={title === "Color"}
                    value={value}
                    onSelect={() =>
                      setOptionValue(title.toLowerCase(), value || "")
                    }
                  />
                )
              )}
            </div>
          </div>
        )
      )}
    </div>
  )
}
