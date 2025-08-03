import { CartItems, CartSummary } from "@/components/organisms"
import { retrieveCart } from "@/lib/data/cart"
import CartPromotionCode from "../CartReview/CartPromotionCode"
import { CartClient } from "./CartClient"

export const Cart = async () => {
  const cart = await retrieveCart()

  return (
    <>
      <div className="col-span-12 lg:col-span-6">
        <CartItems cart={cart} />
      </div>
      <div className="lg:col-span-2"></div>
      <div className="col-span-12 lg:col-span-4">
        <div className="w-full mb-6 border rounded-sm p-4">
          <CartPromotionCode cart={cart} />
        </div>
        <div className="border rounded-sm p-4 h-fit">
          <CartSummary
            item_total={cart?.item_total || 0}
            shipping_total={cart?.shipping_total || 0}
            total={cart?.total || 0}
            currency_code={cart?.currency_code || ""}
            tax={cart?.tax_total || 0}
          />
          <CartClient 
            cartTotal={cart?.total || 0}
            currencyCode={cart?.currency_code || ""}
          />
        </div>
      </div>
    </>
  )
}