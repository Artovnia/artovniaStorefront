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
          <Image src={item.thumbnail} alt={item.title || 'Product'} fill objectFit="cover" />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">Brak zdjęcia</div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-5 w-full px-4 sm:gap-4">
        <div className="sm:col-span-2">
          <p className="label-md text-secondary">{item.product_title || 'Product'}</p>
          {item.variant?.product?.handle ? (
            <Link
              href={`/products/${item.variant.product.handle}`}
              target="_blank"
              className="heading-xs text-primary"
            >
              {item.variant?.product?.title || item.title || 'Product'}
            </Link>
          ) : (
            <span className="heading-xs text-primary">
              {item.variant?.product?.title || item.title || 'Product'}
            </span>
          )}
        </div>
        <div className="sm:col-span-2 flex flex-col justify-center">
          <p className="label-md text-secondary">
            {`Variant: `}
            <span className="text-primary">{item?.variant?.title || 'Default'}</span>
          </p>
        </div>
        <div className="flex sm:justify-end label-lg text-primary sm:items-center flex-col items-end">
          {/* Show promotional pricing if discount was applied */}
          {item.discount_total && item.discount_total > 0 ? (
            <>
              {/* Original price (crossed out) */}
              <span className="text-secondary line-through text-sm">
                {convertToLocale({
                  amount: item.unit_price,
                  currency_code: currency_code,
                })}
              </span>
              {/* Paid price (discounted) */}
              <span className="text-primary font-semibold">
                {convertToLocale({
                  amount: item.total / (item.quantity || 1),
                  currency_code: currency_code,
                })}
              </span>
              {/* Discount badge */}
              <span className="text-xs text-green-600">
                -{convertToLocale({
                  amount: item.discount_total / (item.quantity || 1),
                  currency_code: currency_code,
                })}
              </span>
            </>
          ) : (
            /* No discount - show regular price */
            <span>
              {convertToLocale({
                amount: item.unit_price,
                currency_code: currency_code,
              })}
            </span>
          )}
        </div>
      </div>
    </li>
  </Fragment>
)
