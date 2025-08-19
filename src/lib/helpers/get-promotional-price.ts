import { HttpTypes } from "@medusajs/types"

interface PromotionalProduct extends HttpTypes.StoreProduct {
  promotions?: Array<{
    id: string
    code: string
    type: string
    is_automatic: boolean
    application_method?: {
      type: string
      value: number
      target_type: string
      allocation: string
    }
  }>
  has_promotions?: boolean
}

interface PromotionalPriceResult {
  originalPrice: string
  promotionalPrice: string
  discountPercentage: number
  hasPromotion: boolean
}

export function getPromotionalPrice({
  product,
  regionId,
}: {
  product: PromotionalProduct
  regionId?: string
}): PromotionalPriceResult {
 
  
  // Get the cheapest variant price as base
  const cheapestVariant = product.variants?.reduce((prev, current) => {
    const prevPrice = prev.prices?.find(p => !regionId || p.region_id === regionId)
    const currentPrice = current.prices?.find(p => !regionId || p.region_id === regionId)
    
    if (!prevPrice) return current
    if (!currentPrice) return prev
    
    return (currentPrice.amount || 0) < (prevPrice.amount || 0) ? current : prev
  })

  if (!cheapestVariant) {
    return {
      originalPrice: "0 zł",
      promotionalPrice: "0 zł", 
      discountPercentage: 0,
      hasPromotion: false
    }
  }

  const basePrice = cheapestVariant.prices?.find(p => !regionId || p.region_id === regionId)
  
  if (!basePrice || !product.has_promotions || !product.promotions?.length) {
    const formattedPrice = formatPrice(basePrice?.amount || 0)
    return {
      originalPrice: formattedPrice,
      promotionalPrice: formattedPrice,
      discountPercentage: 0,
      hasPromotion: false
    }
  }

  // Find the best promotion (highest discount)
  let bestDiscountPercentage = 0
  let bestDiscountAmount = 0
  
  for (const promotion of product.promotions) {
    
    
    // Handle Medusa promotion structure - application_method contains the discount details
    if (promotion.application_method) {
      const appMethod = promotion.application_method
      
      
      // Handle percentage discount
      if (appMethod.type === 'percentage' && typeof appMethod.value === 'number') {
        const discountPercentage = appMethod.value
        
        
        if (discountPercentage > bestDiscountPercentage) {
          bestDiscountPercentage = discountPercentage
          bestDiscountAmount = (basePrice.amount * discountPercentage) / 100
        }
      }
      // Handle fixed amount discount
      else if (appMethod.type === 'fixed' && typeof appMethod.value === 'number' && basePrice?.amount) {
        const fixedDiscountAmount = appMethod.value
        const equivalentPercentage = (fixedDiscountAmount / basePrice.amount) * 100
        
        
        if (equivalentPercentage > bestDiscountPercentage) {
          bestDiscountPercentage = Math.round(equivalentPercentage * 100) / 100 // Round to 2 decimal places
          bestDiscountAmount = fixedDiscountAmount
        }
      }
    }
    // Fallback for legacy promotion structures
    else if (promotion.type && typeof (promotion as any).value === 'number') {
      const value = (promotion as any).value
      
      if (promotion.type === 'percentage' && value > bestDiscountPercentage) {
        bestDiscountPercentage = value
        bestDiscountAmount = (basePrice.amount * value) / 100
      } else if (promotion.type === 'fixed' && basePrice?.amount) {
        const equivalentPercentage = (value / basePrice.amount) * 100
        if (equivalentPercentage > bestDiscountPercentage) {
          bestDiscountPercentage = Math.round(equivalentPercentage * 100) / 100
          bestDiscountAmount = value
        }
      }
    }
  }

  if (bestDiscountPercentage === 0 || bestDiscountAmount === 0) {
    const formattedPrice = formatPrice(basePrice.amount || 0)
    
    return {
      originalPrice: formattedPrice,
      promotionalPrice: formattedPrice,
      discountPercentage: 0,
      hasPromotion: false
    }
  }

  const originalAmount = basePrice.amount || 0
  const promotionalAmount = Math.max(0, originalAmount - bestDiscountAmount)

 

  return {
    originalPrice: formatPrice(originalAmount),
    promotionalPrice: formatPrice(promotionalAmount),
    discountPercentage: Math.round(bestDiscountPercentage),
    hasPromotion: true
  }
}

function formatPrice(amount: number): string {
  // Amount is already in main currency unit (not cents), just format it
  const price = amount.toFixed(2)
  return `${price} zł`
}
