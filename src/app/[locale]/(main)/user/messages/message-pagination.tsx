'use client';

import { useRouter } from 'next/navigation';
import { Pagination } from '@/components/cells/Pagination/Pagination';

export function MessagePagination({
  totalPages,
  currentPage,
}: {
  totalPages: number;
  currentPage: number;
}) {
  const router = useRouter();
  
  const handlePageChange = (page: number) => {
    router.push(`/user/messages?page=${page}`);
  };
  
  return (
    <div className="mt-8 flex justify-center">
      <Pagination 
        pages={totalPages} 
        currentPage={currentPage} 
        setPage={handlePageChange} 
      />
    </div>
  );
}
