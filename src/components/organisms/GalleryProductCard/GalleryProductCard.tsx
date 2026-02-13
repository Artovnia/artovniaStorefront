// src/components/organisms/GalleryProductCard/GalleryProductCard.tsx
"use client";

import Image from "next/image";
import { useEffect, useState, useMemo, useRef } from "react";
import { LqipImage } from "@/components/cells/LqipImage/LqipImage";
import { HttpTypes } from "@medusajs/types";
import { Link } from "@/i18n/routing";
import { getSellerProductPrice } from "@/lib/helpers/get-seller-product-price";
import { getProductPrice } from "@/lib/helpers/get-product-price";
import { getPromotionalPrice } from "@/lib/helpers/get-promotional-price";
import { usePromotionData } from "@/components/context/PromotionDataProvider";
import { BaseHit, Hit } from "instantsearch.js";
import { useProductImagePrefetch } from "@/hooks/useProductImagePrefetch";
import clsx from "clsx";
import { WishlistButton } from "@/components/cells/WishlistButton/WishlistButton";
import { BatchLowestPriceDisplay } from "@/components/cells/LowestPriceDisplay/BatchLowestPriceDisplay";
import { SerializableWishlist } from "@/types/wishlist";
import { useRouter } from "next/navigation";
import { PromotionBadge } from "@/components/cells/PromotionBadge/PromotionBadge";

interface GalleryProductCardProps {
  product: Hit<HttpTypes.StoreProduct> | Partial<Hit<BaseHit>>;
  user?: HttpTypes.StoreCustomer | null;
  wishlist?: SerializableWishlist[];
  onWishlistChange?: () => void;
  index?: number;
  categoryLabel?: string | null;
}

