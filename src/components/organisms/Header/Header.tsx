import Image from "next/image"
import { HttpTypes } from "@medusajs/types"

import {
  CartDropdown,
  HeadingCategories,
  MobileNavbar,
  Navbar,
} from "@/components/cells"
import { SafeI18nLink as Link } from "@/components/atoms/SafeI18nLink"
import { HeartIcon } from "@/icons"
import { StoreIcon } from "@/components/atoms/icons/StoreIcon"
import { listCategoriesWithProducts } from "@/lib/data/categories"
import { UserDropdown } from "@/components/cells/UserDropdown/UserDropdown"
import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { SerializableWishlist } from "@/types/wishlist"
import { Badge } from "@/components/atoms"
import { CountrySelectorWrapper } from "@/components/cells/CountrySelector/CountrySelectorWrapper"

export const Header = async () => {
  // Fetch user data with error handling
  let user = null;
  try {
    user = await retrieveCustomer()
  } catch (error) {
    console.error("Error retrieving customer:", error)
  }
  
  // Fetch wishlist with error handling
  let wishlist: SerializableWishlist[] = []
  
  if (user) {
    try {
      const response = await getUserWishlists()
      wishlist = response?.wishlists || []
    } catch (error) {
      console.error("🏠 Header: Error retrieving wishlists:", error)
    }
  }

  const wishlistCount = wishlist?.[0]?.products?.length || 0

  // Fetch only categories that have products to avoid performance issues
  let topLevelCategories: HttpTypes.StoreProductCategory[] = []
  let allCategoriesWithTree: HttpTypes.StoreProductCategory[] = []
  
  try {
    const categoriesData = await listCategoriesWithProducts()
    
    if (categoriesData && categoriesData.parentCategories) {
      topLevelCategories = categoriesData.parentCategories
      allCategoriesWithTree = categoriesData.categories
    }
  } catch (error) {
    console.error("🏠 Header: Error retrieving categories with products:", error)
  }

  return (
    <header className="sticky top-0 z-50 bg-primary shadow-sm">
      <div className="flex py-2 max-w-[1920px] mx-auto">
        <div className="flex items-center gap-2 lg:gap-4 lg:w-1/3 py-4 ml-4">
          {/* Country Selector - Left side - Hide on mobile, show on md and up */}
          <div className="hidden md:block">
            <CountrySelectorWrapper />
          </div>
          
          <MobileNavbar
            categories={allCategoriesWithTree}
          />
        </div>
        <div className="flex lg:justify-center lg:w-1/3 items-center pl-4 lg:pl-0">
          <Link href="/" className="text-2xl font-bold">
            <Image
              src="/Logo.svg"
              width={163}
              height={52}
              alt="Logo"
              priority
            />
          </Link>
        </div>
        <div className="flex items-center justify-end gap-2 lg:gap-4 w-full lg:w-1/3 py-4 mr-4">
          {/* Store link - Icon on mobile, text on desktop */}
          <a 
            href="https://artovniapanel.netlify.app/login" 
            className="text-lg font-medium hover:text-action transition-colors hover:underline flex items-center"
            aria-label="Załóż sklep"
          >
            <span className="md:hidden">
              <StoreIcon size={24} />
            </span>
            <span className="hidden md:inline mr-4">ZAŁÓŻ SKLEP</span>
          </a>
          
          {/* Hide user dropdown and wishlist on mobile - handled by bottom navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            <UserDropdown user={user} />
            {user && (
              <Link href="/user/wishlist" className="relative">
                <HeartIcon size={20} />
                {Boolean(wishlistCount) && (
                  <Badge className="absolute -top-2 -right-2 w-4 h-4 p-0">
                    {wishlistCount}
                  </Badge>
                )}
              </Link>
            )}
          </div>

          <CartDropdown />
        </div>
      </div>
      <Navbar categories={allCategoriesWithTree} />
    </header>
  )
}