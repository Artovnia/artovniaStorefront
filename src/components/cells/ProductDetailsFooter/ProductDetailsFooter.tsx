import {
  ProductPostedDate,
  ProductReportButton,
  ProductTags,
  ProductPageAccordion,
} from '@/components/molecules';
import { ProductGPSR } from '@/components/molecules/ProductGPSR/ProductGPSR';
import { HttpTypes } from '@medusajs/types';

// Define the product tag type that matches what the component expects
type ProductTag = {
  id: string
  value: string
  created_at: string
  updated_at: string
}

export const ProductDetailsFooter = ({
  tags = [],
  posted,
  product,
}: {
  tags?: ProductTag[];
  posted: string | null;
  product: HttpTypes.StoreProduct;
}) => {
  return (
    <>
      <ProductPageAccordion heading="Szczegóły przedmiotu" defaultOpen={false}>
             Tagi: <ProductTags tags={tags} />
        <div className='flex justify-between items-center mt-4'>
          <ProductPostedDate posted={posted} />
          <ProductReportButton />
        
          
        </div>
          <ProductGPSR product={product} />
      </ProductPageAccordion>
    </>
  );
};
