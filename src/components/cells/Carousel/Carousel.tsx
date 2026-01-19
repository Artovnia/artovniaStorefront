'use client';

import { Indicator } from '@/components/atoms';
import { ArrowLeftIcon, ArrowRightIcon } from '@/icons';
import { useRef, useState, useEffect } from 'react';
import tailwindConfig from '../../../../tailwind.config';

export const CustomCarousel = ({
  variant = 'light',
  items,
  align = 'start', // Not used anymore but kept for backwards compatibility
  theme = 'default', // Add theme prop for arrow styling
}: {
  variant?: 'light' | 'dark';
  items: React.ReactNode[];
  align?: 'center' | 'start' | 'end';
  theme?: 'default' | 'light' | 'dark';
}) => {
  // Use refs for direct DOM manipulation instead of carousel library
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(1); // Initialize to non-zero to enable right arrow
  
  // Responsive scroll amount for each button click (in pixels)
  const scrollAmount = 350; // Approximately one product card width
  
  // Calculate actual progress based on scroll position vs max scroll
  const calculateProgress = () => {
    if (maxScroll === 0) return 1; // If no scrolling needed, we're at 100%
    return Math.min(Math.max(scrollPosition / maxScroll, 0), 1);
  };
  
  // ✅ FIX: Initialize scroll state only - no layout-shifting state changes
  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      setMaxScroll(Math.max(0, scrollWidth - clientWidth));
    }
  }, [items]);
  
  const scrollNext = () => {
    if (!scrollContainerRef.current) return;
    
    const newPosition = Math.min(
      scrollPosition + scrollAmount, 
      scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth
    );
    
    scrollContainerRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    
    setScrollPosition(newPosition);
  };
  
  const scrollPrev = () => {
    if (!scrollContainerRef.current) return;
    
    const newPosition = Math.max(scrollPosition - scrollAmount, 0);
    
    scrollContainerRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });
    
    setScrollPosition(newPosition);
  };
  
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setScrollPosition(scrollLeft);
      setMaxScroll(Math.max(0, scrollWidth - clientWidth));
    }
  };
  
  // Arrow styling based on theme prop
  const getArrowStyles = () => {
    if (theme === 'light') {
      return {
        buttonClass: ' hover:bg-white/20 text-white ',
        iconColor: '#FFFFFF'
      };
    }
    return {
      buttonClass: ' hover:bg-[#BFB7AD] text-gray-800 ',
      iconColor: tailwindConfig.theme.extend.colors.primary
    };
  };
  
  const arrowStyles = getArrowStyles();
  
  const arrowColor = {
    light: tailwindConfig.theme.extend.colors.primary,
    dark: tailwindConfig.theme.extend.colors.tertiary,
  };

  return (
    <div className='w-full max-w-[1920px] mx-auto overflow-hidden'>
      {/* ✅ FIX: Always use grid layout - hide arrows on mobile with CSS */}
      {/* min-[868px]: breakpoint matches the previous 868px threshold */}
      <div className='block min-[868px]:grid min-[868px]:grid-cols-[auto_1fr_auto] min-[868px]:items-center min-[868px]:gap-2 sm:min-[868px]:gap-4'>
        
        {/* Left Arrow Column - Hidden on mobile via CSS */}
        {/* Arrow positioned at center of product image: 315px height ÷ 2 = 157.5px, minus arrow button height ÷ 2 = ~78px */}
        <div className='hidden min-[868px]:flex justify-center' style={{ marginTop: '-78px' }}>
          <button
            className={`${arrowStyles.buttonClass} rounded-full p-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={scrollPrev}
            disabled={scrollPosition <= 0}
            aria-label="Previous slide"
          >
            <ArrowLeftIcon color={arrowStyles.iconColor} size={25} />
          </button>
        </div>

        {/* Content Column - Scrollable container */}
        <div 
          className='overflow-x-auto scrollbar-hide mx-4'
          ref={scrollContainerRef}
          onScroll={handleScroll}
          style={{
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none', /* IE/Edge */
          }}
        >
          {/* Card container with proper spacing */}
          <div className='flex gap-6 pb-4'>
            {items.map((slide, index) => (
              <div 
                key={index} 
                className='flex-none w-[160px] sm:w-[252px]' 
              >
                {slide}
              </div>
            ))}
          </div>
        </div>

        {/* Right Arrow Column - Hidden on mobile via CSS */}
        {/* Arrow positioned at center of product image: 315px height ÷ 2 = 157.5px, minus arrow button height ÷ 2 = ~78px */}
        <div className='hidden min-[868px]:flex justify-center' style={{ marginTop: '-78px' }}>
          <button
            className={`${arrowStyles.buttonClass} rounded-full p-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
            onClick={scrollNext}
            disabled={scrollPosition >= maxScroll}
            aria-label="Next slide"
          >
            <ArrowRightIcon color={arrowStyles.iconColor} size={25} />
          </button>
        </div>
      </div>

      {/* Mobile Navigation - Only visible on mobile */}
      <div className='flex justify-between items-center mt-4 lg:hidden'>
        <div className='flex-1'>
          <Indicator
            variant={variant}
            maxStep={100}
            step={Math.ceil(calculateProgress() * 100)}
          />
        </div>
        <div className='flex gap-2'>
          <button
            className=' hover:bg-[#BFB7AD] rounded-full p-2  transition-all duration-200 disabled:opacity-50'
            onClick={scrollPrev}
            disabled={scrollPosition <= 0}
            aria-label="Previous slide"
          >
           
          </button>
        </div>
      </div>
    </div>
  );
};
