import { Button, Card } from "@/components/atoms"
import { convertToLocale } from "@/lib/helpers/money"
import Image from "next/image"

export const ReturnSummaryTab = ({
  selectedItems,
  items,
  currency_code,
  handleTabChange,
  tab,
  returnMethod,
  handleSubmit,
  originalOrder,
  shippingCost,
  isSubmitting,
}: {
  selectedItems: any[]
  items: any[]
  currency_code: string
  handleTabChange: (tab: number) => void
  tab: number
  returnMethod: any
  handleSubmit: () => void
  originalOrder?: any
  shippingCost?: number
  isSubmitting?: boolean
}) => {
  const selected = items.filter((item) =>
    selectedItems.some((i) => i.line_item_id === item.id)
  )
  
  

  // Calculate the total for selected items (including VAT)
  const itemsTotal = selected.reduce((acc, item) => {
    // Use item.total (actual paid price with promotions, calculated by data transformation)
    let itemTotal = item.total || 0;
    
    // Fallback: If item.total is 0 or missing, calculate from unit_price
    if (!itemTotal || itemTotal === 0) {
      itemTotal = (item.unit_price || 0) * (item.quantity || 1)
    }
  
    
    return acc + itemTotal;
  }, 0)
  
  // Check if all items are selected for return
  // CRITICAL: For split orders, we need to check if all items FROM THE TARGET ORDER are selected
  // Not all items from all orders combined
  const targetOrderItems = originalOrder?.items || []
  const selectedItemIds = new Set(selected.map(s => s.id))
  const allItemsFromTargetOrderSelected = targetOrderItems.every((item: any) => selectedItemIds.has(item.id))
  
  
  
  // Get shipping cost using the comprehensive approach from OrderTotals
  let orderShippingCost = shippingCost || 0
  
  // If shippingCost wasn't provided or is zero, try to extract it from originalOrder
  if (!orderShippingCost && originalOrder) {
    // PRIORITY 1: Use shipping_methods.amount (base amount, tax included in price)
    if (originalOrder.shipping_methods?.length > 0) {
      orderShippingCost = originalOrder.shipping_methods.reduce((shippingAcc: number, method: any) => {
        // Use 'amount' (base) not 'total' (with tax)
        return shippingAcc + (method.amount || 0)
      }, 0)
    }
    
    // PRIORITY 2: Use shipping_total from order (manually calculated base amount)
    if (orderShippingCost === 0) {
      orderShippingCost = originalOrder.shipping_total || 0
    }
    
    // PRIORITY 3: Calculate as difference between payment and items
    if (orderShippingCost === 0 && originalOrder.total) {
      const itemsSubtotalOriginal = (originalOrder.items || []).reduce((itemAcc: number, item: any) => {
        const itemTotal = item.total || ((item.unit_price || 0) * (item.quantity || 0))
        return itemAcc + itemTotal
      }, 0)
      
      orderShippingCost = originalOrder.total - itemsSubtotalOriginal
    }
  }
  

  // Calculate final return amount - include shipping cost if all items FROM TARGET ORDER are selected
  const returnTotal = allItemsFromTargetOrderSelected ? itemsTotal + orderShippingCost : itemsTotal;
  

  return (
    <div className="mt-20 md:mt-0">
      {selected.length ? (
        <Card className="p-4">
          <ul>
            {selected.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 mb-4 justify-between w-full"
              >
                <div className="flex items-center gap-2  font-instrument-serif">
                  <div className="w-16 rounded-sm border">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.subtitle}
                        width={64}
                        height={64}
                        className="rounded-sm"
                      />
                    ) : (
                      <Image
                        src={"/images/placeholder.svg"}
                        alt={item.subtitle}
                        width={64}
                        height={64}
                        className="opacity-25 scale-75"
                      />
                    )}
                  </div>
                  {item.subtitle}
                </div>
                <div>
                  {convertToLocale({ amount: item.total, currency_code })}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Card className="p-4">
        <p className="label-md flex justify-between mb-4  border-t border-[#3B3634]">
          Kwota zwrotu:
          <span className="label-md !font-bold text-primary">
            {convertToLocale({
              amount: returnTotal,
              currency_code,
            })}
          </span>
        </p>
        <Button
          className="label-md w-full uppercase"
          disabled={
            (tab === 0 && !selected.length) || 
            (tab === 1 && !returnMethod) || 
            isSubmitting
          }
          loading={isSubmitting}
          onClick={tab === 0 ? () => handleTabChange(1) : () => handleSubmit()}
        >
          {tab === 0
            ? selected.length
              ? "Kontynuuj"
              : "Wybierz przedmioty"
            : !returnMethod
            ? "Wybierz metodę zwrotu"
            : "Prośba zwrotu"}
        </Button>
      </Card>
    </div>
  )
}
