import { Divider } from "@/components/atoms"
import { convertToLocale } from "@/lib/helpers/money"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { Fragment } from "react"

export const OrderProductListItem = ({
  item,
  currency_code,
  withDivider,
}: {
  item: any
  currency_code: string
  withDivider?: boolean
}) => (
  <Fragment>
    {withDivider && <Divider className="mt-4" />}
    <li className={cn("flex items-center", withDivider && "mt-4")}>
      <div className="w-[66px] h-24 relative rounded-xs overflow-hidden">
        {item.thumbnail ? (
          <Image src={item.thumbnail} alt={item.title || 'Produkt'} fill objectFit="cover" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">Brak zdjęcia</div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-5 w-full px-4 sm:gap-4">
        <div className="sm:col-span-2">
          {item.variant?.product?.handle ? (
            <Link
              href={`/products/${item.variant.product.handle}`}
              target="_blank"
              className="heading-xs text-primary"
            >
              {item.variant?.product?.title || item.title || 'Produkt'}
            </Link>
          ) : (
            <span className="heading-xs text-primary">
              {item.variant?.product?.title || item.title || 'Produkt'}
            </span>
          )}
          {/* Display variant title if available (excluding 'Default variant') */}
          {item.variant_title && item.variant_title !== 'Default variant' && (
            <p className="text-xs text-secondary mt-0.5">{item.variant_title}</p>
          )}
          {/* Display variant options with their titles (e.g., "Klosz: Czarny") */}
          {item.variant?.options && item.variant.options.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-1">
              {item.variant.options.map((opt: any, idx: number) => (
                <span key={idx} className="text-xs">
                  <span className="text-secondary">{opt.option?.title || 'Opcja'}:</span>{' '}
                  <span className="text-primary font-medium">{opt.value}</span>
                  {idx < (item.variant.options?.length || 0) - 1 && <span className="text-secondary mx-1">·</span>}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="sm:col-span-1 flex flex-col justify-center">
         
        </div>
        <div className="sm:col-span-1 flex flex-col justify-center">
          <p className="label-md text-secondary">
            {`Ilość: `}
            <span className="text-primary font-semibold">{item.quantity || 1}</span>
          </p>
        </div>
        <div className="flex sm:justify-end label-lg text-primary sm:items-center flex-col items-end">
          {/* Show promotional pricing if discount was applied */}
          {item.discount_total && item.discount_total > 0 ? (
            <>
              {/* Original price (crossed out) - use subtotal (original total before discount) */}
              <span className="text-secondary line-through text-sm">
                {convertToLocale({
                  amount: item.subtotal || (item.unit_price * (item.quantity || 1)),
                  currency_code: currency_code,
                })}
              </span>
              {/* Paid price (discounted) - TOTAL actually paid */}
              <span className="text-primary font-semibold">
                {convertToLocale({
                  amount: item.total,
                  currency_code: currency_code,
                })}
              </span>
              {/* Discount badge - TOTAL discount */}
              <span className="text-xs text-green-600">
                -{convertToLocale({
                  amount: item.discount_total,
                  currency_code: currency_code,
                })}
              </span>
            </>
          ) : (
            /* No discount - show total price for all items */
            <span>
              {convertToLocale({
                amount: item.total || (item.unit_price * (item.quantity || 1)),
                currency_code: currency_code,
              })}
            </span>
          )}
        </div>
      </div>
    </li>
  </Fragment>
)