export const GalleryProductCard = ({
  product,
  user = null,
  wishlist = [],
  onWishlistChange,
  index = 999,
  categoryLabel,
}: GalleryProductCardProps) => {
  const { prefetchProductImage } = useProductImagePrefetch();
  const router = useRouter();
  const { getProductWithPromotions } = usePromotionData();
  const [isMounted, setIsMounted] = useState(false);
  const productUrl = `/products/${product.handle}`;
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Mobile viewport prefetch
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    if (!isTouchDevice) return;

    const imageUrl = product.thumbnail || product.images?.[0]?.url;
    if (!imageUrl) return;
    const card = cardRef.current;
    if (!card) return;

    let dwellTimer: ReturnType<typeof setTimeout> | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          dwellTimer = setTimeout(() => prefetchProductImage(imageUrl), 300);
        } else if (dwellTimer) {
          clearTimeout(dwellTimer);
          dwellTimer = null;
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(card);
    return () => {
      observer.disconnect();
      if (dwellTimer) clearTimeout(dwellTimer);
    };
  }, [product.thumbnail, product.images, prefetchProductImage]);

  const promotionalProduct = getProductWithPromotions(product.id);
  const productToUse = promotionalProduct || product;

  const promotionalPricing = useMemo(() => {
    const firstVariant = productToUse.variants?.[0];
    return getPromotionalPrice({
      product: productToUse as any,
      regionId: firstVariant?.calculated_price?.region_id,
      variantId: firstVariant?.id,
    });
  }, [productToUse]);

  const hasAnyDiscount =
    isMounted &&
    (promotionalPricing.discountPercentage > 0 ||
      (productToUse as any).has_promotions ||
      productToUse.variants?.some(
        (v: any) =>
          v.calculated_price &&
          v.calculated_price.calculated_amount !==
            v.calculated_price.original_amount &&
          v.calculated_price.calculated_amount <
            v.calculated_price.original_amount
      ));

  const handlePrefetch = () => {
    try {
      router.prefetch(productUrl);
    } catch {}
    const imageUrl = product.thumbnail || product.images?.[0]?.url;
    prefetchProductImage(imageUrl);
  };

  const { cheapestPrice } = product?.id
    ? getProductPrice({ product })
    : { cheapestPrice: null };
  const { cheapestPrice: sellerCheapestPrice } = product?.id
    ? getSellerProductPrice({ product })
    : { cheapestPrice: null };

  if (!product?.id || !product?.title) return null;

  const sellerName =
    product.seller?.name ||
    product.seller?.company_name ||
    (product as any).seller_name ||
    (product as any).seller?.name ||
    (product as any)["seller.name"];

  return (
    <div
      ref={cardRef}
      className="group relative flex flex-col h-full w-[160px] sm:w-[252px]"
      onMouseEnter={handlePrefetch}
      onTouchStart={handlePrefetch}
    >
      {/* ── Image ── */}
      {/* Exact same dimensions as ProductCard */}
      <div
        className="relative h-[200px] w-[160px] sm:h-[315px] sm:w-[252px] flex-shrink-0 overflow-hidden"
        style={{ backgroundColor: "#F4F0EB" }}
      >
        {/* Wishlist */}
        <div className="absolute right-2 top-2 z-10 cursor-pointer">
          <WishlistButton
            productId={product.id}
            user={user}
            wishlist={wishlist}
            onWishlistChange={onWishlistChange}
          />
        </div>

        {/* Promotion badge */}
        {hasAnyDiscount &&
          promotionalPricing.discountPercentage > 0 &&
          (productToUse as any).has_promotions && (
            <PromotionBadge
              discountPercentage={promotionalPricing.discountPercentage}
              variant="card"
            />
          )}

      
        <Link
          href={productUrl}
          prefetch={true}
          aria-label={`Zobacz produkt: ${product.title}`}
          className="block w-full h-full"
        >
          {product.thumbnail || product.images?.[0]?.url ? (
            <LqipImage
              src={
                product.thumbnail ||
                product.images?.[0]?.url ||
                "/images/placeholder.svg"
              }
              alt={product.title}
              width={320}
              height={320}
              quality={75}
              className="object-cover w-full h-full object-center lg:group-hover:scale-105 transition-all duration-300"
              priority={index < 4}
              loading={index < 4 ? "eager" : "lazy"}
              fetchPriority={index < 4 ? "auto" : "low"}
              sizes="(max-width: 640px) 160px, 252px"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <Image
                src="/images/placeholder.svg"
                alt="Placeholder"
                width={100}
                height={100}
                quality={65}
                className="w-[100px] h-auto"
              />
            </div>
          )}
        </Link>

        {/* ✅ Hover overlay — dark, high contrast */}
        <Link
          href={productUrl}
          prefetch={true}
          aria-label={`Zobacz więcej o: ${product.title}`}
          className={clsx(
            "absolute inset-x-0 bottom-0 z-10",
            "flex items-end justify-center pb-5",
            "bg-gradient-to-t from-black/85 via-black/50 to-transparent",
            "h-16 transition-opacity duration-300",
            "opacity-0 lg:group-hover:opacity-100",
            "pointer-events-none lg:group-hover:pointer-events-auto"
          )}
        >
          <span className="text-white text-md uppercase">
            Zobacz więcej
          </span>
        </Link>
      </div>

      {/* ── Info ── */}
      <Link href={productUrl} aria-label={`Szczegóły: ${product.title}`}>
        <div className="flex justify-between flex-grow mt-2">
          <div className="w-full font-instrument-sans">
            {/* Title */}
            <h3 className="text-md font-instrument-sans truncate mb-1 leading-tight font-medium">
              {product.title}
            </h3>

            {/* Seller */}
            {sellerName && (
              <p className="font-instrument-sans text-sm mb-1 font-normal text-black">
                {sellerName}
              </p>
            )}

            {/* Price row */}
            <div className="flex items-center gap-2">
              {hasAnyDiscount ? (
                <>
                  {promotionalPricing.discountPercentage > 0 ? (
                    <>
                      <p className="font-instrument-sans font-semibold text-md sm:text-md text-[#3B3634]">
                        {promotionalPricing.promotionalPrice}
                      </p>
                      <p className="text-xs text-gray-500 line-through">
                        {promotionalPricing.originalPrice}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-instrument-sans font-semibold text-md sm:text-md text-[#3B3634]">
                        {(
                          sellerCheapestPrice?.calculated_price ||
                          cheapestPrice?.calculated_price
                        )?.replace(/PLN\s+([\d,.]+)/, "$1 zł")}
                      </p>
                      {sellerCheapestPrice?.calculated_price
                        ? sellerCheapestPrice.calculated_price !==
                            sellerCheapestPrice.original_price && (
                            <p className="text-xs text-gray-500 line-through">
                              {sellerCheapestPrice.original_price?.replace(
                                /PLN\s+([\d,.]+)/,
                                "$1 zł"
                              )}
                            </p>
                          )
                        : cheapestPrice?.calculated_price !==
                            cheapestPrice?.original_price && (
                            <p className="text-xs text-gray-500 line-through">
                              {cheapestPrice?.original_price?.replace(
                                /PLN\s+([\d,.]+)/,
                                "$1 zł"
                              )}
                            </p>
                          )}
                    </>
                  )}
                </>
              ) : (
                <p className="font-instrument-sans font-semibold text-md sm:text-md">
                  {(
                    sellerCheapestPrice?.calculated_price ||
                    cheapestPrice?.calculated_price
                  )?.replace(/PLN\s+([\d,.]+)/, "$1 zł")}
                </p>
              )}
            </div>

            {/* Lowest price */}
            {product.variants?.length > 0 && hasAnyDiscount && (
              <div className="mt-0">
                <BatchLowestPriceDisplay
                  variantId={product.variants[0].id}
                  currencyCode="PLN"
                  className="text-xs"
                  fallbackPrice={
                    product.variants[0]?.calculated_price?.original_amount ||
                    product.variants[0]?.prices?.[0]?.amount ||
                    (product as any).min_price
                  }
                />
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};