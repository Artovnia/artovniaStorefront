'use client';

import { HttpTypes } from '@medusajs/types';
import { HamburgerMenuIcon } from '@/icons';
import { useState } from 'react';
import { HierarchicalMobileMenu } from '@/components/cells/HierarchicalMobileMenu';
import { CountrySelector } from '@/components/cells/CountrySelector/CountrySelector';

export const MobileNavbar = ({
  categories,
}: {
  categories: HttpTypes.StoreProductCategory[];
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleOpenMenu = () => {
    setIsMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className='lg:hidden flex items-center gap-2'>
      <button 
        onClick={handleOpenMenu}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Otwórz menu"
      >
        <HamburgerMenuIcon />
      </button>
      
      {/* Country Selector for Mobile */}
      <div className="md:hidden">
        <CountrySelector />
      </div>
      
      <HierarchicalMobileMenu
        categories={categories}
        isOpen={isMenuOpen}
        onClose={handleCloseMenu}
      />
    </div>
  );
};
