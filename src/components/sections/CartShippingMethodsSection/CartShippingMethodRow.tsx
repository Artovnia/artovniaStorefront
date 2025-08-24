"use client"

import { Button } from "@/components/atoms"
import { BinIcon } from "@/icons"
import { removeShippingMethod } from "@/lib/data/cart"
import { convertToLocale } from "@/lib/helpers/money"
import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import { InpostParcelInfo } from "@/components/molecules"
import { InpostParcelData } from "@/lib/services/inpost-api"
import { invalidateCheckoutCache } from "@/lib/utils/persistent-cache"
import { useState } from "react"

export const CartShippingMethodRow = ({
  method,
  currency_code,
  parcelData,
  cartId,
  onMethodRemoved,
}: {
  method: HttpTypes.StoreCartShippingMethod
  currency_code: string
  parcelData?: InpostParcelData
  cartId: string
  onMethodRemoved?: (methodId: string, sellerId?: string) => void
}) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const handleRemoveShippingMethod = async () => {
    try {
      setIsDeleting(true)
      setDeleteError(null)
      
      // Enhanced seller ID resolution
      let sellerId: string | undefined = undefined;
      
      // Try to get the seller ID from the method data first (most reliable source)
      if (method.data?.seller_id) {
        sellerId = method.data.seller_id as string;
      }
      // Fallback: try to extract from the type or metadata if available
      else if (method.data?.type === 'seller_specific' && method.data?.seller_specific_id) {
        sellerId = method.data.seller_specific_id as string;
      }
      
     
      
      // Attempt to delete the shipping method
      const response = await removeShippingMethod(method.id);
      console.log('Shipping method deletion response:', response);
      
      // After successful removal, invalidate the cache
      invalidateCheckoutCache(cartId);
    
      
      // Call the callback if provided to update parent state immediately
      // This is critical for ensuring the UI updates correctly
      if (onMethodRemoved) {
        console.log(`Notifying parent about deletion: method=${method.id}, seller=${sellerId || 'unknown'}`);
        await onMethodRemoved(method.id, sellerId);
      }
      
      // Success - cart will be revalidated by removeShippingMethod function
    } catch (error: any) {
      console.error("Failed to remove shipping method:", error);
      setDeleteError(error.message || "Nie udało się usunąć metody dostawy");
    } finally {
      setIsDeleting(false);
    }
  }

  const isInpostPaczkomat = method.name?.toLowerCase().includes('paczkomat')
  

  return (
    <div className="mb-4 border rounded-md p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Text className="txt-medium-plus text-ui-fg-base mb-1">Metoda dostawy</Text>
          <Text className="txt-medium text-ui-fg-subtle">
            {method?.name}{" "}
            {convertToLocale({
              amount: method?.amount!,
              currency_code: currency_code,
            })}
          </Text>
          {deleteError && (
            <Text className="txt-small text-ui-fg-error mt-1">{deleteError}</Text>
          )}
        </div>

        <Button
          variant="tonal"
          size="small"
          className="p-2"
          onClick={handleRemoveShippingMethod}
          loading={isDeleting}
          disabled={isDeleting}
        >
          {!isDeleting && <BinIcon size={16} />}
        </Button>
      </div>

      {/* Show InPost parcel info if available */}
      {isInpostPaczkomat && parcelData && (
        <div className="mt-3">
          <InpostParcelInfo parcelData={parcelData} />
        </div>
      )}
    </div>
  )
}