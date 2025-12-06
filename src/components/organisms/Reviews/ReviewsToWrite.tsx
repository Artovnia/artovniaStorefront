"use client"
import { Button, Card, NavigationItem } from "@/components/atoms"
import { Modal, ReviewForm } from "@/components/molecules"
import { isEmpty } from "lodash"
import { usePathname } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { Review } from "@/lib/data/reviews"
import { navigation } from "./navigation"

export const ReviewsToWrite = ({ reviews }: { reviews: Review[] }) => {
  const [showForm, setShowForm] = useState<string>("")
  const pathname = usePathname()

  return (
    <>
      <div className="md:col-span-3 space-y-8">
        <h1 className="heading-md uppercase">Recenzje</h1>
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
                Brak recenzji do napisania
              </h3>
              <p className="text-lg text-secondary mt-2">
                Obecnie nie masz nikogo do recenzowania.
              </p>
            </div>
          </Card>
        ) : (
          reviews.map((review) => {
            const isSeller = review.type === 'seller' || review.reviewType === 'seller'
            const isProduct = review.type === 'product' || review.reviewType === 'product'
            
            return (
              <Card
                className="flex flex-col gap-6 lg:grid lg:grid-cols-6 px-4"
                key={review.id}
              >
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
                <div className="col-span-5 flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                  <p className="text-md text-primary">
                    {isSeller ? (
                      <>
                        Napisz recenzję dla tego sprzedawcy.
                        <br />
                        Twoje opinie pomagają innym kupującym podjąć świadomy zakup.
                      </>
                    ) : (
                      <>
                        Napisz recenzję dla tego produktu.
                        <br />
                        Podziel się swoją opinią o tym produkcie.
                      </>
                    )}
                  </p>
                  <Button
                    onClick={() => setShowForm(
                      isSeller 
                        ? `seller:${review.seller?.id || ""}` 
                        : `product:${review.product_id || ""}`
                    )}
                    className="w-fit uppercase"
                  >
                    Napisz recenzję
                  </Button>
                </div>
              </Card>
            )
          })
        )}
      </div>
      {showForm && (
        <Modal heading="Napisz recenzję" onClose={() => setShowForm("")}>
          <ReviewForm sellerId={showForm} handleClose={() => setShowForm("")} />
        </Modal>
      )}
    </>
  )
}
