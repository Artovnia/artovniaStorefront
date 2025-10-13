"use client"

import { Avatar } from "@/components/atoms"
import { Badge } from "@/components/atoms"
import { Card } from "@/components/atoms"
import { Divider } from "@/components/atoms"
import { Heading } from "@medusajs/ui"
import { StepProgressBar } from "@/components/cells/StepProgressBar/StepProgressBar"
import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CollapseIcon } from "@/icons"
import { convertToLocale } from "@/lib/helpers/money"
import { retrieveReturnReasons } from "@/lib/data/orders"
import { SellerMessageTab } from "@/components/cells/SellerMessageTab/SellerMessageTab"
import Image from "next/image"

// Keep English values for component functionality
// Keep only the original 3 steps to maintain UI consistency
const steps = ["pending", "processing", "sent"]

// Status translation mapping - display Polish text to user
const statusTranslation: Record<string, string> = {
  "pending": "Oczekujący",
  "processing": "W trakcie",
  "approved": "Zatwierdzony",
  "refunded": "Zwrócony",
  "sent": "Wysłany",
  "cancelled": "Anulowany"
}

// Define a type for return reasons from the API
interface ReturnReason {
  id: string
  value?: string
  label: string
  description?: string | null
}

// Fallback function to format reason ID into readable text if API fetch fails
const formatReasonId = (id: string): string => {
  if (!id) return "Nieznany powód";
  
  // Remove prefix if exists
  const withoutPrefix = id.startsWith('rr_') ? id.substring(3) : id
  
  // Convert snake_case to readable text
  return withoutPrefix
    .split('_')
    .map((word: string) => word && word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : '')
    .join(' ');
}

