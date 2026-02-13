"use client"

import ErrorMessage from "@/components/molecules/ErrorMessage/ErrorMessage"
import { useCart } from "@/components/context/CartContext"
import { CartItems, CartSummary } from "@/components/organisms"
import CartPromotionCode from "../CartReview/CartPromotionCode"
import { CartClient } from "./CartClient"
import { LoaderWrapper } from "@/components/atoms/icons/IconWrappers"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { getRecentlyViewedProducts } from "@/lib/utils/browsing-history"

interface RecentProduct {
  id: string
  title: string
  handle: string
  thumbnail?: string
  price?: number
  seller_name?: string
}

const RecentlyViewedSection = () => {
  const [products, setProducts] = useState<RecentProduct[]>([])

  useEffect(() => {
    const recent = getRecentlyViewedProducts(6)
    setProducts(recent)
  }, [])

  if (products.length === 0) return null

  return (
    <div className="mt-12 w-full">
      <h3 className="text-[#3B3634] font-instrument-serif text-xl mb-6 text-center">
        Ostatnio przeglądane
      </h3>
      <div className="flex flex-wrap justify-center gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.handle}`}
            className="group flex flex-col w-[160px] sm:w-[200px]"
          >
            <div className="relative h-[200px] w-[160px] sm:h-[250px] sm:w-[200px] overflow-hidden" style={{ backgroundColor: '#F4F0EB' }}>
              {product.thumbnail ? (
                <Image
                  src={decodeURIComponent(product.thumbnail)}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 160px, 200px"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Image
                    src="/images/placeholder.svg"
                    alt=""
                    width={60}
                    height={80}
                    className="opacity-30"
                  />
                </div>
              )}
            </div>
            <p className="text-sm text-[#3B3634] font-instrument-sans font-medium truncate mt-2">
              {product.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  )
}

const Cart: React.FC = () => {
  const { 
    cart, 
    isLoading, 
    error, 
    refreshCart, 
    clearError,
    itemCount,
    lastUpdated 
  } = useCart()

  // Removed excessive refresh triggers that were causing cascading API calls

  // Clear error when component mounts
  useEffect(() => {
    if (error) {
      clearError()
    }
  }, [error, clearError])

  if (isLoading && !cart) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoaderWrapper className="w-6 h-6" />
        <span className="ml-2">Loading cart...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorMessage error={error} />
        <button 
          onClick={() => refreshCart()}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!cart || itemCount === 0) {
    return (
      <div className="col-span-12 flex flex-col items-center justify-center min-h-[300px] p-8 text-center">
        <h2 className="text-[#3B3634] font-instrument-serif text-2xl mb-4">Twój koszyk jest pusty</h2>
        <p className="text-gray-500 mb-6">Dodaj produkty do koszyka aby kontynuować zakupy</p>
        <Link href="/categories" className="inline-block px-6 py-3 bg-[#3B3634] text-white hover:bg-[#2a2624] transition-colors">
          Przeglądaj produkty
        </Link>
        <RecentlyViewedSection />
      </div>
    )
  }

  return (
    <>
      <div className="col-span-12 lg:col-span-6">
        <div className="w-full">
          <CartItems cart={cart} />
        </div>
      </div>
      <div className="lg:col-span-2"></div>
      <div className="col-span-12 lg:col-span-4">
        <div className="w-full mb-6 border rounded-sm p-4">
          <div className="w-full">
            <CartPromotionCode cart={cart} />
          </div>
        </div>
        <div className="border rounded-sm p-4 h-fit">
          <div className="w-full">
            <CartSummary
              item_total={cart?.item_total || 0}
              shipping_total={cart?.shipping_total || 0}
              total={cart?.total || 0}
              currency_code={cart?.currency_code || ""}
            />
          </div>
          <div className="w-full mt-4">
            <CartClient 
              cartTotal={cart?.total || 0}
              currencyCode={cart?.currency_code || ""}
              hasCustomer={!!cart?.customer}
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default Cart