"use client"
import { SelectField } from "@/components/molecules"
import { usePathname } from "next/navigation"
import { useRouter } from '@/i18n/routing'

const selectOptions = [
  { label: "Newest", value: "created_at" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
]

export const ProductListingHeader = ({ total }: { total: number }) => {
  const router = useRouter()
  const pathname = usePathname()

  const selectOptionHandler = (value: string) => {
    router.push(`${pathname}?sortBy=${value}`)
  }

  return (
    <div className="flex justify-between w-full items-center">
      <div>{total} wyników</div>
      <div className='hidden md:flex gap-2 items-center'>
         Sortuj po:{' '}
        <SelectField
          className='min-w-[200px]'
          options={selectOptions}
          selectOption={selectOptionHandler}
        />
      </div>
    </div>
  )
}