export const SingleOrderReturn = ({
  item,
  user,
  defaultOpen,
}: {
  item: any
  user: any
  defaultOpen: boolean
}) => {
  
  // Store return reasons from API
  const [returnReasons, setReturnReasons] = useState<ReturnReason[]>([])
  const [reasonsLoading, setReasonsLoading] = useState<boolean>(true)
  
  // Fetch return reasons from the API on component mount
  useEffect(() => {
    const fetchReasons = async () => {
      try {
        setReasonsLoading(true)
        
        const reasons = await retrieveReturnReasons()
    
        
        // Convert to our internal ReturnReason type
        const formattedReasons: ReturnReason[] = reasons.map((reason: any) => ({
          id: reason.id,
          value: reason.value || reason.id,
          label: reason.label || formatReasonId(reason.id),
          description: reason.description
        }))
        
        setReturnReasons(formattedReasons)
      } catch (error) {
        console.error('SingleOrderReturn: Error fetching return reasons:', {
          error,
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      } finally {
        setReasonsLoading(false)
      }
    }
    
    fetchReasons()
  }, [])
  
  // Get a human-readable label for a reason ID from a line item
  const getReasonLabel = (lineItem: any): string => {
    const reasonId = lineItem?.reason_id;
    
    
    
    // Handle null, undefined, or empty reason_id (database issue)
    if (!reasonId || reasonId === null || reasonId === undefined || reasonId === '') {
      return "Powód nie został określony"; // More specific message for null reason_id
    }
    
    // Handle case when return reasons API failed to load
    if (!returnReasons || returnReasons.length === 0) {
      return "Powód zwrotu niedostępny"; // When return reasons API failed
    }
    
    // Try to find matching reason
    const matchingReason = returnReasons.find(reason => reason.id === reasonId);
    if (matchingReason) {
      return matchingReason.label;
    }
    
    // If reason_id exists but no matching reason found (orphaned reason_id)
    return `Powód nieznany (ID: ${reasonId})`;
  };

  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [height, setHeight] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)
  
  // Hook effects need to be called at the top level - use conditions inside the hook
  useEffect(() => {
    // Only calculate height if we have data and the content area exists
    if (isOpen && contentRef.current && item?.order) {
      setHeight(contentRef.current.scrollHeight);
    } else {
      setHeight(0);
    }
  }, [isOpen, item?.order]);
  
  // Second effect for scroll height calculation with timeout
  useEffect(() => {
    if (isOpen && contentRef.current) {
      setTimeout(() => {
        if (contentRef.current) {
          setHeight(contentRef.current.scrollHeight)
        }
      }, 100)
    }
  }, [isOpen]);
  
  // If order data is completely missing, show a fallback UI
  if (!item?.order) {
    return (
      <Card className="border border-ui-border-base rounded-lg mb-4 overflow-hidden">
        <div className="flex justify-between items-center p-4">
          <div className="flex flex-col gap-1 grow">
            <div>
              <Heading className="text-ui-fg-base font-medium">Zwrot #{item?.id || 'Nieznany'}</Heading>
            </div>
            <p className="text-ui-fg-subtle">
              Status: {item?.status ? statusTranslation[item.status] || item.status : 'Nieznany'}
            </p>
            <p className="text-ui-fg-subtle mt-1 text-sm">
              Brak danych zamówienia dla tego zwrotu. Skontaktuj się ze sprzedawcą.
            </p>
          </div>
          <Badge className="bg-red-100 text-red-700 whitespace-nowrap">
            Brakujące dane
          </Badge>
        </div>
      </Card>
    )
  }

  // useEffect was moved to the top level

  // Add null checking for item.order and its items
  // Filter to show only items that are being returned (matching line_items)
  const filteredItems = item.order?.items?.filter((orderItem: any) =>
    item.line_items?.some(
      (lineItem: any) => lineItem?.line_item_id === orderItem?.id
    )
  ) || []
  
  // Fallback: If no filtered items found but we have order items, show all (for backwards compatibility)
  const itemsToShow = filteredItems.length > 0 ? filteredItems : (item.order?.items || [])



  // Fix currency code fetching - use comprehensive fallback chain like OrderTotals
  const currency_code = item?.order?.payment_collection?.currency_code || 
                       item?.order?.currency_code || 
                       item?.payment_collection?.currency_code ||
                       'PLN'

  // CALCULATE TOTALS - Handle both cases: with line_items and without
  // CRITICAL: Calculate promotional pricing from payment amount for old orders
  let itemsTotal = 0;
  
  // CRITICAL: Get payment amount from payment_collections (what customer actually paid)
  // DO NOT use order.total as it includes full price without discounts
  const paymentAmount = item.order?.payment_collections?.[0]?.amount || 
                       item.order?.payment_collection?.amount || 0;
  
  // Fallback: If no payment_collections, try to calculate from order data
  // This handles old orders that might not have payment_collections
  const fallbackPaymentAmount = item.order?.total || 0;
  
  const finalPaymentAmount = paymentAmount > 0 ? paymentAmount : fallbackPaymentAmount;
  
  // Get shipping cost (base amount, not total with tax)
  const shippingCost = item.order?.shipping_methods?.[0]?.amount || 
                      item.order?.shipping_total || 0;
  
  // Calculate actual items total: payment - shipping
  const calculatedItemsTotal = finalPaymentAmount - shippingCost;

  // Priority 1: Use line_items for accurate calculation (preferred method)
  if (item.line_items && item.line_items.length > 0) {
    const itemCount = item.line_items.length;
    
    itemsTotal = item.line_items.reduce((acc: number, lineItem: any) => {
      // Find the corresponding order item
      const orderItem = item.order?.items?.find((oi: any) => oi.id === lineItem.line_item_id);
      if (orderItem) {
        // CRITICAL: Check if item.total is meaningful (not equal to unit_price)
        // If item.total === unit_price, it means no promotional calculation was done
        const hasPromotionalPrice = orderItem.total && orderItem.total !== orderItem.unit_price * (lineItem.quantity || 1);
        
        let itemTotal;
        if (hasPromotionalPrice) {
          // Use the promotional price from database
          itemTotal = orderItem.total;
        } else {
          // Calculate proportional price from payment amount
          itemTotal = calculatedItemsTotal / itemCount;
        }
        
        return acc + itemTotal;
      }
      return acc;
    }, 0) || 0;
  } else {
    // FALLBACK: When line_items is empty, calculate total from filtered items
    const itemCount = itemsToShow.length;
    
    itemsTotal = itemsToShow.reduce((acc: number, orderItem: any) => {
      // Check if item has promotional pricing
      const hasPromotionalPrice = orderItem?.total && orderItem.total !== orderItem.unit_price * (orderItem.quantity || 1);
      
      let itemTotal;
      if (hasPromotionalPrice) {
        itemTotal = orderItem.total;
      } else {
        // Calculate proportional price from payment amount
        itemTotal = calculatedItemsTotal / itemCount;
      }
      
      return acc + itemTotal;
    }, 0) || 0;
  }
  
  // 2. Calculate shipping costs - separate original shipping and return shipping
 
  
  // Original shipping cost (what customer paid when ordering) - need to separate from return costs
  let originalShippingCost = 0;
  let returnShippingFromMethods = 0;
  
  if (item?.order?.shipping_methods?.length > 0) {
    // Analyze each shipping method to separate delivery vs return costs
    item.order.shipping_methods.forEach((method: any, index: number) => {
      const methodCost = method.amount || method.price || method.total || 0;
     
      // Identify return shipping methods by return_id field (most reliable)
      const hasReturnId = method.detail?.return_id || method.return_id;
      
      if (hasReturnId) {
        returnShippingFromMethods += methodCost;
      } else {
        originalShippingCost += methodCost;
      }
    });
  } else {
    // Fallback to shipping_total if no methods available
    originalShippingCost = item?.order?.shipping_total || 
                          item?.order?.shipping_subtotal || 
                          item?.order?.delivery_total || 
                          item?.order?.delivery_cost || 0
  }
  
  // Return shipping cost (what customer pays to return items)
  let returnShippingCost = 0;
  
  // Priority 1: Use return shipping found in shipping methods
  if (returnShippingFromMethods > 0) {
    returnShippingCost = returnShippingFromMethods;
  } else {
    // Priority 2: Check return-specific fields
    const returnShippingFields = item?.return_shipping_cost || item?.shipping_cost || item?.return_shipping_total || 0;
    
    if (returnShippingFields > 0) {
      returnShippingCost = returnShippingFields;
    } else {
      // Priority 3: Check if there are return shipping methods specifically
      if (item?.return_shipping_methods?.length > 0) {
        returnShippingCost = item.return_shipping_methods.reduce((shippingAcc: number, method: any) => {
          const methodCost = method.amount || method.price || method.total || 0;
          return shippingAcc + methodCost;
        }, 0);
      } else {
        returnShippingCost = 0;
      }
    }
  }
  
  // 3. Calculate final total - product refund + original shipping cost (customer gets back what they paid)
  // Return shipping cost is NOT included in refund total (customer pays separately if applicable)
  const subtotal = Number(itemsTotal) || 0;
  const originalShipping = Number(originalShippingCost) || 0;
  const returnShipping = Number(returnShippingCost) || 0;
  const total = subtotal + originalShipping; // Refund = items + original shipping


  // Map status to appropriate step in our 3-step progress bar
  let currentStep = 0 // Default to first step (pending)
  
  // Map all possible statuses to one of our 3 steps
  if (item.status === "pending") {
    currentStep = 0 // First step
  } else if (item.status === "processing") {
    currentStep = 1 // Second step
  } else if (["approved", "refunded", "sent"].includes(item.status)) {
    currentStep = 2 // Final step for any completed state
  } else {
    currentStep = 0 // Default to pending for unknown statuses
  }

  return (
    <>
      <Card className="bg-secondary p-4 flex justify-between mt-8 border border-[#3B3634]">
        <Heading level="h2" className="font-instrument-sans">Zamówienie: #{item?.order?.display_id || 'N/A'}</Heading>
        <div className="flex flex-col gap-2 items-center ">
          <p className="label-sm text-secondary">
            Data prośby zwrotu:{" "}
            {item?.created_at ? format(new Date(item.created_at), "MMM dd, yyyy") : "Brak daty"}
          </p>
        </div>
      </Card>
      <Card className="p-0">
        <div
          className="p-4 flex justify-between items-center cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Heading level="h3" className="uppercase label-md !font-semibold">
            {statusTranslation[item.status] || item.status}
          </Heading>
          <p className="label-sm text-secondary flex gap-2">
            {item.line_items.length}{" "}
            {item.line_items.length > 1 ? "przedmiotów" : "przedmiotu"}
            <CollapseIcon
              className={cn(
                "w-5 h-5 text-secondary transition-transform duration-300",
                isOpen ? "rotate-180" : ""
              )}
            />
          </p>
        </div>
        <div
          className={cn("transition-all duration-300 overflow-hidden border border-[#3B3634] rounded-sm")}
          style={{
            maxHeight: isOpen ? `${height}px` : "0px",
            opacity: isOpen ? 1 : 0,
            transition: "max-height 0.3s ease-in-out, opacity 0.2s ease-in-out",
          }}
          ref={contentRef}
        >
          <Divider />
          <div className="p-4 uppercase">
            <StepProgressBar 
              steps={steps.map(step => statusTranslation[step] || step)} 
              currentStep={currentStep} 
            />
          </div>
          <Divider />
          <div className="p-4 flex justify-between">
            {item?.order?.seller ? (
              <>
                <div className="flex items-center gap-2">
                  <Avatar
                    src={item.order.seller.photo || item.order.seller.avatar || item.order.seller.image || item.order.seller.profile_picture || "/talkjs-placeholder.jpg"}
                  />
                  <p className="label-lg text-primary">{item.order.seller.name || item.order.seller.display_name || item.order.seller.business_name || 'Sprzedawca'}</p>
                
                </div>
                <SellerMessageTab
                  seller_id={item.order.seller.id}
                  seller_name={item.order.seller.name || item.order.seller.display_name || 'Sprzedawca'}
                  isAuthenticated={user !== null}
                />
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Avatar src={"/talkjs-placeholder.jpg"} />
                <p className="label-lg text-primary">Sprzedawca niedostępny</p>
              </div>
            )}
          </div>
          <Divider />
          <div className="p-4 flex justify-between w-full">
            <div className="flex flex-col gap-4 w-full">
              {itemsToShow.map((orderItem: any, index: number) => {
                // Find the corresponding line item with the return reason, with null checking
                const returnLineItem = item?.line_items?.find(
                  (li: any) => li?.line_item_id === orderItem?.id
                );
                
                // Calculate display price for this item
                const hasPromotionalPrice = orderItem.total && orderItem.total !== orderItem.unit_price * (orderItem.quantity || 1);
                const displayPrice = hasPromotionalPrice 
                  ? orderItem.total 
                  : (calculatedItemsTotal / itemsToShow.length); // Use calculated proportional price
                
                return (
                <div key={orderItem.id} className="flex items-center gap-2 border-b border-[#3B3634] pb-2">
                  <div className="flex items-center gap-4 w-1/2">
                    <div className="rounded-sm overflow-hidden border ">
                      {orderItem.thumbnail ? (
                        <Image
                          src={orderItem.thumbnail}
                          alt={orderItem.product_title}
                          width={60}
                          height={60}
                        />
                      ) : (
                        <Image
                          src="/images/placeholder.svg"
                          alt={orderItem.product_title}
                          width={60}
                          height={60}
                          className="scale-50 opacity-25"
                        />
                      )}
                    </div>
                    <div>
                      <p className="label-md !font-semibold text-primary">
                        {orderItem.product_title}
                      </p>
                      <p className="label-md text-secondary">{orderItem.title}</p>
                    </div>
                  </div>
                  <div className="flex justify-between w-1/2 ">
                    <p className="label-md !font-semibold text-primary">
                      <Badge className="bg-primary text-primary border border-[#3B3634] rounded-sm">
                        {(() => {
                         
                          if (returnLineItem) {
                            const result = getReasonLabel(returnLineItem);
                            return result;
                          } else {
                            return 'Powód zwrotu niedostępny';
                          }
                        })()}
                      </Badge>
                    </p>
                    <p className="label-sm !font-semibold text-primary">
                      {convertToLocale({
                        amount: displayPrice,
                        currency_code,
                      })}
                    </p>
                  </div>
                </div>
              )})}
            </div>
          </div>
          <Divider />
          <div className="p-4 flex justify-between  ">
            <p className="text-secondary label-sm">Koszt dostawy:</p>
            <span className="font-instrument-sans label-sm">
              {convertToLocale({
                amount: originalShipping,
                currency_code,
              })}
            </span>
          </div>
          <div className="p-4 flex justify-between  ">
            <p className="text-secondary label-sm">Koszt zwrotu:</p>
            <span className="font-instrument-sans label-sm">
              {convertToLocale({
                amount: returnShipping,
                currency_code,
              })}
            </span>
          </div>
          
          <Divider className="mt-4" />
          
          <div className="p-4 flex justify-between items-center border-t border-[#3B3634]">
            <p className="text-secondary label-md">Suma zwrotu:</p>
            <span className="font-instrument-sans heading-md">
              {convertToLocale({
                amount: total,
                currency_code,
              })}
            </span>
          </div>
        </div>
      </Card>
    </>
  )
}