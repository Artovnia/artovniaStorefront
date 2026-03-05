"use client"

import { Button, Divider } from "@/components/atoms"
import { Modal } from "@/components/molecules"
import { useState } from "react"
import Image from "next/image"
import { convertToLocale } from "@/lib/helpers/money"
import { cancelOrder } from "@/lib/data/orders"
import { useRouter } from "next/navigation"

export const OrderCancel = ({ order }: { order: any }) => {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // According to parcel-statuses.ts, there are 4 stages:
  // 0: "Zamówienie otrzymane" (Order received)
  // 1: "W Przygotowaniu" (In Preparation)
  // 2: "Wysłano" (Shipped)
  // 3: "Dostarczono" (Delivered)
  

  // Check if order is already canceled
  const isCanceled = order.status === 'canceled' || order.statusRealizacji === 'canceled'
  
  // The cancel button should ONLY be active when the order is in "Zamówienie otrzymane" status (stage 0)
  // Once it enters preparation (stage 1) or beyond, cancellation is not allowed
  // Also hide if already canceled
  const canCancelOrder = order.aktualnyKrok === 0 && !isCanceled
  const cannotCancelOrder = !canCancelOrder
  

  const handleCancel = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await cancelOrder(order.id)
      
      if (result.success) {
        // Close modal and redirect to orders page
        setOpen(false)
        router.push('/user/orders')
        router.refresh()
      } else {
        setError(result.error || 'Nie udało się anulować zamówienia')
      }
    } catch (err) {
      console.error('Error in handleCancel:', err)
      setError('Wystąpił błąd podczas anulowania zamówienia')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="md:flex justify-between items-center">
        <div className="mb-4 md:mb-0">
          <h2 className="text-primary label-lg uppercase">Anuluj zamówienie</h2>
          <p className="text-secondary label-md max-w-sm">
            {isCanceled
              ? "To zamówienie zostało już anulowane."
              : cannotCancelOrder 
                ? order.aktualnyKrok > 1 
                  ? "Nie można anulować zamówienia, które zostało już wysłane." 
                  : "Nie można anulować zamówienia na tym etapie." 
                : "Złożone zamówienie możesz anulować tylko na etapie przygotowania."}
          </p>
        </div>
        <Button
          variant="filled"
          className="uppercase"
          onClick={() => setOpen(true)}
          disabled={cannotCancelOrder}
        >
          Anuluj
        </Button>
      </div>
      {open && (
        <Modal
          heading="Anuluj zamówienie"
          onClose={() => setOpen(false)}
        >
          <div>
            <p className="px-4 text-secondary label-sm">
              Anulowanie dotyczy całego zamówienia. Poniżej znajduje się lista produktów objętych anulowaniem.
            </p>
            <ul className="px-4">
              {order.items.map((item: any) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-4 p-4 mb-2 rounded-sm"
                  >
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
                          <p className="text-secondary label-sm">Ilość: {item.quantity}</p>
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
                ))}
            </ul>

            <Divider className="my-4" />
            <div className="px-4">
              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  {error}
                </div>
              )}
              <Button 
                className="uppercase w-full" 
                onClick={handleCancel}
                disabled={cannotCancelOrder || isLoading}
              >
                {isLoading ? 'Anulowanie...' : 'Potwierdź anulowanie całego zamówienia'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}
