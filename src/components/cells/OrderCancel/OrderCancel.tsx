"use client"

import { Button, Checkbox, Divider } from "@/components/atoms"
import { Modal } from "@/components/molecules"
import { useState } from "react"
import Image from "next/image"
import { convertToLocale } from "@/lib/helpers/money"
import { cn } from "@/lib/utils"

export const OrderCancel = ({ order }: { order: any }) => {
  const [open, setOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<any[]>([])

  // According to parcel-statuses.ts, there are 4 stages:
  // 0: "Zamówienie otrzymane" (Order received)
  // 1: "W Przygotowaniu" (In Preparation)
  // 2: "Wysłano" (Shipped)
  // 3: "Dostarczono" (Delivered)
  
  // Debug the current order status
  console.log("OrderCancel debug:", {
    aktualnyKrok: order.aktualnyKrok,
    statusRealizacji: order.statusRealizacji,
    status_zamówienia: order.status_zamówienia,
    ma_realizacje: order.ma_realizacje
  })

  // The cancel button should ONLY be active when the order is in "Zamówienie otrzymane" status (stage 0)
  // Once it enters preparation (stage 1) or beyond, cancellation is not allowed
  const canCancelOrder = order.aktualnyKrok === 0
  const cannotCancelOrder = !canCancelOrder

  const handleCancel = () => {
    console.log("cancel")
  }

  const handleSelectItem = (item: any) => {
    if (selectedItems.includes(item)) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id))
    } else {
      setSelectedItems([...selectedItems, item])
    }
  }

  const handleChangeQuantity = (item: any, quantity: number) => {
    const itemline = selectedItems.find((i) => i.id === item.id)
    if (itemline) {
      itemline.quantity += quantity
      setSelectedItems([...selectedItems])
    }
  }

  return (
    <>
      <div className="md:flex justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h2 className="text-primary label-lg uppercase">Anuluj zamówienie</h2>
          <p className="text-secondary label-md max-w-sm">
            {cannotCancelOrder 
              ? order.aktualnyKrok > 1 
                ? "Nie można anulować zamówienia, które zostało już wysłane." 
                : "Nie można anulować zamówienia na tym etapie." 
              : "Złożone zamówienie możesz anulować tylko na etapie przygotowania."}
          </p>
        </div>
        <Button
          variant="tonal"
          className="uppercase"
          onClick={() => setOpen(true)}
          disabled={cannotCancelOrder}
        >
          Anuluj
        </Button>
      </div>
      {open && (
        <Modal
          heading="Wybierz produkty do anulowania"
          onClose={() => setOpen(false)}
        >
          <div>
            <ul className="px-4">
              {order.items.map((item: any) => {
                const isSelected = selectedItems.includes(item)
                const itemline = selectedItems.find((i) => i.id === item.id)
                return (
                  <li
                    key={item.id}
                    className={cn(
                      "flex items-center gap-4 p-4 mb-2 rounded-sm",
                      isSelected && "bg-secondary/70"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => handleSelectItem(item)}
                    />
                    <div className="flex gap-4 w-full">
                      <div className="w-16 rounded-sm border">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.subtitle}
                            width={60}
                            height={60}
                            className="rounded-sm"
                          />
                        ) : (
                          <Image
                            src={"/images/placeholder.svg"}
                            alt={item.subtitle}
                            width={60}
                            height={60}
                            className="opacity-25 scale-75"
                          />
                        )}
                      </div>
                      <div className="grid grid-cols-4 gap-2 w-full">
                        <div className="col-span-2">
                          <p className="text-primary label-md truncate w-full">
                            {item.subtitle}
                          </p>
                          <p className="text-secondary label-sm truncate w-full">
                            {item.title}
                          </p>
                        </div>
                        <div className="flex items-center justify-center">
                          {isSelected && (
                            <div className="flex items-center mt-2">
                              <Button
                                variant="text"
                                className="w-8 h-8 flex items-center justify-center !bg-transparent !hover:bg-secondary"
                                disabled={item.quantity === 1}
                                onClick={() => handleChangeQuantity(item, -1)}
                              >
                                -
                              </Button>
                              <div className="text-primary font-medium border rounded-sm w-8 h-8 text-center flex items-center justify-center bg-primary">
                                {item.quantity}
                              </div>
                              <Button
                                variant="text"
                                className="w-8 h-8 flex items-center justify-center !bg-transparent !hover:bg-secondary"
                                disabled={item.quantity === itemline.quantity}
                                onClick={() => handleChangeQuantity(item, 1)}
                              >
                                +
                              </Button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-end">
                          <p className="text-primary label-lg">
                            {convertToLocale({
                              amount: item.total,
                              currency_code: order.currency_code,
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <Divider className="my-4" />
            <div className="px-4">
              <Button 
                className="uppercase w-full" 
                onClick={handleCancel}
                disabled={cannotCancelOrder}
              >
                Anuluj zamówienie
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
