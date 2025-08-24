import { convertToLocale } from "@/lib/helpers/money"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { DeleteCartItemButton } from "@/components/molecules"

export const CartDropdownItem = ({
  item,
  currency_code,
  onDeleted,
}: {
  item: HttpTypes.StoreCartLineItem
  currency_code: string
  onDeleted?: () => void
}) => {
  const original_total = convertToLocale({
    amount: item.original_total,
    currency_code,
  })

  const total = convertToLocale({
    amount: item.total,
    currency_code,
  })

  return (
    <div className="border rounded-sm p-1 flex gap-2 mb-4">
      <div className="w-[100px] h-[132px] flex items-center justify-center">
        {item.thumbnail ? (
          <Image
            src={decodeURIComponent(item.thumbnail)}
            alt={item.product_title || ""}
            width={80}
            height={90}
            className="w-[80px] h-[90px] object-cover rounded-xs"
            priority
          />
        ) : (
          <Image
            src={"/images/placeholder.svg"}
            alt="Product thumbnail"
            width={50}
            height={66}
            className="rounded-xs w-[50px] h-[66px] object-contain opacity-30"
          />
        )}
      </div>

      <div className="py-2 flex-1">
        <div className="flex justify-between items-start">
          <h4 className="heading-xs pr-2">{item.product_title}</h4>
          <DeleteCartItemButton 
            id={item.id} 
          />
        </div>
        <div className="label-md text-secondary">
          {item.variant?.options?.map(({ option, id, value }) => (
            <p key={id}>
              {option?.title}: <span className="text-primary">{value}</span>
            </p>
          ))}
          <p>
            Ilość: <span className="text-primary">{item.quantity}</span>
          </p>
        </div>
        <div className="pt-2 flex lg:block items-center gap-2 mt-4 lg:mt-0">
          {total !== original_total && (
            <p className="line-through text-secondary label-md">
              {original_total}
            </p>
          )}
          <p className="label-lg">{total}</p>
        </div>
      </div>
    </div>
  )
}
