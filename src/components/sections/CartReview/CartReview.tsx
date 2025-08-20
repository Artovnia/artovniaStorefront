"use client"

import PaymentButton from "./PaymentButton"
import { CartItems } from "./CartItems"
import { CartSummary } from "@/components/organisms"
import { Text } from "@medusajs/ui"
import InpostParcelInfo from "@/components/molecules/InpostParcelInfo/InpostParcelInfo"
import { InpostParcelData } from "@/lib/services/inpost-api"

// Helper function to calculate shipping total from shipping methods
const calculateShippingTotal = (shippingMethods?: any[]): number => {
  if (!shippingMethods || shippingMethods.length === 0) {
    return 0
  }
  
  return shippingMethods.reduce((total, method) => {
    const amount = method?.amount || 0
    
    return total + amount
  }, 0)
}


const Review = ({ cart, termsAccepted }: { cart: any; termsAccepted?: boolean }) => {
  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  // Check for payment sessions in multiple possible locations
  const hasPaymentCollection = !!cart.payment_collection
  const hasPaymentSessions = !!(cart.payment_sessions && cart.payment_sessions.length > 0)
  const hasPaymentSession = !!cart.payment_session
  const hasSelectedPaymentSession = !!cart.payment_collection?.payment_sessions?.some((s: any) => s.selected === true)
  const hasPaymentProvider = !!(cart.metadata?.payment_provider_id)
  
  

  // Updated condition to check for payment information in multiple locations
  // Also check metadata for payment provider information
  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods?.length > 0 &&
    (hasPaymentCollection || hasPaymentSessions || hasPaymentSession || hasPaymentProvider || paidByGiftcard)

  // Always render the button for better user experience
  const shouldRenderButton = true

  return (
    <div>
      <div className="w-full mb-6">
        <CartItems cart={cart} />
      </div>
      <div className="w-full mb-6 border rounded-sm p-4">
      
        
        <CartSummary
          item_total={cart?.item_total || 0}
          shipping_total={cart?.shipping_total || calculateShippingTotal(cart?.shipping_methods)}
          total={cart?.total || 0}
          currency_code={cart?.currency_code || ""}
          tax={cart?.tax_total || 0}
        />
        
        {/* Display shipping methods and parcel machine info if available */}
        {cart.shipping_methods && cart.shipping_methods.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <Text className="txt-medium-plus text-ui-fg-base mb-2">Metody dostawy:</Text>
            {cart.shipping_methods.map((method: any) => {
              
              return (
              <div key={method.id} className="mb-2">
                <Text className="txt-small-plus text-ui-fg-base">{method.name}</Text>
                <Text className="txt-small text-ui-fg-subtle">Amount: {method.amount || 'undefined'}</Text>
                
                {/* Display InPost parcel machine information if available */}
                {method.data?.inpostParcelMachine && (
                  <InpostParcelInfo 
                    parcelData={method.data.inpostParcelMachine as InpostParcelData} 
                  />
                )}
              </div>
            )
            })}
          </div>
        )}
      </div>

      {shouldRenderButton && (
        <PaymentButton 
          cart={cart} 
          termsAccepted={termsAccepted || false}
          data-testid="submit-order-button" 
        />
      )}
      
      {!previousStepsCompleted && shouldRenderButton && (
        <div className="text-sm text-red-500 mt-2">
          Proszę uzupełnić wszystkie poprzednie kroki przed złożeniem zamówienia.
        </div>
      )}
      
      {/* Add the cart reset component for easier access */}
      {hasPaymentCollection && (
        <div className="mt-6">
          
        </div>
      )}
    </div>
  )
}

export default Review
