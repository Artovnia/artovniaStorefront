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
import { Chat } from "../Chat/Chat"
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
  if (!id) return "Unknown reason";
  
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
        // Error handling without console.log
      } finally {
        setReasonsLoading(false)
      }
    }
    
    fetchReasons()
  }, [])
  
  // Get a human-readable label for a reason ID
  const getReasonLabel = (reasonId: string): string => {
    if (!reasonId) return "Brak powodu zwrotu"
    
    // Find the reason in our fetched reasons list
    const matchingReason = returnReasons.find(reason => 
      reason.id === reasonId || reason.value === reasonId
    )
    
    // Return the label if found
    if (matchingReason) {
      return matchingReason.label
    }
    
    // If not found, format the ID into a readable label
    return formatReasonId(reasonId)
  }

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

  useEffect(() => {
    setTimeout(() => {
      if (contentRef.current) {
        setHeight(contentRef.current.scrollHeight)
      }
    }, 100)
  }, [isOpen])

  // Add null checking for item.order and its items
  const filteredItems = item.order?.items?.filter((orderItem: any) =>
    item.line_items?.some(
      (lineItem: any) => lineItem?.line_item_id === orderItem?.id
    )
  ) || []

  const currency_code = item?.order?.currency_code || "usd"

  // EXTREMELY SIMPLIFIED APPROACH
  // 1. Calculate the sum of returned products (from line items) with null checking
  const itemsTotal = item?.line_items?.reduce((acc: number, lineItem: any) => {
    // Check if we have valid line item
    if (!lineItem) return acc;
    
    // Find the corresponding order item to get the unit price
    const orderItem = item?.order?.items?.find((oi: any) => oi?.id === lineItem?.line_item_id);
    if (!orderItem) return acc;
    
    // Multiply unit price by quantity being returned (with null checks)
    const unitPrice = orderItem?.unit_price || 0;
    const quantity = lineItem?.quantity || 0;
    return acc + (unitPrice * quantity);
  }, 0) || 0;
  
  // 2. Get shipping cost with comprehensive null checking
  const shippingCost = item?.order?.shipping_methods?.[0]?.price || 
                      item?.order?.shipping_total || 
                      item?.order?.shipping_price || 
                      0;
  
  // 3. Simple addition - make sure shipping cost is definitely included and values are valid numbers
  // Use Number() to force numeric values
  const subtotal = Number(itemsTotal) || 0;
  const shipping = Number(shippingCost) || 0;
  const total = subtotal + shipping;

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
      <Card className="bg-secondary p-4 flex justify-between mt-8">
        <Heading level="h2">Zamówienie: #{item.order.display_id}</Heading>
        <div className="flex flex-col gap-2 items-center">
          <p className="label-sm text-secondary">
            Data prośby zwrotu:{" "}
            {format(item.line_items[0].created_at, "MMM dd, yyyy")}
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
          className={cn("transition-all duration-300 overflow-hidden")}
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
                    src={item.order.seller.photo || "/talkjs-placeholder.jpg"}
                  />
                  <p className="label-lg text-primary">{item.order.seller.name}</p>
                </div>
                <Chat
                  user={user}
                  seller={item.order.seller}
                  buttonClassNames="uppercase"
                  order_id={item.order.id}
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
              {filteredItems.map((orderItem: any) => {
                // Find the corresponding line item with the return reason, with null checking
                const returnLineItem = item?.line_items?.find(
                  (li: any) => li?.line_item_id === orderItem?.id
                );
                
                return (
                <div key={orderItem.id} className="flex items-center gap-2">
                  <div className="flex items-center gap-4 w-1/2">
                    <div className="rounded-sm overflow-hidden border">
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
                  <div className="flex justify-between w-1/2">
                    <p className="label-md !font-semibold text-primary">
                      <Badge className="bg-primary text-primary border rounded-sm">
                        {returnLineItem && returnLineItem.reason_id ? (
                          // Use our helper function to get the correct label
                          getReasonLabel(returnLineItem.reason_id)
                        ) : (
                          "Brak powodu zwrotu"
                        )}
                      </Badge>
                    </p>
                    <p className="label-md !font-semibold text-primary">
                      {convertToLocale({
                        amount: orderItem.unit_price,
                        currency_code,
                      })}
                    </p>
                  </div>
                </div>
              )})}
            </div>
          </div>
          <Divider />
          {/* Totals Section - Exact copy from OrderTotals component */}
          <div className="p-4 flex justify-between">
            <p className="text-secondary label-md mb-2">Podsumowanie:</p>
            <span className="text-primary">
              {convertToLocale({
                amount: itemsTotal,
                currency_code,
              })}
            </span>
          </div>
          
          <div className="p-4 flex justify-between border-t border-ui-border-base">
            <p className="text-secondary label-md">Dostawa:</p>
            <span className="text-primary">
              {convertToLocale({
                amount: shippingCost,
                currency_code,
              })}
            </span>
          </div>
          
          <Divider className="my-4" />
          
          <div className="p-4 flex justify-between items-center">
            <p className="text-secondary label-md">Suma:</p>
            <span className="text-primary heading-md">
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