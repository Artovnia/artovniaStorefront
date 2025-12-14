'use client';
import { v4 as uuidv4 } from 'uuid';
import { PaginationButton } from '@/components/atoms';
import { useState } from 'react';

export const Pagination = ({
  pages,
  setPage,
  currentPage,
}: {
  pages: number;
  setPage: (page: number) => void;
  currentPage: number;
}) => {
  const [goToPage, setGoToPage] = useState('');

  const handleGoToPage = () => {
    const pageNum = parseInt(goToPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pages) {
      setPage(pageNum);
      setGoToPage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGoToPage();
    }
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    
    // First page
    buttons.push(
      <PaginationButton 
        key="page-1"
        isActive={currentPage === 1}
        onClick={() => currentPage !== 1 && setPage(1)}
      >
        1
      </PaginationButton>
    );

    // Dots or second page
    if (currentPage > 3) {
      buttons.push(
        <div key="dots-start" className="mx-1 flex items-center">...</div>
      );
    } else if (pages > 2 && currentPage <= 2) {
      // Only show page 2 if we have more than 2 pages and we're on page 1 or 2
      buttons.push(
        <PaginationButton
          key="page-2"
          isActive={currentPage === 2}
          onClick={() => setPage(2)}
        >
          2
        </PaginationButton>
      );
    }

    // Current page (if not 1, 2 or last page)
    if (currentPage > 2 && currentPage < pages - 1) {
      buttons.push(
        <PaginationButton key={`page-${currentPage}`} isActive>
          {currentPage}
        </PaginationButton>
      );
    }

    // Dots or second-to-last page
    if (currentPage < pages - 2) {
      buttons.push(
        <div key="dots-end" className="mx-1 flex items-center">...</div>
      );
    } else if (pages > 2 && currentPage >= pages - 1) {
      // Only show second-to-last page if we're near the end
      buttons.push(
        <PaginationButton
          key={`page-${pages-1}`}
          isActive={currentPage === pages - 1}
          onClick={() => setPage(pages - 1)}
        >
          {pages - 1}
        </PaginationButton>
      );
    }

    // Last page (if more than one page and not already shown as page 2)
    if (pages > 1 && pages !== 2) {
      buttons.push(
        <PaginationButton
          key={`page-${pages}`}
          isActive={currentPage === pages}
          onClick={() => currentPage !== pages && setPage(pages)}
        >
          {pages}
        </PaginationButton>
      );
    } else if (pages === 2) {
      // Special case: exactly 2 pages - show page 2 as last page
      buttons.push(
        <PaginationButton
          key="page-last-2"
          isActive={currentPage === 2}
          onClick={() => currentPage !== 2 && setPage(2)}
        >
          2
        </PaginationButton>
      );
    }

    return buttons;
  };

  return (
    <div className='flex items-center gap-2'>
      {/* Previous page button */}
      <PaginationButton
        isNavArrow
        disabled={currentPage === 1}
        onClick={() => currentPage > 1 && setPage(currentPage - 1)}
      >
        <span className="text-lg font-bold">&lsaquo;</span>
      </PaginationButton>

      {/* Page buttons */}
      <div className='flex items-center gap-1'>
        {renderPaginationButtons()}
      </div>

      {/* Next page button */}
      <PaginationButton
        isNavArrow
        disabled={currentPage === pages}
        onClick={() => currentPage < pages && setPage(currentPage + 1)}
      >
        <span className="text-lg font-bold">&rsaquo;</span>
      </PaginationButton>

      {/* Go to page input */}
      <div className='hidden md:flex items-center ml-4'>
        <span className='mr-2 text-sm font-instrument-sans'>Idź do strony:</span>
        <div className='flex relative ring-1 ring-[#3B3634] rounded-full overflow-hidden'>
          <input
            type="text"
            value={goToPage}
            onChange={(e) => setGoToPage(e.target.value.replace(/[^0-9]/g, ''))}
            onKeyPress={handleKeyPress}
            className='w-12 h-10 px-3 bg-primary text-sm focus:outline-none border-none'
          />
          <button 
            onClick={handleGoToPage}
            className='h-10 px-3 text-[#3B3634] hover:bg-[#BFB7AD] text-sm focus:outline-none border-none bg-transparent'
          >
            <span className="text-lg font-bold">&rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};
