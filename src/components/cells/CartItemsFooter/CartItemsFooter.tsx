import { convertToLocale } from '@/lib/helpers/money';
import { Loader } from '@/components/atoms/Loader/Loader';

export const CartItemsFooter = ({
  currency_code,
  price,
  sellerId,
}: {
  currency_code: string;
  price?: number;
  sellerId?: string;
}) => {
  const hasPrice = typeof price === 'number' && !isNaN(price);
  
  return (
    <div className='border rounded-sm p-4 flex items-center justify-between label-md'>
      <p className='text-secondary'>Dostawa</p>
      {hasPrice ? (
        <p>
          {convertToLocale({
            amount: price,
            currency_code,
          })}
        </p>
      ) : (
        <p className='text-sm text-gray-500 flex items-center gap-1'>
          <span>Obliczane w czasie zamówienia</span>
        </p>
      )}
    </div>
  );
};
