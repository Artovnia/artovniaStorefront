import {
  ProductPostedDate,
  ProductReportButton,
  ProductTags,
} from '@/components/molecules';

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
}: {
  tags?: ProductTag[];
  posted: string | null;
}) => {
  return (
    <>
      <div className='p-4 border rounded-sm'>
        <ProductTags tags={tags} />
        <div className='flex justify-between items-center mt-4'>
          <ProductPostedDate posted={posted} />
          <ProductReportButton />
        </div>
      </div>
    </>
  );
};
