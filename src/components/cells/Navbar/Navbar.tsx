import { HttpTypes } from "@medusajs/types"
import { CategoryNavbar, NavbarSearch } from "@/components/molecules"

export const Navbar = ({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[]
}) => {
  return (
    <div className="flex border ring-1 ring-[#BFB7AD] opacity-80 py-4 justify-between px-6 ">
      <div className="hidden md:flex  mx-auto max-w-[1920px] w-full ">
        <CategoryNavbar categories={categories} />
      </div>

      <NavbarSearch />
    </div>
  )
}
