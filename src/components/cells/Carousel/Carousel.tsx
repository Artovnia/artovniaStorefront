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
  const [showArrows, setShowArrows] = useState(false);
  
  // Responsive scroll amount for each button click (in pixels)
  const scrollAmount = 350; // Approximately one product card width
  
  // Calculate actual progress based on scroll position vs max scroll
  const calculateProgress = () => {
    if (maxScroll === 0) return 1; // If no scrolling needed, we're at 100%
    return Math.min(Math.max(scrollPosition / maxScroll, 0), 1);
  };
  
  // Initialize scroll state and check window width on component mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth } = scrollContainerRef.current;
      setMaxScroll(Math.max(0, scrollWidth - clientWidth));
    }
    
    // Check window width for arrow visibility
    const checkWindowWidth = () => {
      setShowArrows(window.innerWidth >= 868);
    };
    
    checkWindowWidth();
    window.addEventListener('resize', checkWindowWidth);
    
    return () => window.removeEventListener('resize', checkWindowWidth);
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
      {/* Desktop Layout: Three-column grid with arrows outside content area */}
      <div className={`${showArrows ? 'grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4' : 'block'}`}>
        
        {/* Left Arrow Column - Only visible on desktop */}
        {/* Arrow positioned at center of product image: 315px height ÷ 2 = 157.5px, minus arrow button height ÷ 2 = ~78px */}
        {showArrows && (
          <div className='flex justify-center' style={{ marginTop: '-78px' }}>
            <button
              className={`${arrowStyles.buttonClass} rounded-full p-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={scrollPrev}
              disabled={scrollPosition <= 0}
              aria-label="Previous slide"
            >
              <ArrowLeftIcon color={arrowStyles.iconColor} size={25} />
            </button>
          </div>
        )}

        {/* Content Column - Scrollable container */}
        <div 
          className='overflow-x-auto scrollbar-hide'
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

        {/* Right Arrow Column - Only visible on desktop */}
        {/* Arrow positioned at center of product image: 315px height ÷ 2 = 157.5px, minus arrow button height ÷ 2 = ~78px */}
        {showArrows && (
          <div className='flex justify-center' style={{ marginTop: '-78px' }}>
            <button
              className={`${arrowStyles.buttonClass} rounded-full p-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={scrollNext}
              disabled={scrollPosition >= maxScroll}
              aria-label="Next slide"
            >
              <ArrowRightIcon color={arrowStyles.iconColor} size={25} />
            </button>
          </div>
        )}
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
