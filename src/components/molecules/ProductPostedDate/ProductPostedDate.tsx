import { formatDistanceToNow } from 'date-fns';

export const ProductPostedDate = async ({
  posted,
}: {
  posted: string | null;
}) => {
  // Handle null/undefined dates to prevent "Invalid time value" error
  if (!posted) {
    return (
      <p className='label-md text-secondary'>
        Posted: Unknown
      </p>
    );
  }

  try {
    const postedDate = formatDistanceToNow(
      new Date(posted),
      { addSuffix: true }
    );

    return (
      <p className='label-md text-secondary'>
        Posted: {postedDate}
      </p>
    );
  } catch (error) {
    // Fallback if date parsing fails
    return (
      <p className='label-md text-secondary'>
        Posted: Unknown
      </p>
    );
  }
};
