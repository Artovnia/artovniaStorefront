import { Label } from '@/components/atoms';
import { HttpTypes } from '@medusajs/types';
import Link from 'next/link';

export const ProductTags = ({
  tags,
}: {
  tags: HttpTypes.StoreProductTag[];
}) => {
  return (
    <div className='flex gap-2 flex-wrap' itemProp="keywords">
      {tags.map(({ id, value }) => (
        <Link 
          key={id} 
          href={`/tags/${encodeURIComponent(value.toLowerCase())}`}
          itemProp="keywords"
          className="cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Label>{value}</Label>
        </Link>
      ))}
    </div>
  );
};
