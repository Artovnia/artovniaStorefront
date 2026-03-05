"use client"

import {
  ProductPostedDate,
  ProductReportButton,
  ProductTags,
  ProductPageAccordion,
} from '@/components/molecules';
import { ProductGPSR } from '@/components/molecules/ProductGPSR/ProductGPSR';
import { HttpTypes } from '@medusajs/types';
import { useCallback, useMemo, useRef, useState } from 'react';

// Define the product tag type that matches what the component expects
type ProductTag = {
  id: string
  value: string
  created_at: string
  updated_at: string
}

export const ProductDetailsFooter = ({
  product,
  regionId,
}: {
  product: HttpTypes.StoreProduct;
  regionId?: string;
}) => {
  const [deferredDetail, setDeferredDetail] = useState<Partial<HttpTypes.StoreProduct> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const hasRequestedRef = useRef(false)

  const loadDeferredDetail = useCallback(async () => {
    if (hasRequestedRef.current || !product?.id || !regionId) return

    hasRequestedRef.current = true
    setIsLoading(true)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
      const publishableKey = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ''
      const params = new URLSearchParams({
        id: product.id,
        region_id: regionId,
        limit: '1',
        fields: 'id,created_at,metadata,tags.id,tags.value',
      })

      const response = await fetch(`${backendUrl}/store/products?${params.toString()}`, {
        headers: {
          accept: 'application/json',
          'x-publishable-api-key': publishableKey,
        },
      })

      if (!response.ok) {
        throw new Error(`Deferred product detail request failed: ${response.status}`)
      }

      const data = await response.json() as { products?: Partial<HttpTypes.StoreProduct>[] }
      setDeferredDetail(data.products?.[0] || null)
    } catch (error) {
      console.error('Failed to load deferred product detail lazily:', error)
    } finally {
      setIsLoading(false)
    }
  }, [product?.id, regionId])

  const tags = (deferredDetail?.tags as ProductTag[] | undefined) || (product?.tags as ProductTag[] | undefined) || [];
  const posted = deferredDetail?.created_at || product?.created_at || null;

  const hydratedProduct = useMemo(() => {
    if (!deferredDetail) {
      return product
    }

    return {
      ...product,
      metadata: deferredDetail.metadata ?? product.metadata,
      tags: deferredDetail.tags ?? product.tags,
      created_at: deferredDetail.created_at ?? product.created_at,
    }
  }, [deferredDetail, product])

  return (
    <>
      <ProductPageAccordion
        heading="Szczegóły przedmiotu"
        defaultOpen={false}
        onIntent={loadDeferredDetail}
        onOpenChange={(open) => {
          if (open) {
            loadDeferredDetail()
          }
        }}
      >
        {isLoading && !deferredDetail && (
          <div className="mb-3 text-sm text-ui-fg-muted">Ładowanie szczegółów…</div>
        )}
             Tagi: <ProductTags tags={tags} />
        <div className='flex justify-between items-center mt-4'>
          <ProductPostedDate posted={posted} />
          <ProductReportButton />
        
          
        </div>
          <ProductGPSR product={hydratedProduct} />
      </ProductPageAccordion>
    </>
  );
};
