"use client"

import { Avatar } from "@/components/atoms"
import { Card } from "@/components/atoms"
import { Divider } from "@/components/atoms"
import { Heading } from "@medusajs/ui"
import { StepProgressBar } from "@/components/cells/StepProgressBar/StepProgressBar"
import { useEffect, useRef, useState } from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { CollapseIcon } from "@/icons"
import { convertToLocale } from "@/lib/helpers/money"
import { useReturnReasons } from "@/components/context/ReturnReasonsContext"
import { SellerMessageTab } from "@/components/cells/SellerMessageTab/SellerMessageTab"
import Image from "next/image"

const steps = ["pending", "processing", "sent"]

const statusTranslation: Record<string, string> = {
  pending: "Oczekujący",
  processing: "W trakcie",
  approved: "Zatwierdzony",
  refunded: "Zwrócony",
  sent: "Wysłany",
  cancelled: "Anulowany",
}

const formatReasonId = (id: string): string => {
  if (!id) return "Nieznany powód"

  const withoutPrefix = id.startsWith("rr_") ? id.substring(3) : id

  return withoutPrefix
    .split("_")
    .map((word: string) =>
      word && word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : ""
    )
    .join(" ")
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
  const { returnReasons, isLoading: reasonsLoading } = useReturnReasons()

  const getReasonLabel = (lineItem: any): string => {
    const reasonId = lineItem?.reason_id

    if (
      !reasonId ||
      reasonId === null ||
      reasonId === undefined ||
      reasonId === ""
    ) {
      return "Powód nie został określony"
    }

    if (!returnReasons || returnReasons.length === 0) {
      return "Powód zwrotu niedostępny"
    }

    const matchingReason = returnReasons.find(
      (reason) => reason.id === reasonId
    )
    if (matchingReason) {
      return matchingReason.label
    }

    return `Powód nieznany (ID: ${reasonId})`
  }

  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [height, setHeight] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen && contentRef.current && item?.order) {
      setHeight(contentRef.current.scrollHeight)
    } else {
      setHeight(0)
    }
  }, [isOpen, item?.order])

  useEffect(() => {
    if (isOpen && contentRef.current) {
      setTimeout(() => {
        if (contentRef.current) {
          setHeight(contentRef.current.scrollHeight)
        }
      }, 100)
    }
  }, [isOpen])

  if (!item?.order) {
    return (
      <Card className="mb-4 overflow-hidden rounded-lg border border-ui-border-base">
        <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex grow flex-col gap-1">
            <div>
              <Heading className="text-ui-fg-base font-medium">
                Zwrot #{item?.id || "Nieznany"}
              </Heading>
            </div>
            <p className="text-ui-fg-subtle">
              Status:{" "}
              {item?.status
                ? statusTranslation[item.status] || item.status
                : "Nieznany"}
            </p>
            <p className="text-ui-fg-subtle mt-1 text-sm">
              Brak danych zamówienia dla tego zwrotu. Skontaktuj się ze
              sprzedawcą.
            </p>
          </div>
          <span className="inline-flex w-fit items-center justify-center whitespace-nowrap rounded-sm border border-red-200 bg-red-100 px-3 py-1.5 text-xs font-medium text-red-700">
            Brakujące dane
          </span>
        </div>
      </Card>
    )
  }

  const filteredItems =
    item.order?.items?.filter((orderItem: any) =>
      item.line_items?.some(
        (lineItem: any) => lineItem?.line_item_id === orderItem?.id
      )
    ) || []

  const itemsToShow =
    filteredItems.length > 0 ? filteredItems : item.order?.items || []

  const currency_code =
    item?.order?.payment_collection?.currency_code ||
    item?.order?.currency_code ||
    item?.payment_collection?.currency_code ||
    "PLN"

  // CRITICAL: Use actual refund_amount from backend instead of calculating
  // The backend already calculated the correct refund based on returned items
  let itemsTotal = 0


  // CRITICAL: refund_amount is undefined in Medusa, must calculate from returned items
  if (item.line_items && item.line_items.length > 0 && item.order?.items) {
    // Calculate from returned items by matching with order items
    itemsTotal = item.line_items.reduce((acc: number, returnLineItem: any) => {
      // Find the matching order item
      const orderItem = item.order.items.find(
        (oi: any) => oi.id === returnLineItem.line_item_id
      )
      
      if (orderItem) {
        // Backend already calculated correct item.total with adjustments
        const itemPrice = orderItem.total || 0
        const returnedQty = returnLineItem.quantity || 1
        const originalQty = orderItem.quantity || 1
        
        // Calculate proportional refund if partial quantity returned
        const refundAmount = originalQty > 0 
          ? (itemPrice / originalQty) * returnedQty
          : itemPrice
        
        return acc + refundAmount
      }
      return acc
    }, 0) || 0
    
  
  } else if (item.refund_amount) {
    // Fallback to refund_amount if available
    itemsTotal = item.refund_amount
 
  }

  // CRITICAL: Calculate shipping refund
  // Since refund_amount is undefined, check if shipping was refunded by looking at shipping methods
  const subtotal = Number(itemsTotal) || 0
  
  // Check if shipping was refunded by looking for shipping methods with return_id
  let returnShipping = 0
  
  
  if (item?.order?.shipping_methods?.length > 0) {
    item.order.shipping_methods.forEach((method: any) => {
      const hasReturnId = method.detail?.return_id === item.id || 
                         method.return_id === item.id ||
                         method.metadata?.return_id === item.id
      
      if (hasReturnId) {
        // Use the first available price field
        const methodCost = method.amount || method.total || method.price || 0
        returnShipping += methodCost
       
      }
    })
  }
  
  // Check if all items were returned (full refund including shipping)
  const allItemsReturned = item.line_items?.length === item.order?.items?.length
  if (allItemsReturned && returnShipping === 0) {
    // If all items returned but no shipping method found, assume shipping was refunded
    const firstMethod = item.order?.shipping_methods?.find((m: any) => m.name !== 'customer-shipping')
    const shippingCost = firstMethod?.amount || firstMethod?.total || firstMethod?.price || 0
    returnShipping = shippingCost
 
  }
  
  const total = subtotal + returnShipping
  
  

  let currentStep = 0

  if (item.status === "pending") {
    currentStep = 0
  } else if (item.status === "processing") {
    currentStep = 1
  } else if (["approved", "refunded", "sent"].includes(item.status)) {
    currentStep = 2
  } else {
    currentStep = 0
  }

  return (
    <>
      {/* Header Card */}
      <Card className="mt-8 flex flex-col gap-2 border border-[#3B3634] bg-secondary p-4 sm:flex-row sm:items-center sm:justify-between">
        <Heading level="h2" className="font-instrument-sans text-base sm:text-lg">
          Zamówienie: #{item?.order?.display_id || "N/A"}
        </Heading>
        <p className="label-sm text-secondary">
          Data prośby zwrotu:{" "}
          {item?.created_at
            ? format(new Date(item.created_at), "MMM dd, yyyy")
            : "Brak daty"}
        </p>
      </Card>

      {/* Main Content Card */}
      <Card className="overflow-hidden p-0">
        {/* Collapsible Header */}
        <div
          className="flex cursor-pointer items-center justify-between p-4"
          onClick={() => setIsOpen(!isOpen)}
        >
          <Heading level="h3" className="label-md uppercase !font-semibold">
            {statusTranslation[item.status] || item.status}
          </Heading>
          <p className="label-sm flex items-center gap-2 text-secondary">
            <span className="hidden xs:inline">
              {item.line_items.length}{" "}
              {item.line_items.length > 1 ? "przedmiotów" : "przedmiotu"}
            </span>
            <span className="xs:hidden">{item.line_items.length}x</span>
            <CollapseIcon
              className={cn(
                "h-5 w-5 text-secondary transition-transform duration-300",
                isOpen ? "rotate-180" : ""
              )}
            />
          </p>
        </div>

        {/* Collapsible Content */}
        <div
          className={cn(
            "overflow-hidden rounded-sm border border-[#3B3634] transition-all duration-300"
          )}
          style={{
            maxHeight: isOpen ? `${height}px` : "0px",
            opacity: isOpen ? 1 : 0,
            transition: "max-height 0.3s ease-in-out, opacity 0.2s ease-in-out",
          }}
          ref={contentRef}
        >
          <Divider />

          {/* Progress Bar */}
          <div className="p-4 uppercase">
            <StepProgressBar
              steps={steps.map((step) => statusTranslation[step] || step)}
              currentStep={currentStep}
            />
          </div>

          <Divider />

          {/* Seller Section - RESPONSIVE FIX */}
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            {item?.order?.seller ? (
              <>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={
                        item.order.seller.photo ||
                        item.order.seller.avatar ||
                        item.order.seller.image ||
                        item.order.seller.profile_picture ||
                        "/talkjs-placeholder.jpg"
                      }
                    />
                    <p className="label-lg text-primary">
                      {item.order.seller.name ||
                        item.order.seller.display_name ||
                        item.order.seller.business_name ||
                        "Sprzedawca"}
                    </p>
                  </div>
                  {(item.order.seller.address_line ||
                    item.order.seller.city) && (
                    <p className="label-sm ml-0 text-secondary sm:ml-12">
                      {[
                        item.order.seller.address_line,
                        item.order.seller.postal_code && item.order.seller.city
                          ? `${item.order.seller.postal_code} ${item.order.seller.city}`
                          : item.order.seller.city,
                        item.order.seller.country_code,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                    </p>
                  )}
                </div>
                <div className="self-start sm:self-center">
                  <SellerMessageTab
                    seller_id={item.order.seller.id}
                    seller_name={
                      item.order.seller.name ||
                      item.order.seller.display_name ||
                      "Sprzedawca"
                    }
                    isAuthenticated={user !== null}
                  />
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Avatar src={"/talkjs-placeholder.jpg"} />
                <p className="label-lg text-primary">Sprzedawca niedostępny</p>
              </div>
            )}
          </div>

          <Divider />

          {/* Items List - RESPONSIVE FIX */}
          <div className="p-4">
            <div className="flex w-full flex-col gap-4">
              {itemsToShow.map((orderItem: any) => {
                const returnLineItem = item?.line_items?.find(
                  (li: any) => li?.line_item_id === orderItem?.id
                )

                // Use the actual item price from backend (already calculated with adjustments)
                const itemPrice = orderItem.total || 0
                const returnedQty = returnLineItem?.quantity || 1
                const originalQty = orderItem.quantity || 1
                
                // Calculate proportional price if partial quantity returned
                const itemDisplayPrice = originalQty > 0 
                  ? (itemPrice / originalQty) * returnedQty
                  : itemPrice

                return (
                  <div
                    key={orderItem.id}
                    className="flex flex-col gap-3 border-b border-[#3B3634] pb-4 last:border-b-0 sm:flex-row sm:items-center sm:gap-4"
                  >
                    {/* Product Image and Title */}
                    <div className="flex items-center gap-3 sm:w-1/2 sm:gap-4">
                      <div className="h-[60px] w-[60px] flex-shrink-0 overflow-hidden rounded-sm border">
                        {orderItem.thumbnail ? (
                          <Image
                            src={orderItem.thumbnail}
                            alt={orderItem.product_title}
                            width={60}
                            height={60}
                            className="h-full w-full object-cover"
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
                      <div className="min-w-0 flex-1">
                        <p className="label-md line-clamp-2 !font-semibold text-primary">
                          {orderItem.product_title}
                        </p>
                        <p className="label-md truncate text-secondary">
                          {orderItem.title}
                        </p>
                      </div>
                    </div>

                    {/* Reason Badge and Price */}
                    <div className="flex items-center justify-between gap-2 sm:w-1/2 sm:justify-end sm:gap-4">
                      <span className="inline-flex max-w-[180px] items-center justify-center truncate rounded-sm border border-[#3B3634] bg-primary px-3 py-1.5 text-xs font-medium text-primary sm:max-w-none">
                        {returnLineItem
                          ? getReasonLabel(returnLineItem)
                          : "Powód zwrotu niedostępny"}
                      </span>
                      <p className="label-sm flex-shrink-0 !font-semibold text-primary">
                        {convertToLocale({
                          amount: itemDisplayPrice,
                          currency_code,
                        })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <Divider />

          {/* Cost Summary - Show breakdown */}
          <div className="space-y-0">
            <div className="flex items-center justify-between p-4 pb-2">
              <p className="label-sm text-secondary">Zwrot za produkty:</p>
              <span className="label-sm font-instrument-sans">
                {convertToLocale({
                  amount: subtotal,
                  currency_code,
                })}
              </span>
            </div>

            {returnShipping > 0 && (
              <div className="flex items-center justify-between p-4 pt-2">
                <p className="label-sm text-secondary">Zwrot za dostawę:</p>
                <span className="label-sm font-instrument-sans">
                  {convertToLocale({
                    amount: returnShipping,
                    currency_code,
                  })}
                </span>
              </div>
            )}
          </div>

          <Divider />

          {/* Total */}
          <div className="flex items-center justify-between border-t border-[#3B3634] p-4">
            <p className="label-md text-secondary">Suma zwrotu:</p>
            <span className="heading-md font-instrument-sans">
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