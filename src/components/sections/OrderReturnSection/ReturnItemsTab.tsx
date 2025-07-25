import { Card, Checkbox } from "@/components/atoms"
import { convertToLocale } from "@/lib/helpers/money"
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/react"
import { clx } from "@medusajs/ui"
import { ChevronUpDown } from "@medusajs/icons"

import Image from "next/image"
import { cn } from "@/lib/utils"

export const ReturnItemsTab = ({
  order,
  selectedItems,
  handleSelectItem,
  returnReasons,
  error,
}: {
  order: any
  selectedItems: any[]
  handleSelectItem: (item: any, reason_id: string) => void
  returnReasons: any[]
  error: boolean
}) => {
  return (
    <div>
      <Card className="bg-secondary p-4">
        <p className="label-md">
          Sprzedawca: <span className="font-semibold">{order.seller.name}</span>
        </p>
      </Card>
      <Card className="flex items-center justify-between p-4">
        <ul className="w-full">
          {order.items.map((item: any) => (
            <li key={item.id} className="md:flex justify-between gap-2 w-full mb-8">
              <div className="flex items-center gap-2 md:w-2/3 mb-4 md:mb-0">
                {/* Added preventDefault to avoid message channel error */}
                <div onClick={(e) => {
                  e.preventDefault()
                  console.log('Checkbox clicked for item:', item.id)
                  handleSelectItem(item, "")
                }}>
                  <Checkbox
                    checked={selectedItems.some(
                      (i) => i.line_item_id === item.id
                    )}
                    onChange={(e) => {
                      e.preventDefault()
                      // Handler moved to parent div to avoid event propagation issues
                    }}
                  />
                </div>
                <div className="flex items-center gap-2">
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
                  <div>
                    <p className="label-md font-semibold text-primary truncate w-full">
                      {item.subtitle}
                    </p>
                    <p className="label-md truncate w-full">{item.title}</p>
                    <p className="label-lg mt-2">
                      {convertToLocale({
                        amount: item.total,
                        currency_code: order.currency_code,
                      })}
                    </p>
                  </div>
                </div>
              </div>
              <div className="md:w-1/3">
                {/* Added debugging to check if returnReasons is properly populated */}
                {returnReasons && returnReasons.length > 0 ? (
                  <>
                    <p className="text-sm mb-2">Dostępne powody zwrotu: {returnReasons.length}</p>
                    <Listbox
                      value={
                        selectedItems.find((i) => i.line_item_id === item.id)
                          ?.reason_id || ""
                      }
                      onChange={(value) => {
                        console.log('Return reason selected:', value)
                        handleSelectItem(item, value || "")  
                      }}
                    >
                      <div className="relative">
                        <ListboxButton
                          className={cn(
                            "relative w-full flex justify-between items-center px-4 h-12 bg-component-secondary text-left cursor-default focus:outline-none border rounded-lg focus-visible:ring-2 focus-visible:ring-opacity-75 focus-visible:ring-white focus-visible:ring-offset-gray-300 focus-visible:ring-offset-2 focus-visible:border-gray-300 text-base-regular",
                            error &&
                              !selectedItems.find((i) => i.line_item_id === item.id)
                                ?.reason_id &&
                              "border-red-700"
                          )}
                        >
                          {({ open }) => (
                            <>
                              <span className="block truncate">
                                {returnReasons.find(
                                  (r) =>
                                    r.id ===
                                    selectedItems.find(
                                      (i) => i.line_item_id === item.id
                                    )?.reason_id
                                )?.label || "Wybierz powód"}
                              </span>
                              <ChevronUpDown
                                className={clx("transition-rotate duration-200", {
                                  "transform rotate-180": open,
                                })}
                              />
                            </>
                          )}
                        </ListboxButton>
                        <ListboxOptions className="absolute z-20 w-full overflow-auto text-small-regular bg-white border rounded-lg border-top-0 max-h-60 focus:outline-none sm:text-sm">
                          {returnReasons.map((reason) => (
                            <ListboxOption
                              key={reason.id}
                              value={reason.id}
                              className="cursor-default select-none relative pl-6 pr-10 hover:bg-gray-50 py-4 border-b"
                            >
                              {reason.label}
                            </ListboxOption>
                          ))}
                        </ListboxOptions>
                        {error &&
                          !selectedItems.find((i) => i.line_item_id === item.id)
                            ?.reason_id && (
                            <p className="absolute -bottom-6 text-red-700 label-md">
                              Proszę wybrać powód zwrotu
                            </p>
                          )}
                      </div>
                    </Listbox>
                  </>
                ) : (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <p className="text-red-600">Brak dostępnych powodów zwrotu</p>
                    <p className="text-sm mt-1">Spróbuj odświeżenia strony</p>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
