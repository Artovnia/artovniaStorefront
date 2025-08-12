import { HttpTypes } from "@medusajs/types"
import { CategoryNavbar, NavbarSearch } from "@/components/molecules"

export const Navbar = ({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) => {
  return (
    <div className="w-full border ring-1 ring-[#BFB7AD]">
    <div className="flex  py-4 justify-between max-w-[1920px] mx-auto">
      <div className="hidden md:flex  w-full ">
        <CategoryNavbar categories={categories} />
      </div>

      <div className="px-0">
        <NavbarSearch />
      </div>
    </div>
    </div>
  )
}
