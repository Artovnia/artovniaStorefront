"use client"

import { removeShippingMethod } from "@/lib/data/cart"
import { convertToLocale } from "@/lib/helpers/money"
import { HttpTypes } from "@medusajs/types"
import { InpostParcelInfo } from "@/components/molecules"
import { InpostParcelData } from "@/lib/services/inpost-api"
import { unifiedCache } from "@/lib/utils/unified-cache"
import { useState } from "react"
import { Trash2, Loader2, Package } from "lucide-react"

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
      
      // After successful removal, invalidate the cache using new system
      unifiedCache.invalidate('cart')
      
      // Call the callback if provided to update parent state immediately
      // This is critical for ensuring the UI updates correctly
      if (onMethodRemoved) {
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
  
  // Extract capacity info from method data
  const capacityInfo = method.data?.capacity_info as any
  
  // UPDATED 2026-01-20: After workflow optimization, method.amount contains the TOTAL amount
  // (base + overage already included). We extract base and overage for display breakdown.
  const totalAmount = method?.amount || 0
  const overageCharge = capacityInfo?.overage_charge || 0
  const baseAmount = overageCharge > 0 ? totalAmount - overageCharge : totalAmount
  const hasOverage = overageCharge > 0
  
  return (
    <div className="bg-cream-50 border border-cream-300 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <Package size={18} className="text-plum-muted mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-plum">{method?.name}</p>
            
            {/* Show pricing breakdown if there's capacity overage */}
            {hasOverage ? (
              <div className="mt-2 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-plum-muted">Cena bazowa:</span>
                  <span className="text-plum-muted">
                    {convertToLocale({
                      amount: baseAmount,
                      currency_code: currency_code,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-600">Dopłata za pojemność:</span>
                  <span className="text-amber-600">
                    +{convertToLocale({
                      amount: overageCharge,
                      currency_code: currency_code,
                    })}
                  </span>
                </div>
                <div className="flex justify-between font-medium border-t border-cream-200 pt-1">
                  <span className="text-plum">Razem:</span>
                  <span className="text-plum">
                    {convertToLocale({
                      amount: totalAmount,
                      currency_code: currency_code,
                    })}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-plum-muted mt-0.5">
                {convertToLocale({
                  amount: totalAmount,
                  currency_code: currency_code,
                })}
              </p>
            )}
            
            {deleteError && (
              <p className="text-xs text-red-600 mt-1">{deleteError}</p>
            )}
          </div>
        </div>

        <button
          onClick={handleRemoveShippingMethod}
          disabled={isDeleting}
          className="p-2 text-plum-muted hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {isDeleting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
        </button>
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