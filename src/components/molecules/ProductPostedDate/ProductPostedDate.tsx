import { formatDistanceToNow } from 'date-fns';
import locale from 'date-fns/locale/pl';

export const ProductPostedDate = async ({
  posted,
}: {
  posted: string | null;
}) => {
  // Handle null/undefined dates to prevent "Invalid time value" error
  if (!posted) {
    return (
      <p className='label-md text-secondary'>
        Dodano:  Unknown
      </p>
    );
  }

  try {
    const postedDate = formatDistanceToNow(
      new Date(posted),
      { addSuffix: true, locale }
    );

    return (
      <p className='label-md text-secondary'>
        Dodano: {postedDate}
      </p>
    );
  } catch (error) {
    // Fallback if date parsing fails
    return (
      <p className='label-md text-secondary'>
        Dodano: Unknown
      </p>
    );
  }
};
