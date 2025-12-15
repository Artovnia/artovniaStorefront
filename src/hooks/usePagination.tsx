import { useSearchParams } from 'next/navigation';
import useUpdateSearchParams from './useUpdateSearchParams';

export const usePagination = () => {
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();

  const currentPage = parseInt(
    searchParams.get('page') || '1'
  );

  const setPage = (page: string) => {
    updateSearchParams('page', page);
    
    // Scroll to top smoothly when page changes
    // Works on all devices (desktop, mobile, tablet)
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return { currentPage, setPage };
};
