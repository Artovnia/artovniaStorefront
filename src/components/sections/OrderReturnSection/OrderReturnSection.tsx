"use client"

import { Button } from "@/components/atoms"
import { UserNavigation } from "@/components/molecules"
import LocalizedClientLink from "@/components/molecules/LocalizedLink/LocalizedLink"
import { ArrowLeftIcon } from "@/icons"
import { ReturnItemsTab } from "./ReturnItemsTab"
import { useState, useRef } from "react"
import { ReturnSummaryTab } from "./ReturnSummaryTab"
import { ReturnMethodsTab } from "./ReturnMethodsTab"
import { StepProgressBar } from "@/components/cells/StepProgressBar/StepProgressBar"
import { createReturnRequest } from "@/lib/data/orders"
import { useRouter } from "next/navigation"

export const OrderReturnSection = ({
  orderSet,
  returnReasons,
  shippingMethods: initialShippingMethods,
  targetOrderId,
}: {
  orderSet: any
  returnReasons: any[]
  shippingMethods: any[]
  targetOrderId?: string
}) => {
  // Filter returnable items from all orders
  // Only show items that are delivered (fulfilled) and not already returned
  const getReturnableOrders = () => {
    if (!orderSet?.orders || orderSet.orders.length === 0) {
      // Single order case
      return [orderSet]
    }
    
    // If targetOrderId is provided, filter to show only that specific order
    if (targetOrderId) {
      const targetOrder = orderSet.orders.find((o: any) => o.id === targetOrderId)
      if (targetOrder) {
        
        return [targetOrder]
      }
    }
    
    // Fallback: Split order case - filter orders with delivered items
    return orderSet.orders.filter((order: any) => {
      // Check if order has any fulfilled items
      const hasFulfilledItems = order.fulfillments?.some((f: any) => 
        f.shipped_at || f.delivered_at
      )
      return hasFulfilledItems
    })
  }
  
  const returnableOrders = getReturnableOrders()
  
  // For display purposes, use the first returnable order
  const primaryOrder = returnableOrders[0] || orderSet
  const [tab, setTab] = useState(0)
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [error, setError] = useState<boolean>(false)
  const [returnMethod, setReturnMethod] = useState<any>(null)
  const [shippingMethods, setShippingMethods] = useState<any[]>(initialShippingMethods)
  const [isLoadingShipping, setIsLoadingShipping] = useState<boolean>(false)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [targetOrder, setTargetOrder] = useState<any>(primaryOrder)
  const router = useRouter()
  
  // CRITICAL: Use ref for synchronous submission guard
  // React state updates are async, so a ref prevents double-clicks
  const isSubmittingRef = useRef(false)

  const handleTabChange = async (tab: number) => {
    const noReason = selectedItems.filter((item) => !item.reason_id)
    if (!noReason.length) {
      // CRITICAL: When moving to shipping methods tab, fetch fresh shipping options
      // for the order that the selected items belong to
      if (tab === 1 && selectedItems.length > 0) {
        setIsLoadingShipping(true)
        try {
          // Determine which order the selected items belong to
          const selectedItemIds = new Set(selectedItems.map(si => si.line_item_id))
          const foundTargetOrder = returnableOrders.find((o: any) => 
            o.items?.some((item: any) => selectedItemIds.has(item.id))
          ) || primaryOrder
          
          // Update target order state for seller display
          setTargetOrder(foundTargetOrder)
          
          // Fetch fresh shipping methods for this specific order
          const { retrieveReturnMethods } = await import('@/lib/data/orders')
          const freshMethods = await retrieveReturnMethods(foundTargetOrder.id)
          setShippingMethods(freshMethods as any[])
          setReturnMethod(null) // Reset selected method
        } catch (error) {
          console.error('Failed to fetch shipping methods:', error)
        } finally {
          setIsLoadingShipping(false)
        }
      }
      setTab(tab)
    } else {
      setError(true)
    }
  }

  const handleSetReturnMethod = (method: any) => {
    setReturnMethod(method)
  }

  // Updated to fix message channel error and checkbox behavior
  const handleSelectItem = (item: any, reason_id: string = "") => {
    setError(false)
    
    // Check if item is already in selectedItems
    const existingItemIndex = selectedItems.findIndex(i => i.line_item_id === item.id)
    const isSelected = existingItemIndex > -1
    
    // If we're toggling selection (no reason provided) and item is selected, remove it
    if (!reason_id && isSelected) {
      const newSelectedItems = [...selectedItems]
      newSelectedItems.splice(existingItemIndex, 1)
      setSelectedItems(newSelectedItems)
      return
    }
    
    // If toggling selection and item is not selected, add it with empty reason
    if (!reason_id && !isSelected) {
      setSelectedItems([
        ...selectedItems,
        { line_item_id: item.id, quantity: item.quantity, reason_id: "" },
      ])
      return
    }
    
    // If reason is provided and item is selected, update its reason
    if (reason_id && isSelected) {
      const newSelectedItems = selectedItems.map(i => 
        i.line_item_id === item.id ? { ...i, reason_id } : i
      )
      setSelectedItems(newSelectedItems)
      return
    }
    
    // If reason is provided and item is not selected, add it with the reason
    if (reason_id && !isSelected) {
      setSelectedItems([
        ...selectedItems,
        { line_item_id: item.id, quantity: item.quantity, reason_id },
      ])
      return
    }
  }

  const handleSubmit = async () => {
    // CRITICAL: Check ref FIRST (synchronous check before any state updates)
    if (isSubmittingRef.current) {
      return
    }
    
    // Prevent double submission with state check too
    if (isSubmitting) {
      return
    }
    
    try {
      // IMMEDIATELY set both ref and state to prevent double-clicks
      isSubmittingRef.current = true
      setIsSubmitting(true)
      
      
      // CRITICAL: Small delay to ensure loading state renders BEFORE API call
      // This gives React time to show the spinner to the user
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // CRITICAL: Use individual order.id for return request (not order set ID)
      // The backend needs the order ID to look up the seller
      // For split orders, we need to determine which order the selected items belong to
      const selectedItemIds = new Set(selectedItems.map(si => si.line_item_id))
      const targetOrder = returnableOrders.find((o: any) => 
        o.items?.some((item: any) => selectedItemIds.has(item.id))
      ) || primaryOrder
      
      const orderId = targetOrder.id
      
      const data = {
        order_id: orderId,
        customer_note: "",
        shipping_option_id: returnMethod,
        line_items: selectedItems,
      }

      const { order_return_request } = await createReturnRequest(data)
      
      router.push(`/user/orders/${order_return_request.id}/request-success`)
    } catch (error) {
      // Reset BOTH ref and state on error so user can retry
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
    // Note: Don't reset on success - let the router navigation handle it
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 mt-6 gap-5 md:gap-8">
      {/* Desktop Sidebar Navigation - Hidden on mobile */}
      <div className="hidden md:block">
        <UserNavigation />
      </div>
      <div className="md:col-span-3 mb-8 md:mb-0">
        {tab === 0 ? (
          <LocalizedClientLink href={`/user/orders/${orderSet?.id || primaryOrder.id}`}>
            <Button
              variant="tonal"
              className="label-md text-action-on-secondary uppercase flex items-center gap-2"
            >
              <ArrowLeftIcon className="size-4" />
              Szczegóły zamówienia
            </Button>
          </LocalizedClientLink>
        ) : (
          <Button
            variant="tonal"
            className="label-md text-action-on-secondary uppercase flex items-center gap-2"
            onClick={() => setTab(0)}
          >
            <ArrowLeftIcon className="size-4" />
            Wybierz przedmioty
          </Button>
        )}
        <div className="grid grid-cols-1 md:grid-cols-8 gap-4 mt-8">
          <div className="col-span-4">
            <div className="mb-4 font-instrument-sans">
              <StepProgressBar
                steps={["Wybierz przedmioty do zwrotu", "Wybierz metodę zwrotu"]}
                currentStep={tab}
              />
            </div>
            {tab === 0 && (
              <>
                {returnableOrders.map((order: any) => (
                  <ReturnItemsTab
                    key={order.id}
                    order={order}
                    selectedItems={selectedItems}
                    handleSelectItem={handleSelectItem}
                    returnReasons={returnReasons}
                    error={error}
                  />
                ))}
              </>
            )}
            {tab === 1 && (
              isLoadingShipping ? (
                <div className="py-8 text-center">
                  <p className="label-lg">Ładowanie metod zwrotu...</p>
                </div>
              ) : (
                <ReturnMethodsTab
                  shippingMethods={shippingMethods}
                  handleSetReturnMethod={handleSetReturnMethod}
                  returnMethod={returnMethod}
                  seller={targetOrder.seller}
                />
              )
            )}
          </div>
          <div />
          <div className="col-span-4 md:col-span-3">
            <ReturnSummaryTab
              currency_code={primaryOrder.currency_code}
              selectedItems={selectedItems}
              items={primaryOrder.items || []}
              handleTabChange={handleTabChange}
              tab={tab}
              returnMethod={returnMethod}
              handleSubmit={handleSubmit}
              originalOrder={primaryOrder}
              shippingCost={primaryOrder.shipping_total}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  )
}