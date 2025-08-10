import { HttpTypes } from "@medusajs/types"
import { CategoryNavbar, NavbarSearch } from "@/components/molecules"

export const Navbar = ({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) => {
  return (
    <div className="flex border ring-1 ring-[#BFB7AD] py-4 justify-between">
      <div className="hidden md:flex mx-auto max-w-[1920px] w-full px-6">
        <CategoryNavbar categories={categories} />
      </div>

      <div className="px-6">
        <NavbarSearch />
      </div>
    </div>
  )
}
