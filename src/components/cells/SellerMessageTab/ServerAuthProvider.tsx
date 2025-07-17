"use server"

import { retrieveCustomer } from "@/lib/data/customer"
import { SellerMessageTab } from "./SellerMessageTab"

/**
 * Server component that checks authentication and passes it to the client component
 * This component works with the App Router
 */
export async function ServerAuthProvider({
  seller_id,
  seller_name,
}: {
  seller_id: string
  seller_name: string
}) {
  // Check if user is authenticated on the server using the established pattern
  const customer = await retrieveCustomer()
  const isAuthenticated = !!customer
  
  console.log("Authentication status in ServerAuthProvider:", { 
    isAuthenticated,
    hasCustomer: !!customer,
    customerId: customer?.id
  })
  
  // Pass the authentication status to the client component
  return (
    <SellerMessageTab
      seller_id={seller_id}
      seller_name={seller_name}
      isAuthenticated={isAuthenticated}
    />
  )
}
