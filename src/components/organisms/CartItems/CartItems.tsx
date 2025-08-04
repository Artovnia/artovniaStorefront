import {
  CartItemsFooter,
  CartItemsHeader,
  CartItemsProducts,
} from "@/components/cells"
import { HttpTypes } from "@medusajs/types"

export const CartItems = ({ 
  cart, 
  onCartUpdate 
}: { 
  cart: HttpTypes.StoreCart | null
  onCartUpdate?: (updatedCart: HttpTypes.StoreCart) => void
}) => {
  if (!cart) return null

  const groupedItems: any = groupItemsBySeller(cart)

  return Object.keys(groupedItems).map((key) => (
    <div key={key} className="mb-4">
      <CartItemsHeader seller={groupedItems[key]?.seller} />
      <CartItemsProducts
        products={groupedItems[key].items || []}
        currency_code={cart.currency_code}
        cartId={cart.id}
        onCartUpdate={onCartUpdate}
      />
      <CartItemsFooter
        currency_code={cart.currency_code}
        price={getSellerShippingTotal(cart, key)}
        sellerId={key}
      />
    </div>
  ))
}

/**
 * Get the shipping total for a specific seller
 * Only returns a shipping cost if there's an actual shipping method selected for this seller
 */
function getSellerShippingTotal(cart: HttpTypes.StoreCart, sellerId: string): number | undefined {
  // If there are no shipping methods at all, return undefined
  if (!cart.shipping_methods || cart.shipping_methods.length === 0) {
    return undefined;
  }
  
  // Check if there's a shipping method for this specific seller
  const sellerShippingMethod = cart.shipping_methods.find(method => {
    // Check if this method has seller data and it matches our seller
    return method.data?.seller_id === sellerId;
  });
  
  // If we found a shipping method for this seller, return its amount
  if (sellerShippingMethod) {
    return sellerShippingMethod.amount || 0;
  }
  
  // If there are no seller-specific shipping methods, but this is the only seller
  // and there's an admin shipping method, return that amount
  const sellerCount = Object.keys(groupItemsBySeller(cart)).length;
  if (sellerCount === 1 && cart.shipping_methods.length > 0) {
    // This is the only seller, so return the first shipping method amount
    return cart.shipping_total || 0;
  }
  
  // Otherwise, don't show any shipping cost
  return undefined;
}

function groupItemsBySeller(cart: HttpTypes.StoreCart) {
  const groupedBySeller: any = {}

  cart.items?.forEach((item: any) => {
    const seller = item.product?.seller
    if (seller) {
      if (!groupedBySeller[seller.id]) {
        groupedBySeller[seller.id] = {
          seller: seller,
          items: [],
        }
      }
      groupedBySeller[seller.id].items.push(item)
    } else {
      if (!groupedBySeller["Artovnia"]) {
        groupedBySeller["Artovnia"] = {
          seller: {
            name: "Artovnia",
            id: "Artovnia",
            photo: "/Logo.svg",
            created_at: new Date(),
          },
          items: [],
        }
      }
      groupedBySeller["Artovnia"].items.push(item)
    }
  })

  return groupedBySeller
}
