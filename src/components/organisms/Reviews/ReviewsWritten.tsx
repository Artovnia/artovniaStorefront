"use client"
import { navigation } from "./navigation"
import { Card, NavigationItem } from "@/components/atoms"
import { StarIcon } from "@/icons"
import { Review } from "@/lib/data/reviews"
import { cn } from "@/lib/utils"
import { isEmpty } from "lodash"
import { usePathname } from "next/navigation"
import Image from "next/image"
import { useMemo } from "react"

export const ReviewsWritten = ({ reviews }: { reviews: Review[] }) => {
  const pathname = usePathname()
  
  // ✅ HYDRATION FIX: Calculate time differences once to prevent mismatch
  const reviewsWithTimeAgo = useMemo(() => {
    const now = Date.now()
    return reviews.map(review => {
      const reviewTime = new Date(review.updated_at).getTime()
      const daysDiff = Math.floor((now - reviewTime) / (24 * 60 * 60 * 1000))
      
      let timeAgo: string
      if (daysDiff < 7) {
        timeAgo = `${daysDiff} dni${daysDiff !== 1 ? "" : ""} temu`
      } else {
        const weeksDiff = Math.floor(daysDiff / 7)
        timeAgo = `${weeksDiff} tygodni${weeksDiff !== 1 ? "" : ""}`
      }
      
      return { ...review, timeAgo }
    })
  }, [reviews])

  return (
    <div className="md:col-span-3 space-y-8">
      <h1 className="heading-md uppercase">Twoje recenzje</h1>
      <div className="flex gap-4">
        {navigation.map((item) => (
          <NavigationItem
            key={item.label}
            href={item.href}
            active={pathname === item.href}
            className="px-0"
          >
            {item.label}
          </NavigationItem>
        ))}
      </div>
      {isEmpty(reviews) ? (
        <Card>
          <div className="text-center py-6">
            <h3 className="heading-lg text-primary uppercase">
              Brak recenzji
            </h3>
            <p className="text-lg text-secondary mt-2">
              Nie napisałeś żadnych recenzji. Po napisaniu recenzji, pojawi się tutaj.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-2">
          {reviewsWithTimeAgo.map((review) => {
            const isSeller = review.reference === "seller"
            const isProduct = review.reference === "product"
            
            return (
              <Card
                className="flex flex-col gap-6 lg:grid lg:grid-cols-6 px-4"
                key={review.id}
              >
                {(review.seller || review.product) && (
                  <div className="flex gap-2 max-lg:items-center lg:flex-col">
                    <Image
                      src={
                        isSeller 
                          ? (review.seller?.photo || '/images/placeholder.svg')
                          : (review.product?.thumbnail || '/images/placeholder.svg')
                      }
                      alt={
                        isSeller
                          ? `${review.seller?.name || 'Seller'} profile photo`
                          : `${review.product?.title || 'Product'} thumbnail`
                      }
                      className="size-8 border border-base-primary rounded-xs object-cover"
                      width={32}
                      height={32}
                    />
                    <p className="label-md text-primary">
                      {isSeller 
                        ? (review.seller?.name || 'Seller')
                        : (review.product?.title || 'Product')
                      }
                    </p>
                  </div>
                )}
                <div
                  className={cn(
                    "flex flex-col gap-2 px-4",
                    (review.seller || review.product) ? "col-span-5" : "col-span-6"
                  )}
                >
                <div className="flex gap-3 items-center">
                  <div className="flex gap-0.5">
                    {new Array(review.rating).fill("").map((_, index) => (
                      <StarIcon
                        className="size-3.5"
                        key={`${review.id}-${index}`}
                      />
                    ))}
                  </div>
                  <div className="h-2.5 w-px bg-action" />
                  <p className="text-md text-primary">{review.timeAgo}</p>
                </div>
                <div className="col-span-5 flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                  <p className="text-md text-primary">{review.customer_note}</p>
                </div>
              </div>
            </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
