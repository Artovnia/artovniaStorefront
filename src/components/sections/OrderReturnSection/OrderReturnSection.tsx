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
  order,
  orderSet,
  returnReasons,
  shippingMethods,
}: {
  order: any
  orderSet?: any
  returnReasons: any[]
  shippingMethods: any[]
}) => {
  const [tab, setTab] = useState(0)
  const [selectedItems, setSelectedItems] = useState<any[]>([])
  const [error, setError] = useState<boolean>(false)
  const [returnMethod, setReturnMethod] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const router = useRouter()
  
  // CRITICAL: Use ref for synchronous submission guard
  // React state updates are async, so a ref prevents double-clicks
  const isSubmittingRef = useRef(false)

  const handleTabChange = (tab: number) => {
    const noReason = selectedItems.filter((item) => !item.reason_id)
    if (!noReason.length) {
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
      console.log('🚫 Double-click prevented by ref guard')
      return
    }
    
    // Prevent double submission with state check too
    if (isSubmitting) {
      console.log('🚫 Double-click prevented by state guard')
      return
    }
    
    try {
      // IMMEDIATELY set both ref and state to prevent double-clicks
      isSubmittingRef.current = true
      setIsSubmitting(true)
      
      console.log('✅ Submitting return request...')
      
      // CRITICAL: Small delay to ensure loading state renders BEFORE API call
      // This gives React time to show the spinner to the user
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // CRITICAL: Use individual order.id for return request (not order set ID)
      // The backend needs the order ID to look up the seller
      const orderId = order.id
      
      const data = {
        order_id: orderId,
        customer_note: "",
        shipping_option_id: returnMethod,
        line_items: selectedItems,
      }

      const { order_return_request } = await createReturnRequest(data)
      
      console.log('✅ Return request created:', order_return_request.id)

      router.push(`/user/orders/${order_return_request.id}/request-success`)
    } catch (error) {
      console.error('❌ Return request submission failed:', error)
      // Reset BOTH ref and state on error so user can retry
      isSubmittingRef.current = false
      setIsSubmitting(false)
    }
    // Note: Don't reset on success - let the router navigation handle it
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 mt-6 gap-5 md:gap-8">
      <UserNavigation />
      <div className="md:col-span-3 mb-8 md:mb-0">
        {tab === 0 ? (
          <LocalizedClientLink href={`/user/orders/${orderSet?.id || order.id}`}>
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
              <ReturnItemsTab
                order={order}
                selectedItems={selectedItems}
                handleSelectItem={handleSelectItem}
                returnReasons={returnReasons}
                error={error}
              />
            )}
            {tab === 1 && (
              <ReturnMethodsTab
                shippingMethods={shippingMethods}
                handleSetReturnMethod={handleSetReturnMethod}
                returnMethod={returnMethod}
                seller={order.seller}
              />
            )}
          </div>
          <div />
          <div className="col-span-4 md:col-span-3">
            <ReturnSummaryTab
              currency_code={order.currency_code}
              selectedItems={selectedItems}
              items={order.items}
              handleTabChange={handleTabChange}
              tab={tab}
              returnMethod={returnMethod}
              handleSubmit={handleSubmit}
              originalOrder={order}
              shippingCost={order.shipping_total} // Extract shipping_total from order or use default
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  )
}