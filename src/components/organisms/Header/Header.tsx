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
import { listCategories } from "@/lib/data/categories"
import { sdk } from "@/lib/config"
// Removed hardcoded PARENT_CATEGORIES import - now using dynamic detection
import { retrieveCart } from "@/lib/data/cart"
import { UserDropdown } from "@/components/cells/UserDropdown/UserDropdown"
import { retrieveCustomer } from "@/lib/data/customer"
import { getUserWishlists } from "@/lib/data/wishlist"
import { SerializableWishlist } from "@/types/wishlist"
import { Badge } from "@/components/atoms"

export const Header = async () => {
  // Use try-catch for each data-fetching operation to handle errors gracefully
  const cart = await retrieveCart().catch(() => null)
  
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
  } else {
  }

  const wishlistCount = wishlist?.[0]?.products?.length || 0

  // Fetch categories with full recursive tree using the fixed listCategories function
  let topLevelCategories: HttpTypes.StoreProductCategory[] = []
  let allCategoriesWithTree: HttpTypes.StoreProductCategory[] = []
  
  try {
    // Use the FIXED listCategories function that builds the full recursive tree
    const categoriesData = await listCategories()
    
    if (categoriesData && categoriesData.parentCategories) {
      topLevelCategories = categoriesData.parentCategories
      // FIX: Use only categories array since it now contains the full deduplicated tree
      allCategoriesWithTree = categoriesData.categories
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`🏠 Header: Using ${topLevelCategories.length} parent categories and ${allCategoriesWithTree.length} total categories`);
      }
    }
  } catch (error) {
    console.error("🏠 Header: Error retrieving categories with listCategories:", error)
  }

  return (
    <header>
      <div className="flex py-2 max-w-[1920px] mx-auto">
        <div className="flex items-center lg:w-1/3">
          <MobileNavbar
            parentCategories={topLevelCategories}
            childrenCategories={allCategoriesWithTree}
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
        <div className="flex items-center justify-end gap-2 lg:gap-4 w-full lg:w-1/3 py-4 ">
          <a href="https://artovniapanel.netlify.app/login" className="text-lg mr-4  font-medium hover:text-action transition-colors hover:underline">ZAŁÓŻ SKLEP</a>
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

          <CartDropdown cart={cart} />
        </div>
      </div>
      <Navbar categories={topLevelCategories} />
    </header>
  )
}