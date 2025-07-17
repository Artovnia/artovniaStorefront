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
}) => {
  const selected = items.filter((item) =>
    selectedItems.some((i) => i.line_item_id === item.id)
  )

  // Calculate the total for selected items (including VAT)
  const itemsTotal = selected.reduce((acc, item) => {
    // Use total (with tax) instead of subtotal (without tax)
    // If total doesn't exist, try to calculate from unit_price which typically includes tax
    const itemTotal = item.total || (item.unit_price * item.quantity) || item.subtotal;
    return acc + itemTotal;
  }, 0)
  
  // Check if all items are selected for return
  const allItemsSelected = selected.length === items.length
  
  // Get shipping cost using the comprehensive approach from OrderTotals
  let orderShippingCost = shippingCost || 0
  
  // If shippingCost wasn't provided or is zero, try to extract it from originalOrder
  if (!orderShippingCost && originalOrder) {
    // Try to extract from shipping_methods if available
    if (originalOrder.shipping_methods?.length > 0) {
      orderShippingCost = originalOrder.shipping_methods.reduce((shippingAcc: number, method: any) => {
        return shippingAcc + (method.amount || method.price || method.total || 0)
      }, 0)
    } else {
      // If no shipping_methods, try other shipping fields
      orderShippingCost = originalOrder.shipping_total || 
                        originalOrder.shipping_subtotal || 
                        originalOrder.delivery_total || 
                        originalOrder.delivery_cost || 0
    }
    
    // If still no shipping cost found, calculate as difference between total and items subtotal
    if (orderShippingCost === 0 && originalOrder.total) {
      const itemsSubtotalOriginal = (originalOrder.items || []).reduce((itemAcc: number, item: any) => {
        const itemTotal = (item.unit_price || 0) * (item.quantity || 0)
        return itemAcc + itemTotal
      }, 0)
      
      orderShippingCost = originalOrder.total - itemsSubtotalOriginal
    }
  }
  
  
  // Calculate final return amount - always include shipping cost if all items are selected
  const returnTotal = allItemsSelected ? itemsTotal + orderShippingCost : itemsTotal;
 

  return (
    <div className="sm:mt-20">
      {selected.length ? (
        <Card className="p-4">
          <ul>
            {selected.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 mb-4 justify-between w-full"
              >
                <div className="flex items-center gap-2 font-semibold">
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
        <p className="label-md flex justify-between mb-4">
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
            (tab === 0 && !selected.length) || (tab === 1 && !returnMethod)
          }
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
